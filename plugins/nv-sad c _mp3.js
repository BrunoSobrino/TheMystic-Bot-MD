const handler = async (m, {conn, usedPrefix}) => {
  if (usedPrefix == 'a' || usedPrefix == 'A' || usedPrefix == '*' || usedPrefix == '#') return;
  if (!db.data.chats[m.chat].audios) return;
  if (!db.data.settings[conn.user.jid].audios_bot && !m.isGroup) return;
  //const s = seconds: '1934.4'
  const vn = './src/assets/audio/01J6748ZEBTQ21HT69937WGM4D.mp3';
  conn.sendPresenceUpdate('recording', m.chat);
  conn.sendMessage(m.chat, {audio: {url: vn}, ptt: true, mimetype: 'audio/mpeg', fileName: `deja de llorar.mp3`}, {quoted: m});
};
handler.command = /^(:c|c)$/i;
handler.fail = null;
handler.exp = 100;
export default handler; 


/* import util from 'util'
import path from 'path'
let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './src/assets/audio/01J6748ZEBTQ21HT69937WGM4D.mp3'
conn.sendFile(m.chat, vn, './src/assets/audio/01J6748ZEBTQ21HT69937WGM4D.mp3', null, m, true, {type: 'audioMessage', ptt: true})}
handler.command = /^(:c|c)$/i
handler.fail = null
handler.exp = 100
export default handler*/
