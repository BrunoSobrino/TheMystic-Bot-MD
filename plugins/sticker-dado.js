let handler = async (m, { conn }) => {
const dir = ['https://www.random.org/dice/dice1.png', 'https://www.random.org/dice/dice2.png', 'https://www.random.org/dice/dice3.png', 'https://www.random.org/dice/dice4.png', 'https://www.random.org/dice/dice5.png', 'https://www.random.org/dice/dice6.png'];  
conn.sendFile(m.chat, dir[Math.floor(Math.random() * dir.length)], 'dadu.webp', '', m)}
handler.command = ['dado', 'dados', 'dadu'] 
export default handler


/*let handler = async (m, { conn }) => {
conn.sendFile(m.chat, `https://violetics.pw/api/random/dadu?apikey=beta`, 'error.webp', '', m, { asSticker: true })
conn.sendFile(m.chat, `https://api.lolhuman.xyz/api/sticker/dadu?apikey=${lolkeysapi}`, 'error.webp', '', m, { asSticker: true })  
}
handler.command = ['dado', 'dados', 'dadu'] 
export default handler*/
