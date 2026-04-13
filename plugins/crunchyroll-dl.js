/**
 * crunchyroll-dl.js — Plugin descargador de Crunchyroll para KanaArima-MD
 * Backend: multi-downloader-nx (mdnx) vía CLI
 *
 * ╔══════════════════════════════════════════════════════╗
 * ║  .anilogin <email> <pass>  → Autenticar cuenta       ║
 * ║  /ani <url> [parámetros]   → Descargar episodio      ║
 * ║  .dllist                   → Info de parámetros      ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * Requisitos (Termux):
 *   pkg install nodejs ffmpeg
 *   git clone https://github.com/anidl/multi-downloader-nx
 *   cd multi-downloader-nx && npm install && npm run build
 *
 *   Ajusta MDNX_PATH si tu ruta es diferente.
 */

import { spawn }     from 'child_process';
import path          from 'path';
import fs            from 'fs';

// ─────────────────────────────────────────────────────────
//  CONFIGURACIÓN
// ─────────────────────────────────────────────────────────

const MDNX_PATH = process.env.MDNX_PATH
  || path.join(
       process.env.HOME || '/data/data/com.termux/files/home',
       'multi-downloader-nx/lib/index.js'
     );

const DOWNLOAD_TMP = process.env.MDNX_DL_DIR
  || path.join(
       process.env.HOME || '/data/data/com.termux/files/home',
       'ani-tmp'
     );

// Calidades disponibles (índice 1-5)
const QUALITY_MAP = {
  1: '240',
  2: '360',
  3: '480',
  4: '720',
  5: '1080',
};

// Idiomas válidos reconocidos por mdnx
const VALID_LANGS = new Set([
  'all','none','en','en-IN','es-419','es-ES','pt-BR','pt-PT',
  'fr','de','ar','it','ru','tr','hi','zh','zh-CN','zh-TW','ko',
  'ca-ES','pl-PL','th-TH','ta-IN','ms-MY','vi-VN','id-ID','te-IN',
  'ja','eng','spa','spa-419','spa-ES','por','fra','deu','ara-ME',
  'ara','ita','rus','tur','hin','cmn','zho','chi','kor','cat','pol',
  'tha','tam','may','vie','ind','tel','jpn',
]);

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────

function mdnxExists() {
  return fs.existsSync(MDNX_PATH);
}

function ensureTmpDir() {
  if (!fs.existsSync(DOWNLOAD_TMP))
    fs.mkdirSync(DOWNLOAD_TMP, { recursive: true });
}

/**
 * Extrae el episodeId de una URL de Crunchyroll.
 * Formatos soportados:
 *   https://www.crunchyroll.com/watch/XXXXXXXXX/slug
 *   https://www.crunchyroll.com/es/watch/XXXXXXXXX/slug
 *   https://www.crunchyroll.com/es-419/watch/XXXXXXXXX/slug
 */
