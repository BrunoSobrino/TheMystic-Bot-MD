import fetch from 'node-fetch';
const handler = async (m, { conn, args, usedPrefix }) => {
if (!args[0]) {
if (!db.data.chats[m.chat].modohorny && m.isGroup) return conn.reply(m.chat, `❗️ ESTE COMANDO ESTA DESHABILITADO PARA EL BOT (#MODOHORNY)`, m, rcanal)
await conn.reply(m.chat, '❗️ INGRESA EL NOMBRE DE LA IMAGEN QUE ESTAS BUSCANDO', m, rcanal);
return;
}
const use = args[0];
const url = `https://rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${use}`;
try {
conn.reply(m.chat, wait, m, {
contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, showAdAttribution: true,
title: packname,
body: wm,
previewType: 0, thumbnail: icons,
sourceUrl: channel }}})
const response = await fetch(url);
const data = await response.json();
if (!data || data.length === 0) {
await conn.reply(m.chat, `\`\`\`❗️ NO SE ENCONTRARON RESULTADOS PARA:\n *${use}*\`\`\``, m);
return;
}
const randomIndex = Math.floor(Math.random() * data.length);
const randomImage = data[randomIndex];
const urlimg = randomImage.file_url;
await conn.sendFile(m.chat, urlimg, 'thumbnail.jpg', `*RESULTADO DE:* ${use}`, m, null)
} catch (error) {
console.error(error);
await m.reply(`\`\`\`❗️ OCURRIO UN ERROR\`\`\``);
}};
handler.help = ['r34 <texto>'];
handler.command = ['r34', 'rule34'];
handler.tags = ['nsfw'];
handler.register = true;

export default handler;
