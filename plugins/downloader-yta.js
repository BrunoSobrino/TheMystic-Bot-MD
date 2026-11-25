import fs from 'fs'
import yts from 'yt-search'
import { searchMusic, getAudioBuffer, tagAudioMp3 } from '../src/libraries/ytmusic.js'

let limit = 50

const extractVideoId = (link) => {
  const m = String(link || '').match(/(?:[?&]v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/)
  return m ? (m[1] || m[2] || m[3] || m[4]) : null
}

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_yta

  if (!args[0]) throw tradutor.texto8

  let videoId = ''
  let title = ''
  let meta = null
  if (args[0].includes('you')) {
    videoId = extractVideoId(args[0])
  } else {
    const index = parseInt(args[0]) - 1
    if (!isNaN(index) && index >= 0) {
      if (Array.isArray(global.videoList) && global.videoList.length > 0) {
        const matchingItem = global.videoList.find((item) => item.from === m.sender)
        if (matchingItem) {
          if (index < matchingItem.urls.length) {
            videoId = extractVideoId(matchingItem.urls[index])
          } else {
            throw `${tradutor.texto1} ${matchingItem.urls.length}*`
          }
        } else {
          throw `${tradutor.texto2[0]} (${usedPrefix + command} ${tradutor.texto2[1]} ${usedPrefix}playlist <texto>*`
        }
      } else {
        throw `${tradutor.texto3[0]} (${usedPrefix + command} ${tradutor.texto3[1]} ${usedPrefix}playlist <texto>*`
      }
    }
  }

  // Si no es link ni número de la lista, se busca por texto.
  if (!videoId) {
    const result = await searchMusic(args.join(' '), 'songs')
    if (!result) throw tradutor.texto7
    videoId = result.videoId
    title = result.title
    meta = { title: result.title, artist: result.author?.name, thumbnail: result.thumbnail, url: result.url }
  }

  const { key } = await conn.sendMessage(m.chat, { text: tradutor.texto4 }, { quoted: m })

  try {
    const { buffer, mimeType } = await getAudioBuffer(videoId)
    if (!meta) {
      const info = await yts({ videoId }).catch(() => null)
      meta = { title: info?.title || videoId, artist: info?.author?.name, thumbnail: info?.thumbnail, url: info?.url }
      title = meta.title
    }
    const tagged = await tagAudioMp3(buffer, mimeType, meta)
    const fileSizeInMB = tagged.byteLength / 1024 / 1024
    const roundedFileSizeInMB = fileSizeInMB.toFixed(2)
    if (fileSizeInMB > limit) {
      await conn.sendMessage(m.chat, { document: tagged, caption: `${tradutor.texto5[0]} ${title}\n${tradutor.texto5[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp3', mimetype: 'audio/mpeg' }, { quoted: m })
      await conn.sendMessage(m.chat, { text: `${tradutor.texto5[2]} ${roundedFileSizeInMB}${tradutor.texto5[3]} ${title}`, edit: key }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { audio: tagged, caption: `${tradutor.texto5[0]} ${title}\n${tradutor.texto5[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp3', mimetype: mimeType || 'audio/mpeg' }, { quoted: m })
      await conn.sendMessage(m.chat, { text: `${tradutor.texto5[4]}`, edit: key }, { quoted: m })
    }
  } catch (error) {
    console.log('❌ Error en yta:', error)
    await conn.sendMessage(m.chat, { text: tradutor.texto6, edit: key }, { quoted: m })
    throw tradutor.texto7
  }
}

handler.help = ['yta', 'ytmp3']
handler.tags = ['downloader']
handler.command = /^(audio|fgmp3|dlmp3|getaud|yt(a|mp3))$/i

export default handler
