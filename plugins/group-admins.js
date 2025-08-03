const handler = async (m, { conn, participants, groupMetadata, args }) => {
 const datas = global
 const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
 const tradutor = _translate.plugins.gc_admins

 try {
 const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => null) || './src/assets/images/menu/main/administracion.png';
 const groupAdmins = participants.filter((p) => p.admin);
 const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.jid.split('@s.whatsapp.net')[0]}`).join('\n');
 const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.jid || m.chat.split`-`[0] + '@s.whatsapp.net';
 const message = args.join(` `);
 const headers = `${tradutor.texto1[3]} ${message}`;
 const body = `${tradutor.texto1[0]}\n\n${headers ? headers : '-'}\n\n${tradutor.texto1[1]}\n${listAdmin}\n\n${tradutor.texto1[2]}`.trim();
 conn.sendFile(m.chat, pp, 'error.jpg', body, m, false, { mentions: [...groupAdmins.map((v) => v.jid), owner] });
 } catch (error) {
 console.error(error);
 }
};

handler.help = ["admins"];
handler.tags = ["group"];
handler.command = ["admins", "staff"];
handler.group = true;

export default handler;
