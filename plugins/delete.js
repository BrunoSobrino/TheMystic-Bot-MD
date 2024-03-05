const handler = async (m, { conn, command }) => {
  if (!m.quoted) throw 'قم بالاشارة للرسالة التي تريد مسحها';
  try {
    let bilek = m.message.extendedTextMessage.contextInfo.participant;
    let banh = m.message.extendedTextMessage.contextInfo.stanzaId;
    return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: banh, participant: bilek } });
  } catch {
    return conn.sendMessage(m.chat, { delete: m.quoted.vM.key });
  }
};

handler.help = ['delete'];
handler.tags = ['owner'];
handler.command = /^(delete)$/i;
handler.admin = true;

export default handler;
