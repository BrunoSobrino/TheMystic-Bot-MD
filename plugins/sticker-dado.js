const handler = async (m, {conn}) => {
  conn.sendFile(m.chat, `https://api.lolhuman.xyz/api/sticker/dadu?apikey=${lolkeysapi}`, 'error.webp', '', m, {asSticker: true});
};
handler.command = ['dado', 'dados', 'dadu'];
export default handler;

/* import { sticker } from '../lib/sticker.js'
let handler = async (m, { conn }) => {
const dir = ['https://www.random.org/dice/dice1.png', 'https://www.random.org/dice/dice2.png', 'https://www.random.org/dice/dice3.png', 'https://www.random.org/dice/dice4.png', 'https://www.random.org/dice/dice5.png', 'https://www.random.org/dice/dice6.png'];
let img = dir[Math.floor(Math.random() * dir.length)]
//let stiker = await sticker(img, false, global.packname, global.author)
await conn.sendFile(m.chat, img, 'error.webp', '', m, { asSticker: true })
}
handler.command = ['dado', 'dados', 'dadu']
export default handler*/
