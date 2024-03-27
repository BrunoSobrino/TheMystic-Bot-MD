/* Créditos a Soffi-Neko, Darlyn1234 BrunoSobrino */
const handler = async (m, {conn, command, args, text, usedPrefix}) => {
const who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;

if (!who) throw '[❗] Etiqueta a alguien.'      
    
const sexo = await conn.getFile(`https://delirius-homepage.vercel.app/api/fuck`);
    
const cap = `@${m.sender.split('@')[0]} se la metió a @${who.split('@')[0]}! >.<`

conn.sendMessage(m.chat, {video: sexo.data, gifPlayback: true, caption: cap, mentions: [m.sender, who]}, {quoted: m});
};
handler.command = /^(fuck)$/i;
handler.group = true;
export default handler;
