let handler = async(m, { conn, text, args, usedPrefix, command }) => {
if (!text) throw `*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝚄𝙽 𝚃𝙴𝚇𝚃𝙾*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*◉ ${usedPrefix + command} Mystic-Bot*`
let teks = encodeURI(text)

if (command == 'attp') {
conn.sendFile(m.chat, `https://api.lolhuman.xyz/api/attp?apikey=9b817532fadff8fc7cb86862&text=${teks}`, 'sticker.webp', '', m, { asSticker: true })}
    
if (command == 'attp2') {
conn.sendFile(m.chat, `https://api.lolhuman.xyz/api/attp2?apikey=9b817532fadff8fc7cb86862&text=${teks}`, 'sticker.webp', '', m, { asSticker: true })}

if (command == 'ttp5') {
conn.sendFile(m.chat, `https://api.lolhuman.xyz/api/ttp6?apikey=9b817532fadff8fc7cb86862&text=${teks}`, 'sticker.webp', '', m, { asSticker: true })}
    
if (command == 'ttp4') {
conn.sendFile(m.chat, `https://api.lolhuman.xyz/api/ttp5?apikey=9b817532fadff8fc7cb86862&text=${teks}`, 'sticker.webp', '', m, { asSticker: true })}
    
if (command == 'ttp3') {
conn.sendFile(m.chat, `https://api.lolhuman.xyz/api/ttp3?apikey=9b817532fadff8fc7cb86862&text=${teks}`, 'sticker.webp', '', m, { asSticker: true })}
    
if (command == 'ttp2') {
conn.sendFile(m.chat, `https://api.lolhuman.xyz/api/ttp2?apikey=9b817532fadff8fc7cb86862&text=${teks}`, 'sticker.webp', '', m, { asSticker: true })}
    
if (command == 'ttp') {
conn.sendFile(m.chat, `https://api.lolhuman.xyz/api/ttp?apikey=9b817532fadff8fc7cb86862&text=${teks}`, 'sticker.webp', '', m, { asSticker: true })}
    
}
handler.command = handler.help = ['ttp', 'ttp2', 'ttp3', 'ttp4', 'ttp5', 'attp', 'attp2']
handler.tags = ['sticker']
export default handler
