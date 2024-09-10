import db from '../src/libraries/database.js'

let handler = async (m, { conn, args, text, isOwner, usedPrefix, command }) => {
    conn.advnro = conn.advnro ? conn.advnro : {}
    if (conn.advnro[m.chat]) return m.reply(`*_< ADIVINANZA - MYSTIC >_*\n\n*TODAVIA QUEDA UNA ADIVINANZA QUE RESPONDER*`)
    conn.advnro[m.chat] = {
        number: (9).getRandom(),
        time: 60000,
        bonus: 350,
        opp: 4
    }
    let teks = `*ADIVINA EL NUMERO [ 1 2 3 4 5 6 7 8 9 0 ]*
\t• TIEMPO : ${(conn.advnro[m.chat].time / 1000).toFixed(2)} segundos
\t• BONO : +${conn.advnro[m.chat].bonus} Exp`
    let idmsg = await m.reply(teks)
    setTimeout(() => {
      if (conn.advnro[m.chat]) conn.advnro(m.chat, `*¡ ✨ SE ACABO TU TIEMPO !*\n\t  • RESPUESTA : ${conn.advnro[m.chat].number}`, m, { quoted: idmsg })
      delete conn.avnro[m.chat]
    }, conn.advnro[m.chat].time)
}

handler.help = ['game']
handler.tags = ['game']
handler.command = /^(advnro|adivinarnumero|adivinarnro)$/i
handler.register = true

export default handler
