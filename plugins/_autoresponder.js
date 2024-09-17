import axios from 'axios';
import fetch from 'node-fetch';
import translate from '@vitalets/google-translate-api';
import { sticker } from '../lib/sticker.js';

let handler = m => m;

handler.all = async function (m, {conn}) {
let chat = global.db.data.chats[m.chat];

if (m.mentionedJid.includes(this.user.jid) && m.isGroup && !chat.isBanned) {
await this.sendPresenceUpdate('composing', m.chat);

async function luminsesi(q, username, logic) {
try {
const response = await axios.post("https://luminai.my.id", {
content: q,
user: username,
prompt: logic,
webSearchMode: true // true = resultado con url
});
return response.data.result;
} catch (error) {
console.error(error);
}}

let query = m.text;
let username = `${m.pushName}`;
let jailbreak = await fetch('https://raw.githubusercontent.com/Skidy89/chat-gpt-jailbreak/main/Text.txt').then(v => v.text());
var syms = `Actuaras como un Bot de WhatsApp el cual fue creado por BrunoSobrina tu seras The-MysticBot-MD.\n${jailbreak}`

let result = await luminsesi(query, username, syms1)
await m.reply(m.chat, result, m)}
return true
}

export default handler;
