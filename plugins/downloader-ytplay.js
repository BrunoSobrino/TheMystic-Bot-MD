import fs from 'fs'
import yts from 'yt-search'
import { searchMusic, getAudioBuffer, getVideoBuffer, tagAudioMp3 } from '../src/libraries/ytmusic.js'
import { generateWAMessageFromContent } from 'baileys'

// Miniatura del video (YouTube ya la sirve en JPEG): se baja y se pasa tal
// cual como jpegThumbnail. Sin sharp (no está instalado en el bot) y sin
// redimensionar.
const getThumb = async (source) => {
  try {
    let buffer
    if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
      const res = await fetch(source, { headers: { 'user-agent': 'Mozilla/5.0' } })
      if (!res.ok) return null
      buffer = Buffer.from(await res.arrayBuffer())
    } else if (Buffer.isBuffer(source)) {
      buffer = source
    } else {
      return null
    }
    return buffer
  } catch {
    return null
  }
}

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_ytplay

  if (!text) throw `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]}`
  const result = await searchMusic(args.join(' '), 'videos')
  if (!result) return conn.reply(m.chat, tradutor.texto6, m)
  const body = `${tradutor.texto2[0]} ${result.title}\n${tradutor.texto2[1]} ${result.ago || '?'}\n${tradutor.texto2[2]} ${result.duration?.timestamp || '?'}\n${tradutor.texto2[3]} ${formatNumber(result.views || 0)}\n${tradutor.texto2[4]} ${result.author?.name || '?'}\n${tradutor.texto2[5]} ${result.videoId}\n${tradutor.texto2[6]} ${result.type}\n${tradutor.texto2[7]} ${result.url}\n${tradutor.texto2[8]} ${result.author?.url || ''}\n\n${tradutor.texto2[9]} ${tradutor.texto2[10]}`.trim()

  // Se guardan los metadatos del video para etiquetar el audio cuando
  // toquen el botón (el botón solo trae el videoId).
  global.ytplayMeta = global.ytplayMeta || {};
  global.ytplayMeta[result.videoId] = { title: result.title, artist: result.author?.name, thumbnail: result.thumbnail, url: result.url };
  const _metaIds = Object.keys(global.ytplayMeta);
  if (_metaIds.length > 50) delete global.ytplayMeta[_metaIds[0]];

  const thumb = await getThumb(result.thumbnail)
  const buttons = [
    { buttonId: `ytplay_audio_${result.videoId}`, buttonText: { displayText: `🎵 ${tradutor.texto3}` }, type: 1 },
    { buttonId: `ytplay_video_${result.videoId}`, buttonText: { displayText: `🎬 ${tradutor.texto4}` }, type: 1 }
  ]
  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        buttonsMessage: {
          locationMessage: {
            degreesLatitude: 0,
            degreesLongitude: 0,
            name: result.title.slice(0, 60),
            address: `${result.author?.name || ''} • ${result.duration?.timestamp || ''}`,
            jpegThumbnail: thumb || undefined
          },
          contentText: body,
          footerText: tradutor.texto5,
          buttons,
          headerType: 6,
          contextInfo: { mentionedJid: [m.sender] }
        }
      }
    }
  }, { quoted: m, userJid: conn.user.id })
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

// Al tocar un botón llega un buttonsResponseMessage con selectedButtonId.
// Se atiende aquí (handler.before) y se descarga directo con el videoId,
// sin volver a buscar. El audio y el video usan la misma cadena de
// .play/.play2 (ab-downloader) de src/libraries/ytmusic.js.
handler.before = async function (m, { conn }) {
  const selectedId = m?.msg?.selectedButtonId
  if (!selectedId || (!selectedId.startsWith('ytplay_audio_') && !selectedId.startsWith('ytplay_video_'))) return false
  const videoId = selectedId.replace(/^ytplay_(audio|video)_/, '')
  const isAudio = selectedId.startsWith('ytplay_audio_')
  const datas = global
  const idioma = datas.db.data.users[m.sender]?.language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_ytplay
  try {
    if (isAudio) {
      let meta = (global.ytplayMeta || {})[videoId];
      if (!meta) {
        const info = await yts({ videoId }).catch(() => null);
        meta = info ? { title: info.title, artist: info.author?.name, thumbnail: info.thumbnail, url: info.url } : { title: videoId };
      }
      const { buffer, mimeType } = await getAudioBuffer(videoId);
      const tagged = await tagAudioMp3(buffer, mimeType, meta);
      await conn.sendMessage(m.chat, { audio: tagged, mimetype: mimeType }, { quoted: m });
    } else {
      const { buffer, mimeType } = await getVideoBuffer(videoId)
      await conn.sendMessage(m.chat, { video: buffer, mimetype: mimeType, fileName: `${videoId}.mp4` }, { quoted: m })
    }
  } catch (error) {
    console.log('❌ Error en ytplay:', error)
    await conn.reply(m.chat, tradutor.texto6, m)
  }
  return true
}

handler.help = ['ytplay']
handler.tags = ['downloader']
handler.command = /^(ytplay)$/i

export default handler

function formatNumber(num) {
  return num.toLocaleString()
}
