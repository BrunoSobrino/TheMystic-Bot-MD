import fetch from 'node-fetch'
let handler = async (m, { conn, command, args }) => {
if (!args[0]) return conn.reply(m.chat, '*🔎 | جب رابط موقع اسوي له سكرين*\n> *اذا كان صفحة الموقع كبيرة بتأخر شوي*', m)
let ss = await (await fetch(`https://image.thum.io/get/fullpage/${args[0]}`)).buffer()
conn.sendFile(m.chat, ss, 'error.png', args[0], m)}
handler.help = ['ss', 'ssf'].map(v => v + ' <url>')
handler.tags = ['tools']
handler.command = /^ss$/i
export default handler
