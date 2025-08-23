const handler = async (m, {conn, text, usedPrefix, command}) => {
 const datas = global
 const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
 const tradutor = _translate.plugins.owner_reporte;

 if (!text) throw `${tradutor.texto1[0]}\n*${usedPrefix + command} ${tradutor.texto1[1]} ${usedPrefix}play ${tradutor.texto1[2]}`;
 if (text.length < 10) throw tradutor.texto2;
 if (text.length > 1000) throw tradutor.texto3;
 const teks = `${tradutor.texto4[0]} wa.me/${m.sender.split`@`[0]}\n${tradutor.texto4[1]} ${text}\n*┴*`;
 conn.reply('5219992095479@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, {contextInfo: {mentionedJid: [m.sender]}});
 conn.reply('5493794297363@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, {contextInfo: {mentionedJid: [m.sender]}});
 m.reply(tradutor.texto5);
};

handler.help = ['request'];
handler.tags = ['info'];
handler.command = ['solicitud', 'reportes', 'reporte', 'sugerencia', 'request', 'reports', 'report', 'suggest'];

export default handler;
