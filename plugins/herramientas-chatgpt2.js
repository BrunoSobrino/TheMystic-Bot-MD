import fetch from 'node-fetch';
import axios from 'axios';
import translate from '@vitalets/google-translate-api';
const handler = async (m, { conn, text, usedPrefix, command }) => {

if (usedPrefix == 'a' || usedPrefix == 'A') return;
if (!text) return m.reply(`⚠️ Hablar con exploit de esta forma\n${usedPrefix + command} hola negro`);

const exploit = await fetch('https://raw.githubusercontent.com/Skidy89/chat-gpt-jailbreak/main/Text.txt').then(v => v.text());
const prompt = `Actuaras como un Bot de WhatsApp el cual fue creado por BrunoSobrina tu seras The-MysticBot-MD.\n${jailbreak}`
const api = await axios.get(`https://skynex.boxmine.xyz/docs/ai/myprompt?text=${text}&prompt=${prompt}&apikey=BrunoSobrino`);
const data = api.data;
await m.reply(data.answer)
}
handler.command = /^(chat|ia2|exploit|eploit)$/i;
export default handler;

