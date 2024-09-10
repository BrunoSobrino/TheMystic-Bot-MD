const handler = async (m, {conn}) => {
  if (!db.data.chats[m.chat].audios) return;
  if (!db.data.settings[conn.user.jid].audios_bot && !m.isGroup) return;
  //const s = seconds: '1934.4'
  const vn = './src/assets/audio/01J672JMF3RCG7BPJW4X2P94N2.mp3';
  conn.sendPresenceUpdate('recording', m.chat);
  conn.sendMessage(m.chat, {audio: {url: vn}, ptt: true, mimetype: 'audio/mpeg', fileName: `./src/assets/audio/01J672JMF3RCG7BPJW4X2P94N2.mp3`}, {quoted: m});
};
handler.customPrefix = /ª|a|A/
handler.command = /^(a|ª|A?$)/
export default handler;

/*
let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './src/assets/audio/./src/assets/audio/01J672JMF3RCG7BPJW4X2P94N2.mp3'
conn.sendPresenceUpdate('recording', m.chat)
conn.sendMessage(m.chat, { audio: { url: vn }, contextInfo: { "externalAdReply": { "title": `👑 𝐓𝐡𝐞 𝐌𝐲𝐬𝐭𝐢𝐜 - 𝐁𝐨𝐭 👑`, "body": `=> ᴀᴜᴅɪᴏ ᴀᴜᴛᴏᴍᴀᴛɪᴄᴏ`, "previewType": "PHOTO", "thumbnailUrl": null,"thumbnail": imagen1, "sourceUrl": `https://github.com/BrunoSobrino/TheMystic-Bot-MD`, "showAdAttribution": true}}, seconds: '4556', ptt: true, mimetype: 'audio/mpeg', fileName: `error.mp3` }, { quoted: m })}
handler.customPrefix = /ª|a|A/
handler.command = /^(a|ª|A?$)/
export default handler
*/
