import { sticker } from '../lib/sticker.js'
let handler = m => m

handler.all = async function (m, {conn, text, usedPrefix: _p }) {
let chat = global.db.data.chats[m.chat]
    
if (m.mentionedJid.includes(this.user.jid) && m.isGroup && !chat.isBanned) {
let stiker = await sticker(imagen1, false, global.packname, global.author)  
this.sendFile(m.chat, stiker, 'sticker.webp', null, m, false, { contextInfo: { externalAdReply: { title: 'ᴛʜᴇ ᴍʏsᴛɪᴄ - ʙᴏᴛ', body: '©𝐵𝑟𝑢𝑛𝑜𝑆𝑜𝑏𝑟𝑖𝑛𝑜', sourceUrl: `https://github.com/BrunoSobrino/TheMystic-Bot-MD`, thumbnail: imagen2}}})}
    
if ((m.mtype === 'groupInviteMessage' || m.text.startsWith('https://chat') || m.text.startsWith('Abre este enlace')) && !m.isBaileys && !m.isGroup) {
this.sendButton(m.chat, `
*< 𝚄𝙽𝙴 𝚄𝙽 𝙱𝙾𝚃 𝙰 𝚃𝚄 𝙶𝚁𝚄𝙿𝙾 />*\n\n*𝙷𝙾𝙻𝙰 @${m.sender.split('@')[0]}*\n*𝙿𝙰𝚁𝙰 𝚂𝙾𝙻𝙸𝙲𝙸𝚃𝙰𝚁 𝚄𝙽 𝙱𝙾𝚃 𝙰 𝚃𝚄 𝙶𝚁𝚄𝙿𝙾 𝚄𝚂𝙰 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 ${_p}join 𝙼𝙰𝚂 𝙴𝙻 𝙴𝙽𝙻𝙰𝙲𝙴 𝙳𝙴 𝚂𝚄 𝙶𝚁𝚄𝙿𝙾*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*◉ #join* https://chat.whatsapp.com/FWmPWnVqpiQ4XNpLN98g3G`.trim(), wm, null, [['𝚂𝙾𝙻𝙸𝙲𝙸𝚃𝙰𝚁', `${_p}join ${text}`]] , m, { mentions: [m.sender] })}     
    
return !0 }
export default handler
