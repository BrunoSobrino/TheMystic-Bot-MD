import db from '../src/libraries/database.js'

let handler = async (m, { conn, args, text, isOwner, usedPrefix, command }) => {
    conn.advpais = conn.advpais ? conn.advpais : {}
    if (conn.advpais[m.chat]) return m.reply(`*_< ADIVINANZA - MYSTIC >_*\n\n*TODAVIA QUEDA UNA ADIVINANZA QUE RESPONDER*`)
    const json = tekateki[Math.floor(Math.random() * tekateki.length)];
    const _clue = json.response;
    const clue = _clue.replace(/[A-Za-z]/g, '_');
    let teks = `*🌎 \`ADIVINA EL PAIS\` 🌎*
   QUE PAIS ES: *${json.question}*

\t• TIEMPO : ${(conn.advpais[m.chat].time / 1000).toFixed(2)} SEGUNDO/S
\t• BONO : +${conn.advpais[m.chat].bonus} EXP`
    let idmsg = await m.reply(teks)
    setTimeout(() => {
      if (conn.advpais[m.chat]) conn.advpais(m.chat, `*¡¡SE ACABO TU TIEMPO!!*\n\t  • RESPUESTA: ${conn.advpais[m.chat].number}`, m, { quoted: idmsg })
      delete conn.advpais[m.chat]
    }, conn.advpais[m.chat].time)
}

handler.help = ['game']
handler.tags = ['game']
handler.command = /^(advpais|adivinarpais|adivinarpaises)$/i
handler.register = true

export default handler
