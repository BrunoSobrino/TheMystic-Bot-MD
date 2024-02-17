const dir = [
'https://telegra.ph/file/8034305ce5330ebc11a99.mp4',
'https://telegra.ph/file/5c70fbac268fb54ff847e.mp4',
'https://telegra.ph/file/309d0b9e717186a82317e.mp4',
'https://telegra.ph/file/55277595dcf76fbd95ad6.mp4',
'https://telegra.ph/file/f2a6bec5b7635364d6768.mp4',
'https://telegra.ph/file/d7f5799da8e64b9aff5aa.mp4',
'https://telegra.ph/file/261100ff5fe590b08e35d.mp4',
'https://telegra.ph/file/0aa9e48f6dddd4d1e55dc.mp4',
'https://telegra.ph/file/6214d68e0da156ef8e54a.mp4',

];
let handler = async (m, { conn }) => {
  conn.sendFile(m.chat, dir[Math.floor(Math.random() * dir.length)], 'dado.webp', '', m)
}
handler.help = ['dado']
handler.tags = ['game']
handler.command = ['edit', 'ايدت'] 

export default handler