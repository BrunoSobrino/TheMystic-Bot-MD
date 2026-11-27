//CÓDIGO CREADO POR elrebelde21 : https://github.com/elrebelde21


let crime = 500
let diamante = 10
const handler = async (m, { conn, usedPrefix, command, groupMetadata, participants, isPrems }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.rpg_crime

  global.robar = tradutor.texto4;
  global.robmal = tradutor.texto5;


  const user = global.db.data.users[m.sender]
  const date = (user.crime || 0) + 3600000; //3600000 = 1 hs
  if (new Date - (user.crime || 0) < 3600000) return m.reply(`${tradutor.texto1} ${msToTime(date - new Date())}`)
  let randow
  if (m.isGroup) randow = (await m.mentionedJid)[0] || (m.quoted ? await m?.quoted?.sender : false);
  else randow = m.chat
  try {
    const ps = (groupMetadata?.participants || []).map(v => v.id)
    // Si no se mencionó a nadie ni se respondió a un mensaje, la
    // víctima es al azar (antes la mención se ignoraba: una variable
    // interna con el mismo nombre la tapaba siempre).
    if (!randow) randow = ps.getRandom()
    if (!randow) return
    if (!global.db.data.users[randow]) global.db.data.users[randow] = {}
    const users = global.db.data.users[randow]
    const exp = Math.floor(Math.random() * 9000)
    const diamond = Math.floor(Math.random() * 150)
    const money = Math.floor(Math.random() * 9000)
    let or = ['text', 'text2', 'text3', 'text4', 'text5'];
    let media = or[Math.floor(Math.random() * or.length)]
    const me = global.db.data.users[m.sender]
    me.crime = new Date * 1;
    if (media === 'text') { me.exp = (me.exp || 0) + exp; return m.reply(`《💰》${pickRandom(global.robar)} ${exp} XP`) }
    if (media === 'text2') { me.exp = (me.exp || 0) - crime; return m.reply(`《🚓》${pickRandom(global.robmal)} ${exp} XP`) }
    if (media === 'text3') { me.limit = (me.limit || 0) + diamond; me.money = (me.money || 0) + money; return m.reply(`《💰》*${pickRandom(global.robar)}*\n\n${diamond} ${tradutor.texto2[0]}\n${money} ${tradutor.texto2[1]}`) }
    if (media === 'text4') { me.limit = (me.limit || 0) - diamante; me.money = (me.money || 0) - crime; return m.reply(`《🚓》${pickRandom(global.robmal)}\n\n${diamond} ${tradutor.texto2[0]}\n${money} ${tradutor.texto2[1]}`) }
    if (media === 'text5') { me.exp = (me.exp || 0) + exp; users.exp = (users.exp || 0) - crime; return conn.reply(m.chat, `${tradutor.texto3[0]} @${randow.split`@`[0]} ${tradutor.texto3[1]} ${exp} XP`, m, { contextInfo: { mentionedJid: [randow] } }) }
  } catch (e) {
    console.log(e)
  }
}
handler.help = ['robar'];
handler.tags = ['xp'];
handler.command = /^(crime|Crime)$/i
handler.register = true
handler.group = true
export default handler;

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds
  return hours + " Hora(s) " + minutes + " Minuto(s)"
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}

