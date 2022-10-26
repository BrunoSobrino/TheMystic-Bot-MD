//CRÉDITOS: https://github.com/Abiguelreyes75

export async function all(m, conn) {
let texto
let user = global.db.data.users[m.sender]  
if (!m.message)
return
if (!user.antispam)
return !0
if (+new Date() > user.antispam) {
let tiempo = 60000 * 1
setTimeout(() => {
user.banned = false
texto = `*@${m.sender.split("@")[0]} FUE BANEADO DESPUÉS DE ${tiempo / 1000 - 59} MINUTO, POR FAVOR NO HAGA SPAM!!*`
this.sendButton(m.chat, texto, wm, null, [['☘️ 𝗠 𝗘 𝗡 𝗨', '/menu']], m, { mentions: this.parseMention(texto) })}, tiempo)        
user.antispam = null
}}
