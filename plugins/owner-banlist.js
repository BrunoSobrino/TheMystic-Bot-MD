let handler = async (m, { conn, isOwner }) => {
let chats = Object.entries(global.db.data.chats).filter(chat => chat[1].isBanned)
let users = Object.entries(global.db.data.users).filter(user => user[1].banned)
let caption = `
┌〔 المستخدمين المحظوين 〕
├ المجموع : ${users.length} ${users ? '\n' + users.map(([jid], i) => `
├ ${isOwner ? '@' + jid.split`@`[0] : jid}`.trim()).join('\n') : '├'}
└────

┌〔 الشاتات المحظوره 〕
├ المجموع : ${chats.length} ${chats ? '\n' + chats.map(([jid], i) => `
├ ${isOwner ? '@' + jid.split`@`[0] : jid}`.trim()).join('\n') : '├'}
└────
`.trim()
m.reply(caption, null, {mentions: conn.parseMention(caption)})}
handler.command = /^المحظورين?|ban(ned)?list|daftarban(ned)?$/i
handler.rowner = true
export default handler
