import { toPTT } from '../lib/converter.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
    if (!/video|audio/.test(mime)) throw `هدا الامر خاص بتحويل اي موقع صوتي  أو فيديو لأوديو  نرسل للبوت المقطع الصوتي أو الفيديو ثم نشير اليه ونكتب   هكذا\n *${usedPrefix + command}*`
    let media = await q.download?.()
    if (!media) throw '😣 تحميل الملف'
    let audio = await toPTT(media, 'mp4')
    if (!audio.data) throw '😣تعذرت عملية التحويل'
    conn.sendFile(m.chat, audio.data, 'audio.mp3', '', m, true, { mimetype: 'audio/mp4' })
}
handler.help = ['tovn']
handler.tags = ['tools']
handler.command = /^(tovn)$/i
export default handler
