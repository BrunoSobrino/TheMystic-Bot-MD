let handler  = async (m, { conn }) => {
conn.reply(m.chat,`*『${pickRandom(global.t7dy)}』*`, m)
}
handler.help = ['bzmzjdks']
handler.tags = ['fun']
handler.command = /تحدي/i
export default handler

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

 global.t7dy = [ 
'اضرب نفسك بالكف',
 ] 
