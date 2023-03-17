let handler = async (m, { conn }) => {
conn.sendFile(m.chat, `https://violetics.pw/api/random/dadu?apikey=beta`, 'error.webp', '', m, { asSticker: true })
//let dir = 'https://api.lolhuman.xyz/api/sticker/dadu?apikey=${lolkeysapi}'
//conn.sendFile(m.chat, dir, 'error.webp', null, m, { asSticker: true })
}
handler.command = ['dado', 'dados', 'dadu'] 
export default handler
