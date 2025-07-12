// Plugin para test de comandos - powered by @BrunoSobrino
import axios from 'axios'
import yts from 'yt-search'
// Creditos a Takashi | Sharing Code Esm

let handler = async (m, { conn, args }) => {
  try {
    let query = args.join(' ')
    if (!query) return m.reply('Example : .play Only We Know Speed Up')
    
    let searchResult = await yts(query)
    let video = searchResult.videos[0]
 
    let { data } = await axios.get('https://api.yogik.id/downloader/youtube', { params: { url: video.url, format: 'audio' }, headers: { Accept: 'application/json' } })

    console.log(data)
    let result = data.result
    
    await conn.sendMessage(m.chat, {
      audio: { url: result.download_url },
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: result.title,
          body: result.author_name,
          thumbnailUrl: result.thumbnail_url,
          sourceUrl: video.url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
    
  } catch (e) {
    m.reply(e.message)
  }
}
 
handler.help = ['test']
handler.tags = ['testing']
handler.command = ['test']
export default handler
