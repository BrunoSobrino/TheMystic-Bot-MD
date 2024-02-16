let handler = async (m, { conn, text }) => {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    else who = m.chat
    if (!who) throw 'قم بالاشارة للشخص الذي ازالتت من ملكية البوت'
    if (!global.owner.includes(who.split`@`[0])) throw 'تمت ازالته من ملكية البوت ♥!'
    let index = global.owner.findIndex(v => (v.replace(/[^0-9]/g, '') + '@s.whatsapp.net') === (who.replace(/[^0-9]/g, '') + '@s.whatsapp.net'))
    global.owner.splice(index, 1)
    const caption = `ا @${who.split`@`[0]} تم اعتباره من الان فصاعدا ليس مالكا للبوت ♥`
    await conn.reply(m.chat, caption, m, {
        mentions: conn.parseMention(caption)
    });
}
handler.help = ['delowner']
handler.tags = ['owner']
handler.command = /^delowner$/i

handler.owner = true

export default handler