function extractEpisodeId(url) {
  const match = url.match(/\/watch\/([A-Z0-9]{5,})/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Lanza mdnx con los args dados.
 * onData(chunk) se llama en tiempo real con la salida stdout.
 * Devuelve Promise<{ stdout, stderr, code }>.
 */
function runMdnx(args, onData = null) {
  return new Promise((resolve) => {
    if (!mdnxExists()) {
      return resolve({
        stdout: '',
        stderr: `multi-downloader-nx no encontrado en:\n${MDNX_PATH}`,
        code: 127,
      });
    }

    const env = {
      ...process.env,
      contentDirectory: path.dirname(MDNX_PATH),
      CONTENT_DIR: DOWNLOAD_TMP,
    };

    const child = spawn(
      'node',
      [MDNX_PATH, '--service', 'crunchy', ...args],
      { env, cwd: path.dirname(MDNX_PATH) }
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => {
      const chunk = d.toString();
      stdout += chunk;
      if (onData) onData(chunk);
    });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => resolve({ stdout, stderr, code }));
    child.on('error', (err) => resolve({ stdout, stderr: err.message, code: -1 }));
  });
}

/**
 * Encuentra el archivo de video más reciente en DOWNLOAD_TMP.
 */
function findLatestFile(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(f => /\.(mkv|mp4|m4v)$/i.test(f))
    .map(f => ({ f, mt: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mt - a.mt);
  return files.length ? path.join(dir, files[0].f) : null;
}

/**
 * Parsea los parámetros del comando /ani.
 * Retorna { url, episodeId, dubLang, dlsubs, hslang, quality, mp4, sendAsDoc, errors }
 */
function parseAniArgs(rawText) {
  const result = {
    url:       null,
    episodeId: null,
    dubLang:   'jpn',           // default
    dlsubs:    ['es-419','all'],// default
    hslang:    null,
    quality:   1080,            // default 1080p
    mp4:       false,
    sendAsDoc: false,
    errors:    [],
  };

  const tokens = rawText.match(/"[^"]*"|'[^']*'|\S+/g) || [];
  let i = 0;

  while (i < tokens.length) {
    const tok = tokens[i];

    // URL de Crunchyroll
    if (/^https?:\/\/(?:www\.)?crunchyroll\.com/.test(tok)) {
      result.url = tok;
      result.episodeId = extractEpisodeId(tok);
      i++;
      continue;
    }

    // --dubLang <lang>
    if (tok === '--dubLang' && tokens[i + 1]) {
      const lang = tokens[++i];
      if (VALID_LANGS.has(lang)) {
        result.dubLang = lang;
      } else {
        result.errors.push(`Idioma de audio inválido: *${lang}*`);
      }
      i++;
      continue;
    }

    // --dlsubs <lang> [lang2 ...]  (hasta el siguiente flag o "doc")
    if (tok === '--dlsubs') {
      const subs = [];
      i++;
      while (i < tokens.length && !tokens[i].startsWith('-') && tokens[i].toLowerCase() !== 'doc') {
        const lang = tokens[i];
        if (VALID_LANGS.has(lang)) {
          subs.push(lang);
        } else {
          result.errors.push(`Idioma de subtítulo inválido: *${lang}*`);
        }
        i++;
      }
      if (subs.length) result.dlsubs = subs;
      continue;
    }

    // --hslang <lang>
    if (tok === '--hslang' && tokens[i + 1]) {
      const lang = tokens[++i];
      if (VALID_LANGS.has(lang)) {
        result.hslang = lang;
      } else {
        result.errors.push(`Idioma de hardsub inválido: *${lang}*`);
      }
      i++;
      continue;
    }

    // -q <1-5>
    if (tok === '-q' && tokens[i + 1]) {
      const qNum = parseInt(tokens[++i], 10);
      if (qNum >= 1 && qNum <= 5) {
        result.quality = parseInt(QUALITY_MAP[qNum], 10);
      } else {
        result.errors.push(`Calidad inválida: *${tokens[i]}*. Usa -q 1 a 5.`);
      }
      i++;
      continue;
    }

    // --mp4
    if (tok === '--mp4') {
      result.mp4 = true;
      i++;
      continue;
    }

    // doc → enviar como documento
    if (tok.toLowerCase() === 'doc') {
      result.sendAsDoc = true;
      i++;
      continue;
    }

    i++;
  }

  return result;
}

// ─────────────────────────────────────────────────────────
//  COMANDO: .anilogin <email> <pass>
// ─────────────────────────────────────────────────────────

let handlerLogin = async (m, { conn, args, isOwner }) => {
  if (!isOwner)
    return m.reply('⛔ Solo el owner puede autenticar Crunchyroll.');
  if (!mdnxExists())
    return m.reply(`❌ mdnx no encontrado:\n\`${MDNX_PATH}\``);
  if (args.length < 2)
    return m.reply('Uso: *.anilogin <email> <contraseña>*');

  const [email, ...rest] = args;
  const password = rest.join(' ');

  await m.reply('🔐 *Autenticando en Crunchyroll...*');

  const { stdout, stderr, code } = await runMdnx([
    '--auth',
    '--username', email,
    '--password', password,
    '--silentAuth',
    '--locale', 'es-419',
  ]);

  const out = stdout + stderr;

  if (
    code !== 0 ||
    /Authentication failed|invalid_grant|Incorrect credentials/i.test(out)
  ) {
    const snippet = out
      .split('\n')
      .find(l => /error|fail|invalid|incorrect/i.test(l))
      ?.trim() || out.slice(0, 300);
    return m.reply(`❌ *Error de autenticación*\n${snippet}`);
  }

  const countryMatch = stdout.match(/Your Country:\s*(.+)/i);
  const country      = countryMatch ? ` (${countryMatch[1].trim()})` : '';

  return m.reply(
    `✅ *Login exitoso${country}*\n` +
    `Token guardado. Ya puedes usar */ani <url>*`
  );
};
handlerLogin.command = /^anilogin$/i;
handlerLogin.tags    = ['crunchyroll'];
handlerLogin.help    = ['anilogin <email> <pass>'];
handlerLogin.owner   = true;


// ─────────────────────────────────────────────────────────
//  COMANDO: /ani <url> [opciones]
// ─────────────────────────────────────────────────────────

let handlerAni = async (m, { conn, text }) => {
  if (!text?.trim())
    return m.reply(
      '❌ Falta la URL.\n' +
      'Uso: */ani <url_crunchyroll> [parámetros]*\n\n' +
      'Escribe *.dllist* para ver todos los parámetros.'
    );

  const opts = parseAniArgs(text.trim());

  if (!opts.url)
    return m.reply(
      '❌ No se encontró una URL de Crunchyroll en el comando.\n' +
      'Ej: `/ani https://www.crunchyroll.com/watch/XXXXXXXXX/slug --dubLang jpn -q 4 --mp4`'
    );

  if (!opts.episodeId)
    return m.reply(
      '❌ No se pudo extraer el ID del episodio.\n' +
      'Asegúrate de copiar la URL completa:\n' +
      '`https://www.crunchyroll.com/watch/XXXXXXXXX/nombre-del-episodio`'
    );

  if (opts.errors.length)
    return m.reply(
      `⚠️ *Errores en los parámetros:*\n` +
      opts.errors.map(e => `• ${e}`).join('\n')
    );

  ensureTmpDir();

  // ── Construir args para mdnx ─────────────────────────────
  const dlArgs = [
    '--extid', opts.episodeId,
    '--dubLang', opts.dubLang,
    '--locale', 'es-419',
    '-q', opts.quality.toString(),
    '--fileName',
    path.join(
      DOWNLOAD_TMP,
      '[CR] ${showTitle} - S${season}E${episode} [${height}p]'
    ),
    '--force', 'Y',
  ];

  // Hardsub tiene prioridad sobre softsubs
  if (opts.hslang) {
    dlArgs.push('--hslang', opts.hslang);
    dlArgs.push('--dlsubs', 'none');
  } else {
    dlArgs.push('--dlsubs', opts.dlsubs.join(','));
  }

  if (opts.mp4) dlArgs.push('--mp4');

  // ── Mensaje de inicio ────────────────────────────────────
  const subsLine = opts.hslang
    ? `🔒 Hardsub: \`${opts.hslang}\``
    : `💬 Softsubs: \`${opts.dlsubs.join(', ')}\``;

  await m.reply(
    `⬇️ *Descargando...*\n\n` +
    `🔗 ID: \`${opts.episodeId}\`\n` +
    `🗣️ Audio: \`${opts.dubLang}\`\n` +
    `${subsLine}\n` +
    `📺 Calidad: \`${opts.quality}p\`\n` +
    `📦 Formato: \`${opts.mp4 ? 'MP4' : 'MKV'}\`\n` +
    `📎 Envío: \`${opts.sendAsDoc ? 'Documento' : 'Video'}\`\n\n` +
    `_Esto puede tardar varios minutos..._`
  );

  // ── Ejecutar ──────────────────────────────────────────────
  const { stdout, stderr, code } = await runMdnx(dlArgs);
  const allOut = stdout + stderr;

  // ── Errores de sesión ─────────────────────────────────────
  if (/Authentication required|Token Refresh Failed|invalid_grant|Anonymous/i.test(allOut)) {
    return m.reply(
      '🔒 *Sesión expirada o no autenticada.*\n' +
      'Usa *.anilogin <email> <pass>* para iniciar sesión.'
    );
  }

  // ── Errores de descarga ───────────────────────────────────
  if (code !== 0 || /Unable to download|Request FAILED|No streams found/i.test(allOut)) {
    const errLine = allOut
      .split('\n')
      .find(l => /Unable|FAILED|No streams|Error/i.test(l))
      ?.trim() || allOut.slice(-400);
    return m.reply(`❌ *Error en la descarga:*\n\`\`\`\n${errLine}\n\`\`\``);
  }

  // ── Buscar archivo ────────────────────────────────────────
  const filePath = findLatestFile(DOWNLOAD_TMP);

  if (!filePath) {
    return m.reply(
      '⚠️ Proceso finalizado pero no se encontró el archivo.\n' +
      `Dir: \`${DOWNLOAD_TMP}\`\n\n` +
      `Salida:\n\`\`\`\n${stdout.slice(-600)}\n\`\`\``
    );
  }

  const sizeMB = (fs.statSync(filePath).size / 1024 / 1024).toFixed(1);
  const fname  = path.basename(filePath);

  await m.reply(`✅ *Listo* — ${fname} (${sizeMB} MB)\n📤 Enviando...`);

  try {
    const buf      = fs.readFileSync(filePath);
    const mimetype = filePath.endsWith('.mp4') ? 'video/mp4' : 'video/x-matroska';
    const caption  = `🎬 *${fname}*\n_KanaArima-MD_`;

    if (opts.sendAsDoc) {
      await conn.sendMessage(m.chat,
        { document: buf, mimetype, fileName: fname, caption },
        { quoted: m }
      );
    } else {
      await conn.sendMessage(m.chat,
        { video: buf, mimetype, fileName: fname, caption },
        { quoted: m }
      );
    }

    try { fs.unlinkSync(filePath); } catch (_) {}

  } catch (sendErr) {
    await m.reply(
      `⚠️ *No se pudo enviar* (${sizeMB} MB — quizás demasiado grande).\n` +
      `Archivo guardado en:\n\`${filePath}\``
    );
  }
};
handlerAni.command = /^\/?ani$/i;   // acepta /ani y .ani
handlerAni.tags    = ['crunchyroll'];
handlerAni.help    = ['ani <url> [opts]'];


// ─────────────────────────────────────────────────────────
//  COMANDO: .dllist
// ─────────────────────────────────────────────────────────

let handlerDllist = async (m) => {
  return m.reply(
`🍥 *Crunchyroll Downloader — Parámetros*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 *Login*
  *.anilogin* <email> <contraseña>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 *Descarga*
  */ani* <link_crunchyroll> [parámetros]

  ➪ *--dubLang* <idioma>  ← Audio
    Default: \`jpn\`

  ➪ *--dlsubs* <idioma(s)>  ← Soft-subs
    Default: \`es-419 all\`
    _(no compatible con --hslang)_

  ➪ *--hslang* <idioma>  ← Hard-subs quemados
    _(reemplaza --dlsubs)_

  ➪ *-q* <1-5>  ← Calidad
    [1] 428×240   [2] 640×360   [3] 848×480
    [4] 1280×720  [5] 1920×1080 ← default

  ➪ *--mp4*  ← Formato MP4 (sin = MKV)

  ➪ *doc*  ← Enviar como documento

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 *Idiomas disponibles*
\`all, none, en, es-419, es-ES, pt-BR,
pt-PT, fr, de, ar, it, ru, tr, hi, zh,
ko, ja, jpn, spa, spa-419, spa-ES, eng,
por, fra, deu, ara, ita, rus, tur...\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *Ejemplos*

▸ Doblaje lat, 720p, MP4 como doc:
\`/ani https://crunchyroll.com/es/watch/XXXX/slug --dubLang spa-ES -q 4 --mp4 doc\`

▸ Español latino, 1080p:
\`/ani https://crunchyroll.com/watch/XXXX/slug --dubLang spa-419 -q 5 --mp4\`

▸ Japonés + hardsub español, 720p, doc:
\`/ani https://crunchyroll.com/watch/XXXX/slug --dubLang jpn --hslang es-419 -q 4 --mp4 doc\``
  );
};
handlerDllist.command = /^dllist$/i;
handlerDllist.tags    = ['crunchyroll'];
handlerDllist.help    = ['dllist — parámetros de descarga'];


export { handlerLogin, handlerAni, handlerDllist };
export default handlerAni;
