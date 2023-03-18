let handler = async (m, { conn, args }) => {
  let usuario = global.db.data.users[m.sender].premiumTime
  let user = Object.entries(global.db.data.users).filter(user => user[1].premiumTime).map(([key, value]) => {
    return { ...value, jid: key }
  })
  let premTime = global.db.data.users[m.sender].premiumTime
  let prem = global.db.data.users[m.sender].premium
  let userr = await '@' + m.sender.split`@`[0]
  let waktu = clockString(`${premTime - new Date() * 1} `)
  let sortedP = user.map(toNumber('premiumTime')).sort(sort('premiumTime'))
  let len = args[0] && args[0].length > 0 ? Math.min(100, Math.max(parseInt(args[0]), 10)) : Math.min(10, sortedP.length)
let infoprem = `
𝙐𝙎𝙀𝙍: ${userr}
${prem ? `${clockString(usuario - new Date() * 1)}` : '*Tiempo Premium:*\nNo Premium'}

*「 𝐔𝐒𝐔𝐀𝐑𝐈𝐎𝐒 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 」*${sortedP.slice(0, len).map(({ jid, name, premiumTime, prem, registered }, i) => `

Usuarios: ${userr}
${premiumTime > 0 ? `${clockString (premiumTime - new Date() * 1)}` : 'No premium'}`).join('\n\n')}`;
  
 m.reply(infoprem, null, { mentions: conn.parseMention(infoprem) })
}
handler.help = ['premlist [angka]']
handler.tags = ['info']
handler.command = /^(listprem|premlist|listavip|viplista)$/i
export default handler

function clockString(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  return `Años: ${years}\nMeses: ${months}\nSemanas: ${weeks}\nDías: ${days}\nHoras: ${hours % 24}\nMinutos: ${minutes % 60}\nSegundos: ${seconds % 60}`;
}

/*function clockString(ms) {
  let ye = isNaN(ms) ? '--' : Math.floor(ms / 31104000000) % 10
  let mo = isNaN(ms) ? '--' : Math.floor(ms / 2592000000) % 12
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000) % 30
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return ['┃ ', ye, ' *🗓️ Años : Year*\n', '┃ ', mo, ' *⛅ Mes : Month*\n', '┃ ', d, ' *☀️ Días : Days*\n', '┃ ', h, ' *⏰ Horas : Hours*\n', '┃ ', m, ' *🕐 Minutos : Minutes*\n', '┃ ', s, ' *⏱️ Segundos : Seconds*'].map(v => v.toString().padStart(2, 0)).join('')
}*/

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
