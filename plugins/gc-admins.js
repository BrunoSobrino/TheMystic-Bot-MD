const handler = async (m, {conn, participants, groupMetadata, args}) => {
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => null) || './src/admins.jpg';
  const groupAdmins = participants.filter((p) => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
  const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';
  const pesan = args.join` `;
  const oi = `*𝙼𝙴𝙽𝚂𝙰𝙹𝙴:* ${pesan}`;
  const text = `𝐈𝐧𝐯𝐨𝐜𝐚𝐧𝐝𝐨 𝐀𝐝𝐦𝐢𝐧𝐬*

${oi}

*𝙰𝙳𝙼𝙸𝙽𝚂:*
${listAdmin}

*[ ⚠ ️] 𝐔𝐬𝐚𝐫 𝐬𝐨𝐥𝐨 𝐞𝐧 𝐜𝐚𝐬𝐨 𝐝𝐞 𝐞𝐦𝐞𝐫𝐠𝐞𝐧𝐜𝐢𝐚!!*`.trim();
  conn.sendFile(m.chat, pp, 'error.jpg', text, m, false, {mentions: [...groupAdmins.map((v) => v.id), owner]});
};
handler.help = ['admins <texto>'];
handler.tags = ['group'];
// regex detect A word without case sensitive
handler.customPrefix = /a|@/i;
handler.command = /^(admins|@admins|dmins)$/i;
handler.group = true;
export default handler;
