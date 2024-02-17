const dir = [
  'https://raw.githubusercontent.com/Dark-Man747/worker-bot/main/dado/dado1.webp',
  'https://raw.githubusercontent.com/Dark-Man747/worker-bot/main/dado/dado2.webp',
  'https://raw.githubusercontent.com/Dark-Man747/worker-bot/main/dado/dado3.webp',
  'https://raw.githubusercontent.com/Dark-Man747/worker-bot/main/dado/dado4.webp',
  'https://raw.githubusercontent.com/Dark-Man747/worker-bot/main/dado/dado5.webp',
  'https://raw.githubusercontent.com/Dark-Man747/worker-bot/main/dado/dado6.webp'
];
let handler = async (m, { conn }) => {
  conn.sendFile(m.chat, dir[Math.floor(Math.random() * dir.length)], 'dado.webp', '', m)
}
handler.help = ['dado']
handler.tags = ['game']
handler.command = ['dado', 'dados','نرد'] 

export default handler