import tools from '@takanashi-soft/tools';
const handler = async (m, { conn, text, usedPrefix, command }) => {

if (usedPrefix == 'a' || usedPrefix == 'A') return;
if (!text) return m.reply(`⚠️ Hablar con exploit de esta forma\n${usedPrefix + command} hola negro`);
const exploit = await tools.ai.exploit(text);
const data = exploit.answer;
await m.reply(data)
}
handler.command = /^(chatgpt2|ia2|exploit|eploit)$/i;
export default handler;
