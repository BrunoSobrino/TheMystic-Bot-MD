import util from 'util'
import path from 'path'

let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './media/vivan.mp3'
conn.sendFile(m.chat, vn, 'vivan.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true 
})
}
handler.customPrefix = /vivan!!|vivan los novios|vivanlosnovios/i
handler.command = new RegExp

handler.fail = null
handler.exp = 100
export default handler


