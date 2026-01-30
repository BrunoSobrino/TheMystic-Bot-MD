let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {

let delet = m.key.participant;
let bang = m.key.id;
  
if (isBotAdmin && m.isGroup) {
if (m.text && m.text.toLowerCase().includes("wa.me/settings") || m.text.toLowerCase().includes("wa.me/setting")) {
let user = `@${m.sender.split`@`[0]}`
let fakemek = {key: {participant: "0@s.whatsapp.net","remoteJid": "0@s.whatsapp.net"},"message": {"groupInviteMessage": {"groupJid": "51995386439-1616969743@g.us","inviteCode": "m","groupName": "P", "caption": '饾殐饾殤饾殠 饾櫦饾殺饾殰饾殱饾殥饾殞 - 饾櫛饾殬饾殱', 'jpegThumbnail': null}}}
conn.sendMessage(m.chat, { text: `SE DETECTO UN BUG\n\nMarcar el chat como leido ${"\n".repeat(400)}\n=> El numero : wa.me/${m.sender.split("@")[0]}\n=> Alias : ${user}\n[ ! ] Acaba de enviar un texto que contiene muchos caracteres que puede ocasionar fallos en los dispositivos`, mentions: [m.sender] }, { quoted: fakemek })
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } })
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
return null
}
}}
export default handler;
