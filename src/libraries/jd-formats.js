/**
 * RE-JD — normaliza la respuesta de JDownloader a una lista
 * que el bot le puede mostrar al usuario en WhatsApp.
 *
 * JD2 devuelve paquetes con enlaces; cada enlace trae, según el hoster,
 * nombre, tamaño, host y a veces calidad/resolución. Aquí se deja en un
 * formato único para que el bot pregunte: "¿qué archivo quieres y en
 * qué calidad?".
 *
 * Formato de salida por variante:
 *   { variantId, nombre, extension, tamanoBytes, tamanoTexto,
 *     calidad, host, url }
 * La calidad puede venir vacía: no todos los hosters la dan. En ese
 * caso el bot muestra el archivo sin calidad, no inventa una.
 */

export function humanSize (bytes) {
  const n = Number(bytes) || 0
  if (n <= 0) return 'tamaño desconocido'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = n
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`
}

export function extensionOf (name = '') {
  const match = String(name).match(/\.([a-zA-Z0-9]{1,5})$/)
  return match ? match[1].toLowerCase() : ''
}

/** Intenta sacar la calidad/resolución del nombre, p. ej. 720p, 1080p, 4K. */
export function qualityOf (name = '') {
  const text = String(name)
  const match = text.match(/(\b(2160|1440|1080|720|480|360)p\b|\b4K\b|\b8K\b)/i)
  return match ? match[1].toUpperCase() : ''
}

export function normalizeLink (link) {
  if (!link || typeof link !== 'object') return null
  const nombre = link.name || link.url || 'archivo sin nombre'
  return {
    variantId: link.uuid || link.url || nombre,
    nombre,
    extension: extensionOf(nombre),
    tamanoBytes: Number(link.bytesTotal || link.size || 0) || 0,
    tamanoTexto: humanSize(link.bytesTotal || link.size || 0),
    calidad: qualityOf(nombre),
    host: link.host || '',
    url: link.url || ''
  }
}

/** Recibe la lista cruda de enlaces de JD2 y devuelve variantes únicas. */
export function normalizeVariants (links) {
  const list = Array.isArray(links) ? links : (links?.data || [])
  const seen = new Set()
  const out = []
  for (const link of list) {
    const v = normalizeLink(link)
    if (!v) continue
    const key = `${v.nombre}|${v.tamanoBytes}|${v.url}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(v)
  }
  // Los más grandes primero, que suelen ser la mejor calidad.
  out.sort((a, b) => b.tamanoBytes - a.tamanoBytes)
  return out
}

/** Texto corto para mostrar la lista en WhatsApp, numerada. */
export function variantsText (variants) {
  if (!variants || variants.length === 0) {
    return 'No encontré formatos para ese archivo. Prueba pegando el enlace directo.'
  }
  return variants.map((v, i) => {
    const calidad = v.calidad ? ` · ${v.calidad}` : ''
    const host = v.host ? ` · ${v.host}` : ''
    return `${i + 1}. ${v.nombre} (${v.tamanoTexto}${calidad}${host})`
  }).join('\n')
}

export default normalizeVariants
