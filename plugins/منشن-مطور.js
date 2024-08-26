import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch';
import fs from 'fs';
let handler = m => m;

handler.all = async function (m, conn) {

const fakecontact = { 'key': { 'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': '𝐆𝐎𝐉𝐎⚡𝐁𝐎𝐓' }, 'message': { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
   
 let num = "201144480436"; //number owner
 let num2 = "994409422241"; //number bot
 let sender = m.sender.split('@')[0];
 
 if (m.mentionedJid && m.mentionedJid[0]) {
 
 let phoneNumber = m.mentionedJid[0].replace(/[^0-9]/g, '');
        
 if (phoneNumber === num) {
const s = [
"https://a.uguu.se/VnwXvwjJ.webp"
    ];  
    const g = [
"https://file.io/HHlOUoioq8UQ"
    ];  
    let stiker = await sticker(null, s[Math.floor(Math.random() * s.length)])
    if (stiker) {
        conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
    }
 }

export default handler;
