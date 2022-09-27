let handler = m => m
handler.all = async function (m) {

if (m.chat.endsWith('broadcast') || m.fromMe || m.isGroup || global.db.data.settings.groupOnly) return
let user = global.db.data.users[m.sender]
let pp = `https://s3.amazonaws.com/ideame-images/resizers/125855_666_375_undefined_undefined_projectImageOriginalUrl.jpeg`
let text = `*Hola :D*`
if (new Date - user.pc < 86400000) return 
await this.sendButton(m.chat, `${text}`, wm, pp, [['MENU', `#menu`]], m) 
user.pc = new Date * 1} 

export default handler
