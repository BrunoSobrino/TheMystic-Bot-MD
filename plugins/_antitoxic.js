export async function before(m, { isAdmin, isBotAdmin, isOwner, isROwner }) {
    if (m.isBaileys && m.fromMe)
        return !0
    if (!m.isGroup)
        return !1
    let user = global.db.data.users[m.sender]
    let chat = global.db.data.chats[m.chat]
    let bot = global.db.data.settings[this.user.jid] || {}
    
    let toxic = ('Puto' || 'puto' || 'Puta' || 'puta' || 'Rata' || 'rata' || 'mrd' || 'vrga' || 'verga') // Aqui puedes agregarle mas palabras si quieres
    if (m.text.includes(toxic) && chat.antiToxic && !isOwner, !isROwner) {
       user.warn += 1
       if (!(user.warn >= 5)) await m.reply(`${user.warn == 1 ? `Hola *@${m.sender.split`@`[0]}*` : `*@${m.sender.split`@`[0]}*`}, decir la palabra (${toxic}) está prohibido en este bot *${user.warn}/5* advertencia`, false, { mentions: [m.sender] })
    }
    
    if (user.warn >= 5) {
       user.warn = 0
       await m.reply(`Hola *@${m.sender.split`@`[0]}*, superaste las 5 advertencias serás bloqueado y eliminado de este grupo`, false, { mentions: [m.sender] })
       user.banned = true
       await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
       //await this.updateBlockStatus(m.sender, 'block')
    }
    return !1
}
