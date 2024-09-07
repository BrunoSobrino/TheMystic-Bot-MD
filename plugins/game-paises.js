import db from '../src/libraries/database.js'

let handler = async (m, { conn, args, text, isOwner, usedPrefix, command }) => {
    conn.advpais = conn.advpais ? conn.advpais : {}
    if (conn.advpais[m.chat]) return m.reply(`*_< ADIVINANZA - MYSTIC >_*\n\n*TODAVIA QUEDA UNA ADIVINANZA QUE RESPONDER*`)
    conn.advpais[m.chat] = {
        number: (9).getRandom(),
        time: 60000,
        bonus: 350,
        opp: 4
    }
    let teks = `*🌎 \`ADIVINA EL PAIS\` 🌎*
   QUE PAIS ES: *${json.question}*
「○」 *TIEMPO:* 60.00 SEGUNDO/S
「○」 *PREMIO:* *+10* MYSTIC-COINS\t• TIEMPO : ${(conn.advpais[m.chat].time / 1000).toFixed(2)} segundos
\t• BONO : +${conn.advpais[m.chat].bonus} Exp`
    let idmsg = await m.reply(teks)
    setTimeout(() => {
      if (conn.advpais[m.chat]) conn.advpais(m.chat, `*¡ ✨ SE ACABO TU TIEMPO !*\n\t  • RESPUESTA : ${conn.advpais[m.chat].number}`, m, { quoted: idmsg })
      delete conn.advpais[m.chat]
    }, conn.advpais[m.chat].time)
}

handler.help = ['game']
handler.tags = ['game']
handler.command = /^(advpais|adivinarpais|adivinarpaises)$/i
handler.register = true

export default handler
