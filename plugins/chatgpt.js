import fetch from 'node-fetch';
import translate from '@vitalets/google-translate-api';
const handler = (m) => m;

handler.before = async (m) => {
let Prefijo = false;
const prefixRegex = global.prefix;
if (prefixRegex.test(m.text) && !opts['gconly']) Prefijo = true;
const bot = global.db.data.settings[conn.user.jid]   
if (bot.modoia && !m.isGroup && !Prefijo && !m.fromMe && m.text !== '') {
if (/^.*false|disnable|(turn)?off|0/i.test(m.text)) return;
let textodem = m.text;
const name = conn.getName(m.sender)
const namedem = `${name || 'Sin Definir'}`
const sytm = await fetch(`https://raw.githubusercontent.com/GataNina-Li/GataBot-MD/master/src/chatgpt_indicciones.txt`).then(v => v.text()); 
const sistema1 = sytm.replace('@name', namedem)
try {
await conn.sendPresenceUpdate('composing', m.chat)
async function getOpenAIChatCompletion(texto) {
const openaiAPIKey = global.openai_key;
let chgptdb = global.chatgpt.data.users[m.sender];
chgptdb.push({ role: 'user', content: texto });
const url = "https://api.openai.com/v1/chat/completions";
const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${openaiAPIKey}` };
const data = { "model": "gpt-3.5-turbo", "messages": [{ "role": "system", "content": sistema1 }, ...chgptdb, ]};
const response = await fetch(url, {method: "POST", headers: headers, body: JSON.stringify(data)});
const result = await response.json();
const finalResponse = result.choices[0].message.content;
return finalResponse;
};
let respuesta = await getOpenAIChatCompletion(textodem);
m.reply(`${respuesta}`.trim());
return;
} catch {    
try {
const fgapi1 = await fetch(`https://api-fgmods.ddns.net/api/info/openai?text=${textodem}&symsg=${sistema1}&apikey=XlwAnX8d`);
const fgjson1 = await fgapi1.json();
if (fgjson1.result == 'error' || fgjson1.result == '' || !fgjson1.result) return XD;
m.reply(`${fgjson1.result}`.trim());
return;    
} catch {
try {
const vihangayt1 = await fetch(`https://vihangayt.me/tools/chatgpt?q=${textodem}`);
const vihangaytjson1 = await vihangayt1.json();
if (vihangaytjson1.data == 'error' || vihangaytjson1.data == '' || !vihangaytjson1.data) return XD;
m.reply(`${vihangaytjson1.data}`.trim());
return;
} catch {
try {
const vihangayt2 = await fetch(`https://vihangayt.me/tools/chatgpt2?q=${textodem}`);
const vihangaytjson2 = await vihangayt2.json();
if (vihangaytjson2.data == 'error' || vihangaytjson2.data == '' || !vihangaytjson2.data) return XD; 
m.reply(`${vihangaytjson2.data}`.trim());
return;    
} catch {
try {    
const vihangayt3 = await fetch(`https://vihangayt.me/tools/chatgpt3?q=${textodem}`);
const vihangaytjson3 = await vihangayt3.json();
if (vihangaytjson3.data == 'error' || vihangaytjson3.data == '' || !vihangaytjson3.data) return XD;
m.reply(JSON.parse(`${vihangaytjson3.data}`).trim()); 
} catch {    
const akuariapi2 = await fetch(`https://api.akuari.my.id/ai/gpt?chat=${textodem}`);
const akuariapijson2 = await akuariapi2.json();
const akuariapiresult2 = await translate(`${akuariapijson2.respon}`, {to: 'es', autoCorrect: true});
m.reply(`${akuariapiresult2.text}`.trim());  
return;    
}}}}}}
return true;
};
export default handler;
