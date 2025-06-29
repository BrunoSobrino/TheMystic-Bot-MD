import tools from '@takanashi-soft/tools';
const handler = async (m, { conn, text, usedPrefix, command }) => {

if (usedPrefix == 'a' || usedPrefix == 'A') return;
if (!text) return m.reply(`*[❗] Habla con exploit de esta forma:*\n${usedPrefix + command} hola negro`);
const exploit = await tools.ai.exploit(text);
const data = exploit.answer;
await conn.sendMessage(m.chat, {text: data, mentions: conn.parseMention(data)}, {quoted: m});           
//await m.reply(data)
}
handler.command = /^(chat|ia2|exploit|eploit)$/i;
export default handler;
