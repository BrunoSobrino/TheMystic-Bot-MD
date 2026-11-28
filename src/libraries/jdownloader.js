/**
 * RE-JD — cliente de la API local de JDownloader 2.
 *
 * Idea de Rey: el bot NO descarga nada directo. Le pide a este servicio
 * (que corre junto a JDownloader 2 en su servidor) el nombre de un archivo
 * o un enlace; el servidor busca o usa el enlace, captura los formatos
 * disponibles y le responde al bot; el bot le pregunta al usuario en
 * WhatsApp qué archivo quiere y en qué calidad.
 *
 * Endpoints usados (API local de JD2, plugin Remote Control / API, por
 * defecto en http://127.0.0.1:3129):
 *   POST /linkgrabberv2/addLinks        { links, packageName, ... }
 *   POST /linkgrabberv2/queryPackages   { packageUUIDs, ... }
 *   POST /linkgrabberv2/queryLinks      { packageUUIDs, ... }
 *   POST /linkgrabberv2/moveToDownloadlist { linkIds, packageIds }
 *   POST /linkgrabberv2/removeLinks     { linkIds, packageIds }
 *   POST /linkgrabberv2/cleanup         { mode, ... }
 *   POST /downloadsV2/queryLinks        { ... }
 *   POST /downloadsV2/queryPackages     { ... }
 *   POST /downloadsV2/start
 *   POST /downloadsV2/stop
 *
 * ESTADO: prototipo sin probar contra un JD2 real. Los endpoints de
 * arriba son los documentados de la API local de JD2, pero hay que
 * verificarlos contra el JD2 del servidor de Rey (versión, plugin
 * Remote Control activado, puerto). Si un endpoint cambia de nombre,
 * se cambia en un solo lugar: JD_ENDPOINTS.
 *
 * JDownloader es Java y pesado en RAM/disco: corre en un proceso
 * aparte del bot, nunca en el mismo proceso. Esta librería solo habla
 * por HTTP con él.
 */

const DEFAULT_TIMEOUT_MS = 30_000

export const JD_ENDPOINTS = {
  addLinks: '/linkgrabberv2/addLinks',
  queryPackages: '/linkgrabberv2/queryPackages',
  queryLinks: '/linkgrabberv2/queryLinks',
  moveToDownloadlist: '/linkgrabberv2/moveToDownloadlist',
  removeLinks: '/linkgrabberv2/removeLinks',
  cleanupLinkgrabber: '/linkgrabberv2/cleanup',
  queryDownloads: '/downloadsV2/queryLinks',
  queryDownloadPackages: '/downloadsV2/queryPackages',
  startDownloads: '/downloadsV2/start',
  stopDownloads: '/downloadsV2/stop'
}

