import fetch from 'node-fetch';
import fs from 'fs';
let handler = m => m;

handler.all = async function (m, conn) {

const fakecontact = { 'key': { 'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': '𝐒𝐇𝐀𝐖𝐀𝐙𝐀-𝐁𝐎𝐓' }, 'message': { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
   
 const vn = './media/الكلب.mp3'; //src sounds
 const vn2 = './media/سقيتك كاس.mp3'; 
   
 let num = "201144480436"; //number owner
 let num2 = "994409422241"; //number bot
 let sender = m.sender.split('@')[0];
 
 if (m.mentionedJid && m.mentionedJid[0]) {
 
 let phoneNumber = m.mentionedJid[0].replace(/[^0-9]/g, '');
        
 if (phoneNumber === num) {
          
  this.sendMessage(m.chat, {audio: {url: vn2}, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: fakecontact});
 this.sendMessage(m.chat, {text: `*عاوز اي من مطوري ي🧐 @${m.sender.split('@')[0]} 🧞*`}, {quoted: fakecontact});
 return;
 
 } else if (phoneNumber === num2) {
 
 if (sender === num) {
 this.sendMessage(m.chat, {text: '*احمم أنا هنا ي قلبي 😂*'}, {quoted: fakecontact});
 return;
 } else {
          
  this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: fakecontact});
 this.sendMessage(m.chat, {text: `*ايوا ي @${m.sender.split('@')[0]} عاوز أي 🧐*`}, {quoted: fakecontact});
 return;
 }
 } 
 } else {
 return;
 }}

export default handler;
