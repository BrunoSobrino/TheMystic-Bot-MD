let handler = async (m, { conn }) => {
let dir = 'https://api.lolhuman.xyz/api/sticker/dadu?apikey=${lolkeysapi}'
conn.sendFile(m.chat, dir, 'error.webp', null, m, { asSticker: true })}
handler.command = ['dado', 'dados', 'dadu'] 
export default handler
