/* Created by https://github.com/unptoadrih15 */

let handler = async (m, { conn }) => {
conn.tebaklagu = conn.tebaklagu ? conn.tebaklagu : {}
let id = m.chat
if (!(id in conn.tebaklagu)) throw false
let json = conn.tebaklagu[id][1]
let nya = json.jawaban
let nyanya = nya.replace(/[bcdfghjklmnñpqrstvwxyzBCDEFGHJKLMNÑPQRSTVWXYZ]/g, '_')
m.reply('' + nyanya + '')
}
handler.command = /^hint|pista$/i
export default handler
