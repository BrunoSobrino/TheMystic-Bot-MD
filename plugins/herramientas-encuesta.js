let handler = async (m, { conn, text, args, usedPrefix, command }) => {
let name = await conn.getName(m.sender)
if (name == 'undefined') name = 'Sin nombre'
let a = []
let b = text.split('|')
if (!b[1]) throw `*[❗𝐈𝐍𝐅𝐎❗] ғᴏʀᴍᴀᴛᴏ ᴅᴇ ᴜsᴏ ${usedPrefix + command} Pregunta? |Opcion1|Opcion2...*`
if (b[12]) throw `*[❗𝐈𝐍𝐅𝐎❗] ғᴏʀᴍᴀᴛᴏ ᴅᴇ ᴜsᴏ ${usedPrefix + command} Pregunta? |Opcion1|Opcion2...*`
for (let c = 1; c < b.length; c++) { a.push([b[c]])}	
let caption = `*ᴇᴄᴜᴇsᴛᴀ ʀᴇᴀʟɪᴢᴀᴅᴀ ᴘᴏʀ:*\n${name}\n*ᴘʀᴇɢᴜɴᴛᴀ:*\n${text.split('|')[0]}`
return conn.sendPoll(m.chat, caption, a, m)}
handler.help = ['encuesta question|option|option']
handler.tags = ['group'] 
handler.command = ['poll', 'encuesta'] 
export default handler
