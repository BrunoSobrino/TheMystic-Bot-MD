
const {downloadContentFromMessage} = (await import('@whiskeysockets/baileys'));

const handler = async (m, {conn}) => {
  if (!m.quoted) throw '*[❗] 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙴 𝙰 𝚄𝙽 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝚀𝚄𝙴 𝙷𝙰𝚈𝙰 𝚂𝙸𝙳𝙾 𝙴𝙽𝚅𝙸𝙰𝙳𝙾 𝙴𝙽 𝚅𝙸𝙴𝚆𝙾𝙽𝙲𝙴 (𝚅𝙴𝚁 𝚂𝙾𝙻𝙾 𝚄𝙽𝙰 𝚅𝙴𝚉)*';
  if (m.quoted.mtype !== 'viewOnceMessageV2') throw '*[❗] 𝙴𝙻 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝚂𝙴𝙻𝙴𝙲𝙲𝙸𝙾𝙽𝙰𝙳𝙾 𝙽𝙾 𝙴𝚂 𝚅𝙸𝙴𝚆𝙾𝙽𝙲𝙴 (𝚅𝙴𝚁 𝚂𝙾𝙻𝙾 𝚄𝙽𝙰 𝚅𝙴𝚉)*';
  const msg = m.quoted.message;
  const type = Object.keys(msg)[0];
  const media = await downloadContentFromMessage(msg[type], type == 'imageMessage' ? 'image' : 'video');
  let buffer = Buffer.from([]);
  for await (const chunk of media) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  if (/video/.test(type)) {
    return conn.sendFile(m.chat, buffer, 'error.mp4', msg[type].caption || '', m);
  } else if (/image/.test(type)) {
    return conn.sendFile(m.chat, buffer, 'error.jpg', msg[type].caption || '', m);
  }
};
handler.help = ['readvo'];
handler.tags = ['tools'];
handler.command = /^(readviewonce|read|revelar|readvo)$/i;
export default handler;
