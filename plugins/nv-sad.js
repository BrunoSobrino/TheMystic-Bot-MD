const handler = async (m, {conn, usedPrefix}) => {
 if (usedPrefix == 'a' || usedPrefix == 'A' || usedPrefix == '*' || usedPrefix == '#') return;
 if (!db.data.chats[m.chat].audios) return;
 if (!db.data.settings[conn.user.jid].audios_bot && !m.isGroup) return;
 const vn = './src/assets/audio/01J6748ZEBTQ21HT69937WGM4D.mp3';

 conn.sendPresenceUpdate('recording', m.chat);
 conn.sendMessage(m.chat, {audio: {url: vn}, ptt: true, mimetype: 'audio/mpeg', fileName: `deja de llorar.mp3`}, {quoted: m});
};

handler.command = /^(:c|c)$/i;
handler.fail = null;
handler.exp = 100;

export default handler;
