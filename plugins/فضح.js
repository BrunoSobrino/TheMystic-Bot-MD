var handler = async (m, { conn }) => {

if (!/viewOnce/.test(m.quoted?.mtype)) throw '*[❄] رد على الفيديو أو الصورة التي سيتم مشاهدتها مرة واحدة فقط*'
let mtype = Object.keys(m.quoted.message)[0]
let buffer = await m.quoted.download()
let caption = m.quoted.message[mtype].caption || ''
conn.sendMessage(m.chat, { [mtype.replace(/Message/, '')]: buffer, caption }, { quoted: m })
	
}
handler.help = ['readviewonce']
handler.tags = ['implementos']
handler.command = /^فضح|readviewonce|mirar/i

export default handler
