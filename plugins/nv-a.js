const handler = async (m, {conn}) => {
  if (!db.data.chats[m.chat]?.audios) return;
  if (!db.data.settings[conn.user.id]?.audios_bot && !m.isGroup) return;
  //const s = seconds: '1934.4'
  const vn = './src/assets/audio/01J672JMF3RCG7BPJW4X2P94N2.mp3';
  conn.sendPresenceUpdate('recording', m.chat);
  conn.sendMessage(m.chat, {audio: {url: vn}, ptt: true, mimetype: 'audio/mpeg', fileName: `./src/assets/audio/01J672JMF3RCG7BPJW4X2P94N2.mp3`}, {quoted: m});
};
handler.customPrefix = /ª|a|A/
handler.command = /^(a|ª|A?$)/
export default handler;

