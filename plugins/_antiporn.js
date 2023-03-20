/*let handler = m => m
import { isPorn, isPornVid } from "../lib/antiporn.js"
import * as fs from 'fs'

var rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

var token = function() {
    return rand() + rand(); // to make it longer
};

handler.before = async function (m, {conn, isAdmin, isBotAdmin, isOwner, isROwner} ) {
//if (!m.isGroup) return !1
let chat = global.db.data.chats[m.chat]
let bot = global.db.data.settings[conn.user.jid] || {}
//if (isBotAdmin && !isAdmin && !isOwner && !isROwner) {
console.log(m.mtype)		
if (m.mtype == 'imageMessage') {
let img = await m.download()
let is = await isPorn(img)
console.log(is)
if (is.status) {
    console.log(is)
    await conn.sendMessage(m.chat, {delete : m.key})
    m.reply("Eliminamos esta imagen por que sospechamos que es pornografía")
}


}
   
if (m.mtype == 'videoMessage') {
let img = await m.download()
let patchh = "/tmp/" + token() + ".mp4"
fs.writeFileSync(patchh, img)
let is = await isPornVid(patchh)
if (is.status) {
    console.log(is)
    await conn.sendMessage(m.chat, {delete : m.key})
    m.reply("Eliminamos esta imagen por que sospechamos que es pornografía")
    }
} 
	
   
}//}
export default handler
*/
