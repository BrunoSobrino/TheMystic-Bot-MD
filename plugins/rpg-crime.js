//CÓDIGO CREADO POR elrebelde21 : https://github.com/elrebelde21
const handler = async (m, {conn, isPrems}) => {
const date = global.db.data.users[m.sender].crime + 10800000; //3600000 = 3 hs
if (new Date - global.db.data.users[m.sender].crime < 10800000) return m.reply(`『🚓︎』𝙇𝘼 𝙋𝙊𝙇𝙄𝘾𝙄𝘼 𝙀𝙎𝙏𝘼 𝙑𝙄𝙂𝙄𝙇𝘼𝙉𝘿𝙊 𝙀𝙉 𝙀𝙎𝙏𝙀 𝙈𝙊𝙈𝙀𝙉𝙏𝙊, 𝙑𝙐𝙀𝙇𝙑𝙀 𝙀𝙉 : ${msToTime(date - new Date())}`)
const exp = Math.floor(Math.random() * 10000)
const diamond = Math.floor(Math.random() * 300)
const money = Math.floor(Math.random() * 10000)
let or = ['text', 'text2', 'text3', 'text4']; 
let media = or[Math.floor(Math.random() * 4)]
global.db.data.users[m.sender].crime = new Date * 1;
if (media === 'text') return m.reply(`《💰》${pickRandom(global.robar)} ${exp} XP`).catch(global.db.data.users[m.sender].exp += exp) 
if (media === 'text2') return m.reply(`《🚓》${pickRandom(global.robmal)} ${exp} XP`).catch(global.db.data.users[m.sender].exp -= exp) 
if (media === 'text3') return m.reply(`《💰》*${pickRandom(global.robar)}*\n\n${diamond} 💎 𝐃𝐈𝐀𝐌𝐀𝐍𝐓𝐄\n${money} 👾 𝐌𝐲𝐬𝐭𝐢𝐜𝐂𝐨𝐢𝐧𝐬`).catch(global.db.data.users[m.sender].limit += diamond).catch(global.db.data.users[m.sender].money += money)
if (media === 'text4') return m.reply(`《🚓》${pickRandom(global.robmal)}\n\n${diamond} 💎 𝐃𝐈𝐀𝐌𝐀𝐍𝐓𝐄\n${money} 👾 𝐌𝐲𝐬𝐭𝐢𝐜𝐂𝐨𝐢𝐧𝐬`).catch(global.db.data.users[m.sender].limit -= diamond).catch(global.db.data.users[m.sender].money -= money) 
}
handler.help = ['robar'];
handler.tags = ['xp'];
handler.command = /^(crime|Crime)$/i
handler.register = true
export default handler;

function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
hours = (hours < 10) ? "0" + hours : hours
minutes = (minutes < 10) ? "0" + minutes : minutes
seconds = (seconds < 10) ? "0" + seconds : seconds
return hours + " Hora(s) " + minutes + " Minuto(s)"}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}

global.robar = ['Robaste un Banco 🏦 y obtuviste', 'Negociarte con el jefe de la mafia y obtuvist𝐞 recompensa de :', 'Casi te atrapa la policía pero lograste robar una cantidad valiosa de 💰. !Te cuidado la próxima vez! obtuviste:', 'Los mafiosos te han pagado :', 'Le has robado al Administrador del Grupo', 'Le robarte a tu presidente una sumar de :', 'le robarte a un famoso un valor de :'];
global.robmal = ['LA POLICIA TE VIO 🙀👮‍♂️ PERDISTE', 'Fuiste a robar un banco 🏦 y tu ayudarte que vendio a la policía, perdiste', 'No pudiste escapar de la Policía 🚔🤡, perdiste :']