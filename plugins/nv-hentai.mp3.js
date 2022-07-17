import util from 'util'
import path from 'path'

let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './media/hentai.mp3'
conn.sendFile(m.chat, vn, 'hentai.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true
})
}
handler.customPrefix = /audio hentai|Audio hentai|audiohentai|Audiohentai/i
handler.command = new RegExp
export default handler
