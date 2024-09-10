import db from '../src/libraries/database.js'

let handler = m => m

handler.before = async function (m, { conn }) {
    if (m.isBaileys && m.fromMe)
        return !0
    let user = global.db.data.users[m.sender]
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.text || !/^\*ADIVINA EL NUMERO/i.test(m.quoted.text)) return !0
    this.advnro = this.advnro ? this.advnro : {}
    if (m.text == this.advnro[id].number) {
      m.reply(`*Repuesta correcta !*\n\t+${this.advnro[id].bonus} Exp`)
      user.exp += this.advnro[id].bonus * 1
      clearTimeout(this.advnro[id].time)
      delete this.advnro[id]
    } else {
      this.advnro[id].opp -= 1
      if (this.advnro[id].opp == 0) {
        m.reply(`Se acabaron las oportunidades\n\t• Respuesta : ${this.advnro[id].number}`)
        clearTimeout(this.advnro[id].time)
        delete this.advnro[id]
    } else m.reply(`Respuesta incorrecta, quedan ${this.advnro[id].opp} oportunidades`)
    }
    return !0
}

export default handler