export function loadConfig (env = process.env) {
  const maxFileMB = Number(env.MAX_FILE_MB || 500)
  return {
    apiUrl: (env.JD_API_URL || 'http://127.0.0.1:3129').replace(/\/$/, ''),
    user: env.JD_API_USER || '',
    password: env.JD_API_PASSWORD || '',
    downloadDir: env.DOWNLOAD_DIR || './downloads',
    maxFileBytes: Number.isFinite(maxFileMB) && maxFileMB > 0 ? maxFileMB * 1024 * 1024 : 0,
    timeoutMs: Number(env.REQUEST_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
    downloadTimeoutMs: Number(env.DOWNLOAD_TIMEOUT_MS || 3_600_000)
  }
}

/** Cola simple: una descarga a la vez por chat, para no saturar JD2 ni WhatsApp. */
export class ChatQueue {
  constructor () {
    this.running = new Map() // chatId -> Promise
  }

  /** Encola fn para un chat; las llamadas del mismo chat se ejecutan en orden. */
  enqueue (chatId, fn) {
    const previous = this.running.get(chatId) || Promise.resolve()
    const next = previous.then(fn, fn)
    this.running.set(chatId, next)
    next.finally(() => {
      if (this.running.get(chatId) === next) this.running.delete(chatId)
    })
    return next
  }

  isBusy (chatId) {
    return this.running.has(chatId)
  }
}

export class JDownloaderClient {
  /**
   * @param {object} [config] - ver loadConfig(). `fetchFn` permite inyectar
   * un fetch de pruebas (stub) sin tocar un JD2 real.
   */
  constructor (config = {}, fetchFn = globalThis.fetch) {
    this.config = { ...loadConfig(), ...config }
    this.fetchFn = fetchFn
    this.queue = new ChatQueue()
  }

  headers () {
    const headers = { 'Content-Type': 'application/json' }
    if (this.config.user) {
      headers.Authorization = 'Basic ' + Buffer.from(
        `${this.config.user}:${this.config.password}`
      ).toString('base64')
    }
    return headers
  }

  async call (endpoint, body = {}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs)
    try {
      const res = await this.fetchFn(this.config.apiUrl + endpoint, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(body),
        signal: controller.signal
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`JD2 ${endpoint} -> HTTP ${res.status}: ${text.slice(0, 200)}`)
      }
      const data = await res.json().catch(() => null)
      return data
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(`JD2 ${endpoint}: tiempo agotado (${this.config.timeoutMs} ms)`)
      }
      throw err
    } finally {
      clearTimeout(timer)
    }
  }

  /** Salud del servicio: JD2 responde a una consulta vacía del linkgrabber. */
  async health () {
    try {
      await this.call(JD_ENDPOINTS.queryPackages, { packageUUIDs: [] })
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  /**
   * Pide a JD2 que analice un enlace o un nombre.
   * - Si `input` es un enlace (http/https), JD2 lo analiza directo.
   * - Si es un nombre, JD2 NO busca por nombre por sí solo: el servidor
   *   debe resolverlo antes (ver docs/FLUJO.md, "búsqueda por nombre").
   *   Aquí se manda tal cual y se devuelve lo que JD2 encuentre; si JD2
   *   no reconoce el texto, devuelve un paquete vacío y el bot debe
   *   decirle al usuario que pegue el enlace.
   * Devuelve { packageName, variants } donde variants ya viene
   * normalizado por lib/formats.js.
   */
  async ask (input, { packageName = null, chatId = 'jd' } = {}) {
    const trimmed = String(input || '').trim()
    if (!trimmed) throw new Error('Falta el nombre o el enlace del archivo.')
    const name = packageName || `RE-JD ${chatId} ${Date.now()}`
    await this.call(JD_ENDPOINTS.addLinks, {
      links: trimmed,
      packageName: name,
      autostart: false,
      deepDecrypt: true,
      priority: 'DEFAULT',
      extractPassword: '',
      downloadPassword: '',
      destinationFolder: this.config.downloadDir,
      overwritePackagizerEnabled: false
    })
    // JD2 analiza el enlace de forma asíncrona: se espera un poco y se
    // consulta el linkgrabber hasta que aparezcan variantes o se agote.
    const deadline = Date.now() + this.config.timeoutMs
    let last = { packages: [], links: [] }
    while (Date.now() < deadline) {
      const packages = await this.call(JD_ENDPOINTS.queryPackages, {})
      const pkg = (packages?.data || packages || []).find(
        (p) => p.name === name || (p.name || '').includes(name)
      )
      if (pkg) {
        const links = await this.call(JD_ENDPOINTS.queryLinks, {
          packageUUIDs: [pkg.uuid]
        })
        const list = links?.data || links || []
        if (list.length > 0) {
          last = { packages, links: list, package: pkg }
          break
        }
        last = { packages, links: list, package: pkg }
      }
      await new Promise((r) => setTimeout(r, 2000))
    }
    return last
  }

  /**
   * Descarga la variante elegida por el usuario (por su linkId) y espera
   * a que termine o se agote el tiempo. Encola por chat: una a la vez.
   * Devuelve { filePath, bytesTotal } o lanza error.
   */
  async download (chatId, { linkIds, packageIds = [], fileName }) {
    return this.queue.enqueue(chatId, async () => {
      if (!Array.isArray(linkIds) || linkIds.length === 0) {
        throw new Error('Falta elegir una variante para descargar.')
      }
      await this.call(JD_ENDPOINTS.moveToDownloadlist, { linkIds, packageIds })
      await this.call(JD_ENDPOINTS.startDownloads, {})
      const deadline = Date.now() + this.config.downloadTimeoutMs
      while (Date.now() < deadline) {
        const downloads = await this.call(JD_ENDPOINTS.queryDownloads, {})
        const list = downloads?.data || downloads || []
        const mine = list.filter((d) => linkIds.includes(d.uuid))
        const done = mine.filter((d) => d.finished === true)
        if (mine.length > 0 && done.length === mine.length) {
          const total = done.reduce((acc, d) => acc + (d.bytesTotal || 0), 0)
          if (this.config.maxFileBytes > 0 && total > this.config.maxFileBytes) {
            throw new Error(
              `El archivo pesa ${Math.round(total / 1024 / 1024)} MB, más que el límite de ${Math.round(this.config.maxFileBytes / 1024 / 1024)} MB.`
            )
          }
          return { filePath: done[0].saveTo || this.config.downloadDir, bytesTotal: total }
        }
        await new Promise((r) => setTimeout(r, 5000))
      }
      throw new Error('La descarga no terminó en el tiempo límite.')
    })
  }

  /** Limpia el linkgrabber y la lista de descargas terminadas. */
  async cleanup () {
    await this.call(JD_ENDPOINTS.cleanupLinkgrabber, { mode: 'REMOVE_ALL' }).catch(() => null)
  }
}

export default JDownloaderClient
