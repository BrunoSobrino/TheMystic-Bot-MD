let handler = async (m, { conn, text, participants }) => {
let member = participants.map(u => u.id)
if(!text) {
var sum = member.length
} else {
var sum = text} 
var total = 0
var sider = []
for(let i = 0; i < sum; i++) {
let users = m.isGroup ? participants.find(u => u.id == member[i]) : {}
if((typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) && !users.isAdmin && !users.isSuperAdmin) { 
if (typeof global.db.data.users[member[i]] !== 'undefined'){
if(global.db.data.users[member[i]].whitelist == false){
total++
sider.push(member[i])}
}else {
total++
sider.push(member[i])}}}
if(total == 0) return conn.reply(m.chat, `*[❗] 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾 𝙴𝚂 𝙰𝙲𝚃𝙸𝚅𝙾, 𝙽𝙾 𝚃𝙸𝙴𝙽𝙴 𝙵𝙰𝙽𝚃𝙰𝚂𝙼𝙰𝚂 :D*`, m) 
m.reply(`*[ ⚠ 𝚁𝙴𝚅𝙸𝚂𝙸𝙾𝙽 𝙳𝙴 𝙸𝙽𝙰𝙲𝚃𝙸𝚅𝙾𝚂 ⚠ ]*\n\n*𝙶𝚁𝚄𝙿𝙾:* ${await conn.getName(m.chat)}\n*𝙼𝙸𝙴𝙼𝙱𝚁𝙾𝚂 𝙳𝙴𝙻 𝙶𝚁𝚄𝙿𝙾:* ${sum}\n\n*[ 👻 𝙻𝙸𝚂𝚃𝙰 𝙳𝙴 𝙵𝙰𝙽𝚃𝙰𝚂𝙼𝙰𝚂 👻 ]*\n${sider.map(v => '  👉🏻 @' + v.replace(/@.+/, '')).join('\n')}\n\n*𝙽𝙾𝚃𝙰: 𝙴𝚂𝚃𝙾 𝙿𝚄𝙴𝙳𝙴 𝙽𝙾 𝚂𝙴𝚁 𝟷𝟶𝟶% 𝙰𝙲𝙴𝚁𝚃𝙰𝙳𝙾, 𝙴𝙻 𝙱𝙾𝚃 𝙸𝙽𝙸𝙲𝙸𝙰 𝙴𝙻 𝙲𝙾𝙽𝚃𝙴𝙾 𝙳𝙴 𝙼𝙴𝙽𝚂𝙰𝙹𝙴𝚂 𝙰𝙿𝙰𝚁𝚃𝙸𝚁 𝙳𝙴 𝚀𝚄𝙴 𝚂𝙴 𝙰𝙲𝚃𝙸𝚅𝙾 𝙴𝙽 𝙴𝚂𝚃𝙴 𝙽𝚄𝙼𝙴𝚁𝙾*`, null, { mentions: sider })}
handler.command = /^(verfantasmas|fantasmas|sider)$/i
handler.admin = true
handler.botAdmin = true
export default handler
