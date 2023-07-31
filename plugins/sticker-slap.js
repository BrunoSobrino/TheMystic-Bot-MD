import {sticker} from '../lib/sticker.js'
import fetch from 'node-fetch'
const handler = async (m, {conn, args, usedPrefix, command}) => {  
 try {
   let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
       else who = m.chat
    if (!who) throw `*[❗] 𝙴𝚃𝙸𝚀𝚄𝙴𝚃𝙰 𝙾 𝙼𝙴𝙽𝙲𝙸𝙾𝙽𝙰 𝙰 𝙰𝙻𝙶𝚄𝙸𝙴𝙽*\n\n*📌 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:* ${usedPrefix + command} @tag`  
       let name 
    if (who === m.chat) { 
       name = '𝚃𝚑𝚎 𝙼𝚢𝚜𝚝𝚒𝚌 - 𝙱𝚘𝚝'
      } else {    
       name = conn.getName(who) 
      }
       let name2 = conn.getName(m.sender) 
       let apislap = await fetch(`https://api.waifu.pics/sfw/slap`)
       let jkis = await apislap.json()
       let { url } = jkis
       let stiker = await sticker(null, url, `${name2} le dio una bofetada a ${name}`, null)
    conn.sendFile(m.chat, stiker, null, {asSticker: true});
} catch {
throw `*[❗] 𝙴𝚁𝚁𝙾𝚁, 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝚁𝙽𝚃𝙰𝚁𝙻𝙾*`   
}}
handler.help = ['slap'];
handler.tags = ['General'];
handler.command = /^(slap|bofetada)$/i
export default handler
