/* ⚠ POR FAVOR NO MODIFIQUES NADA DE AQUÍ ⚠ */

import {generateWAMessageFromContent} from "baileys";
import fs from 'fs';
const handler = async (m, {conn, usedPrefix, command}) => {
 const datas = global
 const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
 const tradutor = _translate.plugins.info_donar

 const name = await conn.getName(m.sender);
 const donar =`*┏ ┅ ━━━━━━━━━━━━━━━━ ┅ ━**┇「 ${tradutor.texto1[0]} 」**┣ ┅ ━━━━━━━━━━━━━━━━ ┅ ━**┃ ${tradutor.texto1[1]} ${name}**┃*\n*┃ ${tradutor.texto1[2]}*\n*┃ ${tradutor.texto1[3]}*\n*┃*\n*┃ ${tradutor.texto1[4]}*\n*┃ ${tradutor.texto1[5]}*\n*┃ ${tradutor.texto1[6]}*\n*┃ ${tradutor.texto1[7]}*\n*┃ ${tradutor.texto1[8]}*\n*┃ ${tradutor.texto1[9]}*\n*┃*\n*┃ ${tradutor.texto1[10]}\n *┃ ${tradutor.texto1[11]}\n*┃ ${tradutor.texto1[12]}\n*┗ ┅ ━━━━━━━━━━━━━━━━ ┅ ━*`.trim();
 const aa = { quoted: m, userJid: conn.user.jid };
 const res = generateWAMessageFromContent(m.chat, { liveLocationMessage: { degreesLatitude: 0, degreesLongitude: 0, caption: donar, secuenceNumber: '0', contextInfo: { mentionedJid: conn.parseMention()}}}, aa);
 conn.relayMessage(m.chat, res.message, {});
};

handler.help = ['donate'];
handler.tags = ['info'];
handler.command = ['donate', 'donar', 'apoyar'];

export default handler;
