import fs from 'fs'
import yts from 'yt-search'
import { searchMusic, getVideoBuffer } from '../src/libraries/ytmusic.js'

let limit = 100

const extractVideoId = (link) => {
  const m = String(link || '').match(/(?:[?&]v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/)
  return m ? (m[1] || m[2] || m[3] || m[4]) : null
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_ytv

  if (!args[0]) throw tradutor.texto1

  let videoId = ''
  let title = ''
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
            throw `${tradutor.texto2} ${matchingItem.urls.length}*`
          }
        } else {
          throw `${tradutor.texto3[0]} (${usedPrefix + command} ${tradutor.texto3[1]} ${usedPrefix}playlist <texto>*`
        }
      } else {
        throw `${tradutor.texto4[0]} (${usedPrefix + command} ${tradutor.texto4[1]} ${usedPrefix}playlist <texto>*`
      }
    }
  }

  // Si no es link ni número de la lista, se busca por texto.
  if (!videoId) {
    const result = await searchMusic(args.join(' '), 'videos')
    if (!result) throw tradutor.texto9
    videoId = result.videoId
    title = result.title
  }

  const { key } = await conn.sendMessage(m.chat, { text: tradutor.texto5 }, { quoted: m })

  try {
    const { buffer, mimeType } = await getVideoBuffer(videoId)
    const fileSizeInMB = buffer.byteLength / 1024 / 1024
    const roundedFileSizeInMB = fileSizeInMB.toFixed(2)
    if (!title) {
      const info = await yts({ videoId }).catch(() => null)
      title = info?.title || videoId
    }
    if (fileSizeInMB > limit) {
      await conn.sendMessage(m.chat, { document: buffer, caption: `${tradutor.texto6[0]} ${title}\n${tradutor.texto6[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp4', mimetype: 'video/mp4' }, { quoted: m })
      await conn.sendMessage(m.chat, { text: `${tradutor.texto6[2]} ${roundedFileSizeInMB}${tradutor.texto6[3]} ${title}`, edit: key }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { video: buffer, caption: `${tradutor.texto7[0]} ${title}\n${tradutor.texto7[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp4', mimetype: mimeType || 'video/mp4' }, { quoted: m })
      await conn.sendMessage(m.chat, { text: `${tradutor.texto7[2]}`, edit: key }, { quoted: m })
    }
  } catch (error) {
    console.log('❌ Error en ytv:', error)
    await conn.sendMessage(m.chat, { text: tradutor.texto8, edit: key }, { quoted: m })
    throw tradutor.texto9
  }
}

handler.help = ['ytv', 'ytmp4']
handler.tags = ['downloader']
handler.command = /^(video|fgmp4|dlmp4|getvid|yt(v|mp4)?)$/i

export default handler
