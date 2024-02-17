let handler = async (m, { conn, args, participants }) => {
let users = Object.entries(global.db.data.users).map(([key, value]) => {
return {...value, jid: key}})
let sortedExp = users.map(toNumber('exp')).sort(sort('exp'))
let sortedLim = users.map(toNumber('limit')).sort(sort('limit'))
let sortedLevel = users.map(toNumber('level')).sort(sort('level'))
let usersExp = sortedExp.map(enumGetKey)
let usersLim = sortedLim.map(enumGetKey)
let usersLevel = sortedLevel.map(enumGetKey)
let len = args[0] && args[0].length > 0 ? Math.min(100, Math.max(parseInt(args[0]), 5)) : Math.min(5, sortedExp.length)
let text = `
*< جدول التصنيف />*
    
▢ *توب ${len} XP* •
انت : *${usersExp.indexOf(m.sender) + 1}* ل *${usersExp.length}*

${sortedExp.slice(0, len).map(({ jid, exp }, i) => `${i + 1}. ${participants.some(p => jid === p.jid) ? `(${conn.getName(jid)}) wa.me/` : '@'}${jid.split`@`[0]} *${exp}  XP*`).join`\n`}

▢ *افضل ${len} الماس 💎* •
انت : *${usersLim.indexOf(m.sender) + 1}* ل *${usersLim.length}*

${sortedLim.slice(0, len).map(({ jid, limit }, i) => `${i + 1}. ${participants.some(p => jid === p.jid) ? `(${conn.getName(jid)}) wa.me/` : '@'}${jid.split`@`[0]} *${limit} الماس*`).join`\n`}

▢ *توب ${len} مستوى* • 
انت : *${usersLevel.indexOf(m.sender) + 1}* ل *${usersLevel.length}*

${sortedLevel.slice(0, len).map(({ jid, level }, i) => `${i + 1}. ${participants.some(p => jid === p.jid) ? `(${conn.getName(jid)}) wa.me/` : '@'}${jid.split`@`[0]} *مستوى ${level}*`).join`\n`}

𝑩𝒚 : ❤️‍🔥~°𝑁𝐴𝑇𝑺𝑈!°~⛩️📛 `.trim()
  m.reply(text, null, { mentions: conn.parseMention(text) })
}
handler.help = ['top']
handler.tags = ['xp']
handler.command = ['تصنيف', 'lb'] 



handler.fail = null
handler.exp = 0

export default handler

function sort(property, ascending = true) {
  if (property) return (...args) => args[ascending & 1][property] - args[!ascending & 1][property]
  else return (...args) => args[ascending & 1] - args[!ascending & 1]
}

function toNumber(property, _default = 0) {
  if (property) return (a, i, b) => {
    return {...b[i], [property]: a[property] === undefined ? _default : a[property]}
  }
  else return a => a === undefined ? _default : a
}

function enumGetKey(a) {
  return a.jid
         }