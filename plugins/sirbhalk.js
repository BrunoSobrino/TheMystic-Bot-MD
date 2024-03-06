import fetch from 'node-fetch'
import axios from 'axios'
import { sticker } from '../lib/sticker.js'
import MessageType from '@adiwajshing/baileys'
//import db from '../lib/database.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
	
	 let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    else who = m.chat
    if (!who) throw `✳️ قم بالاشارة لشخص ما في مجموعة ما ثم اكتب له\n*.sirbhalk*` 
    
    let user = global.db.data.users[who]
    let name = await conn.getName(who) 
   let name2 = m.name
   await m.reply(wait)

  let rki = await fetch(`https://api.waifu.pics/sfw/kill`)
    if (!rki.ok) throw await rki.text()
   let jkis = await rki.json()
   let { url } = jkis
   let stiker = await sticker(null, url, `(${name2}) ࢪاه ڪنـقصـد ههه\ninstagram.com/essaouidi_yassine`, `${name}`)
   conn.sendFile(m.chat, stiker, null, { asSticker: true }, m)
   await m.reply('🗡️')  
   
}

handler.help = ['sirbhalk']
handler.tags = ['sticker']
handler.command = /^sirbhalk$/i
handler.group = false

export default handler
