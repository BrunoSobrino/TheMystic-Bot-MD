let handler = async (m, { conn, args }) => {
let usuario = global.db.data.users[m.sender].premiumTime
let user = Object.entries(global.db.data.users).filter(user => user[1].premiumTime).map(([key, value]) => { return { ...value, jid: key } })
let name = '🎟️ 𝗣𝗥𝗘𝗠𝗜𝗨𝗠'
let premTime = global.db.data.users[m.sender].premiumTime
let prem = global.db.data.users[m.sender].premium
let waktu = clockString(`${premTime - new Date() * 1} `)
let sortedP = user.map(toNumber('premiumTime')).sort(sort('premiumTime'))
let len = args[0] && args[0].length > 0 ? Math.min(100, Math.max(parseInt(args[0]), 10)) : Math.min(10, sortedP.length)
let usuarioo = await '@' + m.sender.split`@`[0]
await conn.sendButton(m.chat, `

*「 INFO USER 」*
Usuario: ${usuarioo}
Timpo premium: ${prem ? `${clockString (usuario - new Date() * 1) || ''}


*「 𝐔𝐒𝐔𝐀𝐑𝐈𝐎𝐒 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 」*
${sortedP.slice(0, len).map(({ jid, name, premiumTime, prem, registered }, i) => 
                            
`User: ${usuarioo}
${premiumTime > 0 ? `${clockString (premiumTime - new Date() * 1)}` : '┃🚫 𝘾𝘼𝘿𝙐𝘾𝘼𝘿𝙊 : 𝙏𝙄𝙈𝙀𝘿 𝙊𝙐𝙏'}`).join`
`}
`.trim(), `🎟️ 𝗣 𝗥 𝗘 𝗠 𝗜 𝗨 𝗠 ⇢ ${prem ? '✅' : '❌'}\n${wm}`, null, [[`${prem ? '✦ 𝘿𝙄𝙎𝙁𝙍𝙐𝙏𝘼𝙍 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 ✦': '✦ 𝘾𝙊𝙈𝙋𝙍𝘼𝙍 𝙋𝘼𝙎𝙀 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 ✦'}`, `${prem ? '.allmenu': '.pase premium'}`]]) //${premiumTime > 0 ?

  
}
handler.help = ['premlist [angka]']
handler.tags = ['info']
handler.command = /^(listprem|premlist|listavip|viplista)$/i
export default handler

function clockString(ms) {
  let ye = isNaN(ms) ? '--' : Math.floor(ms / 31104000000) % 10
  let mo = isNaN(ms) ? '--' : Math.floor(ms / 2592000000) % 12
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000) % 30
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return ['┃ ', ye, ' *🗓️ Años : Year*\n', '┃ ', mo, ' *⛅ Mes : Month*\n', '┃ ', d, ' *☀️ Días : Days*\n', '┃ ', h, ' *⏰ Horas : Hours*\n', '┃ ', m, ' *🕐 Minutos : Minutes*\n', '┃ ', s, ' *⏱️ Segundos : Seconds*'].map(v => v.toString().padStart(2, 0)).join('')
}

function sort(property, ascending = true) {
  if (property) return (...args) => args[ascending & 1][property] - args[!ascending & 1][property]
  else return (...args) => args[ascending & 1] - args[!ascending & 1]
}

function toNumber(property, _default = 0) {
  if (property) return (a, i, b) => {
    return { ...b[i], [property]: a[property] === undefined ? _default : a[property] }
  }
  else return a => a === undefined ? _default : a
}
/*let handler = async (m, { conn }) => {
let prem = global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)
let textprem = `*「 𝐔𝐒𝐔𝐀𝐑𝐈𝐎𝐒 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 」*
` + prem.map(v => '- @' + v.replace(/@.+/, '')).join`\n`
m.reply(textprem, null, {mentions: conn.parseMention(textprem)})
}
handler.help = ['premlist']
handler.tags = ['owner']
handler.command = /^(listprem|premlist)$/i
handler.rowner = true
export default handler*/
