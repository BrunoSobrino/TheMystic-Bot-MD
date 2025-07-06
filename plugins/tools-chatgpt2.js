import tools from '@shiroko/module';
const handler = async (m, { conn, text, usedPrefix, command }) => {

if (usedPrefix == 'a' || usedPrefix == 'A') return;
if (!text) return m.reply(`*[❗] Habla con exploit de esta forma:*\n${usedPrefix + command} hola xexploit`);
const exploit = await tools.ai.exploit(text);
const data = exploit.answer;
await conn.sendMessage(m.chat, { text: data, mentions: conn.parseMention(data) }, { quoted: m });           
}

handler.help = ['exploit'];
handler.tags = ['tools'];
handler.command = ['ia2', 'exploit', 'xexploit'];

export default handler;
