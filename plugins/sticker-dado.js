let handler = async (m, { conn }) => {
let dir = 'https://api.lolhuman.xyz/api/sticker/dadu?apikey=85faf717d0545d14074659ad'
conn.sendFile(m.chat, dir, 'error.webp', null, m, { asSticker: true })}
handler.command = ['dado', 'dados', 'dadu'] 
export default handler
