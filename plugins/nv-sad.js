import { sendAudioPTT } from '../src/libraries/sendAudioPTT.js';
const handler = async (m, {conn, usedPrefix}) => {
 if (usedPrefix == 'a' || usedPrefix == 'A' || usedPrefix == '*' || usedPrefix == '#') return;
 if (!db.data.chats[m.chat].audios) return;
 if (!db.data.settings[conn.user.id].audios_bot && !m.isGroup) return;
 const vn = './src/assets/audio/01J6748ZEBTQ21HT69937WGM4D.mp3';

 conn.sendPresenceUpdate('recording', m.chat);
 await sendAudioPTT(conn, m.chat, vn, m);
};

handler.command = /^(:c|c)$/i;
handler.fail = null;
handler.exp = 100;

export default handler;
