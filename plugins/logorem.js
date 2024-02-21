import fetch from 'node-fetch'
let handler = async (m, { conn, args }) => {
let response = args.join(' ').split('|')
  if (!args[0]) throw 'Enter Name'
  m.reply('proses..')
  let res = `https://ziy.herokuapp.com/api/maker/rem?nama=${response[0]}&apikey=xZiyy`
  conn.sendFile(m.chat, res, 'rem.jpg', `Nih kak`, m, false)
}
handler.help = ['logorem'].map(v => v + ' <text|text>')
handler.tags = ['maker']
handler.command = /^(logorem)$/i

export default handler
