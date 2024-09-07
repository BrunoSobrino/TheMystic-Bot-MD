import db from '../src/libraries/database.js'

let handler = m => m

handler.before = async function (m, { conn }) {
    if (m.isBaileys && m.fromMe)
        return !0
    let user = global.db.data.users[m.sender]
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.text || !/^\*ADIVINA EL PAIS*/i.test(m.quoted.text)) return !0
    this.advpais = this.advpais ? this.advpais : {}
    if (m.text == this.advpais[id].number) {
      m.reply(`*¡RESPUESTA CORRECTA!*\n\t+${this.advpais[id].bonus} Exp`)
      user.exp += this.advpais[id].bonus * 1
      clearTimeout(this.advpais[id].time)
      delete this.advpais[id]
    } else {
      this.advpais[id].opp -= 1
      if (this.advpais[id].opp == 0) {
        m.reply(`\`\`\`SE ACABARON LAS OPORTUNIDADES\`\`\`\n\t• RESPUESTA: ${this.advpais[id].number}`)
        clearTimeout(this.advpais[id].time)
        delete this.advpais[id]
    } else m.reply(`RESPUESTA INCORRECTA, QUEDAN ${this.advpais[id].opp} OPORTUNIDADES`)
    }
    return !0
}

export default handler
