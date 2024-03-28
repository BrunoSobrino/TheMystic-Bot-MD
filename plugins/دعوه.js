
let handler = async (m, { conn, args, text, usedPrefix, command }) => {
if (!text) throw `*اكــتـب الـرقـم الـذي تـريـد ارســال لـه الـدعوه !*\n*مــثـال :\n*${usedPrefix + command}* 201554582851`
if (text.includes('+')) throw  `*لا تــضـع هـذه الـعـلـامـه +*`
if (isNaN(text)) throw '*دخــل الـرقـم بـدـون مـسافـات !*'
let group = m.chat
let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)

      await conn.reply(text+'@s.whatsapp.net', `*دعــوه لــدـخول الـجـروب !*\n*الــرابـط :* ${link}`, m, {mentions: [m.sender]})
        m.reply(`*تــم ارســال رابــط الـدعـوه !*`) 

}
handler.help = ['invite <20xxx>']
handler.tags = ['group']
handler.command = ['دعوة','دعوه'] 
handler.group = true
handler.admin = false
handler.botAdmin = true

export default handler
