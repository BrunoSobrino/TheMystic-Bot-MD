const handler = async (m, {conn, args}) => {
  await conn.groupUpdateDescription(m.chat, `${args.join(' ')}`);
  m.reply('*✅ 𝐒𝐞 𝐇𝐚 𝐌𝐨𝐝𝐢𝐟𝐢𝐜𝐚𝐝𝐨 𝐂𝐨𝐫𝐫𝐞𝐜𝐭𝐚𝐦𝐞𝐧𝐭𝐞 𝐋𝐚 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐜𝐢𝐨́𝐧 𝐃𝐞𝐥 𝐆𝐫𝐮𝐩𝐨 );
};
handler.help = ['Setdesc <text>'];
handler.tags = ['group'];
handler.command = /^setdesk|setdesc$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;
