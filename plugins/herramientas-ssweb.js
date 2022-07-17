import fetch from 'node-fetch'
let handler = async (m, { conn, command, args }) => {
let full = /f$/i.test(command)
if (!args[0]) return conn.reply(m.chat, '*Porfavor ingresa un url de la página a la que se le tomara captura🔎*', m)
let url = /https?:\/\//.test(args[0]) ? args[0] : 'https://' + args[0]
let ss = await (await fetch(global.API('nrtm', '/api/ssweb', { delay: 1000, url, full }))).buffer()
conn.sendFile(m.chat, ss, 'error.png', url, m)
}
handler.help = ['ss', 'ssf'].map(v => v + ' <url>')
handler.tags = ['internet']
handler.command = /^ss(web)?f?$/i
export default handler
