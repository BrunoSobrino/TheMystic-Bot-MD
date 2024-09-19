import fetch from 'node-fetch';
import axios from 'axios';
import translate from '@vitalets/google-translate-api';
const handler = async (m, {conn, text, usedPrefix, command}) => {
/*const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas_chatgpt
  */
if (usedPrefix == 'a' || usedPrefix == 'A') return;
if (!text) throw `⚠️ Hablar con exploit de esta forma\n${usedPrefix + command} hola negro`;

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
        console.error('Error al obtener:', error);
    }
}

let query = m.text;
let username = `${m.pushName}`;

let jailbreak = await fetch('https://raw.githubusercontent.com/Skidy89/chat-gpt-jailbreak/main/Text.txt').then(v => v.text());
var syms = `Actuaras como un Bot de WhatsApp el cual fue creado por BrunoSobrina tu seras The-MysticBot-MD.\n${jailbreak}`

let result = await luminsesi(query, username, syms);
await m.reply(result)
}
handler.command = /^(chat|ia2|exploit|eploit)$/i;
export default handler;

