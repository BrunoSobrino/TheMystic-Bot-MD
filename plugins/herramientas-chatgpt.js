/* -------------------------------------------------------*/
/* [❗]                      [❗]                      [❗] */
/*                                                       */
/*       |- [ ⚠ ] - CREDITOS DEL CODIGO - [ ⚠ ] -|      */
/*     —◉ DESAROLLADO POR OTOSAKA:                       */
/*     ◉ Otosaka (https://github.com/6otosaka9)          */
/*     ◉ Número: wa.me/51993966345                       */
/*                                                       */
/*     —◉ FT:                                            */
/*     ◉ BrunoSobrino (https://github.com/BrunoSobrino)  */
/*                                                       */
/* [❗]                      [❗]                      [❗] */
/* -------------------------------------------------------*/

import tools from '@takanashi-soft/tools';

const handler = async (m, {conn, text, usedPrefix, command}) => {
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://telegra.ph/file/9d38415096b6c46bf03f8.jpg')
if (!text) return m.reply(await tr(`*Hola cómo esta 😊, El que te puedo ayudar?*, ingrese una petición o orden para usar la función de chagpt\n*Ejemplo:*\n${usedPrefix + command} Recomienda un top 10 de películas de acción`)) 
//let syst = `Actuaras como un Bot de WhatsApp el cual fue creado por elrebelde, tu seras LoliBot.`
let syms1 = await fetch('https://raw.githubusercontent.com/Skidy89/chat-gpt-jailbreak/main/Text.txt').then(v => v.text());

if (usedPrefix == 'a' || usedPrefix == 'A') return;
if (!text) throw `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]} ${usedPrefix + command} ${tradutor.texto1[2]}`;
try {
const prompt = tradutor.texto3;
const chatgpt = await tools.ai.mylogic(text, prompt);
const data = chatgpt.answer;
m.reply(`${data}`.trim());
} catch (error) {
throw tradutor.texto4;
}};

const selectedModel = chooseModel(text);
const fallbackModels = Object.keys(perplexity.api.models).filter(m => m !== selectedModel);
let response = await perplexity.chat(messages, selectedModel);

if (!response.status) {
for (const fallback of fallbackModels) {
try {
response = await perplexity.chat(messages, fallback);
if (response.status) {
//console.log(`Respaldo ${fallback} funcionó`);
break;
}} catch (e) {
console.error(`Falló ${fallback}: ${e.message}`);
}}}

if (response.status) {
await m.reply(response.result.response);
}
} catch {
try {     
async function getResponse(prompt) {
try {
await delay(1000); 
const response = await axios.post('https://api.openai.com/v1/chat/completions', 
{ model: 'gpt-4o-mini', 
messages: [{ role: 'user', content: prompt }],
max_tokens: 300,
}, { headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${apikey}`, 
}});
return response.data.choices[0].message.content;
} catch (error) {
console.error(error);
}}

const respuesta = await getResponse(text);
m.reply(respuesta);
} catch {
try { 
let gpt = await fetch(`${apis}/ia/gptprompt?text=${text}?&prompt=${syms1}`) 
let res = await gpt.json()
await m.reply(res.data)
} catch {
try {
let gpt = await fetch(`${apis}/ia/gptweb?text=${text}`) 
let res = await gpt.json()
await m.reply(res.gpt)
/*let gpt = await fetch(`https://deliriusapi-official.vercel.app/ia/chatgpt?q=${text}`)
let res = await gpt.json()
await m.reply(res.data)*/
} catch {
}}}}}

if (command == 'openai' || command == 'ia2' || command == 'chatgpt2') {
conn.sendPresenceUpdate('composing', m.chat);
let gpt = await fetch(`${apis}/api/ia2?text=${text}`)
let res = await gpt.json()
await m.reply(res.gpt)
}

if (command == 'gemini') {
await conn.sendPresenceUpdate('composing', m.chat)
try {
let gpt = await fetch(`https://api.dorratz.com/ai/gemini?prompt=${text}`)
let res = await gpt.json()
await m.reply(res.message)
} catch {
try {
let gpt = await fetch(`${apis}/ia/gemini?query=${text}`)
let res = await gpt.json()
await m.reply(res.message)
} catch {
}}}

if (command == 'copilot' || command == 'bing') {
await conn.sendPresenceUpdate('composing', m.chat)
try {
let gpt = await fetch(`https://api.dorratz.com/ai/bing?prompt=${text}`)
let res = await gpt.json()
await conn.sendMessage(m.chat, { text: res.result.ai_response, contextInfo: {
externalAdReply: {
title: "[ IA COPILOT ]",
body: wm,
thumbnailUrl: "https://qu.ax/nTDgf.jpg", 
sourceUrl: [nna, nna2, nn, md, yt, tiktok].getRandom(),
mediaType: 1,
showAdAttribution: false,
renderLargerThumbnail: false
}}}, { quoted: m })
//m.reply(res.result.ai_response)
} catch {
try {
let gpt = await fetch(`${apis}/ia/bingia?query=${text}`)
let res = await gpt.json()
await m.reply(res.message)
} catch {
}}}}
handler.help = ["chagpt", "ia", "openai", "gemini", "copilot"]
handler.tags = ["buscadores"]
handler.command = /^(openai|chatgpt|ia|ai|openai2|chatgpt2|ia2|gemini|copilot|bing)$/i;
export default handler;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
