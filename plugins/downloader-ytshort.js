/* let handler = async (m, {conn, text, usedPrefix}) => {
  if (!text) throw 'Berikan URL dari YouTube Shorts!'
  try {
    let vid = `https://yt.btch.bz/download?URL=${text}&videoName=video`
    let aud = `https://yt.btch.bz/downloadAudio?URL=${text}&videoName=video`
    await conn.sendMessage(m.chat, { audio: { url: aud }, mimetype: 'audio/mpeg' }, { quoted: m })
    await conn.sendMessage(m.chat, { video: { url: vid }, mimetype: 'video/mp4' }, { quoted: m })
  } catch (e) {
    throw 'Video/Audio Tidak Ditemukan'
  }
}
handler.command = handler.help =['ytshorts','youtubeshorts','shorts','short']
handler.tags = ['downloader']
handler.exp = 5
export default handler*/
