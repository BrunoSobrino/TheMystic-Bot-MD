let handler = m => m
export async function all(m) {
let user = global.db.data.users[m.sender]
if (m.chat.endsWith('broadcast')) return
if (user.premiumTime != 0 && user.premium) {
if (new Date() * 1 >= user.premiumTime) {
await m.reply(`*@${m.sender.split`@`[0]} ¡𝚂𝙴 𝙰𝙲𝙰𝙱𝙾 𝚃𝚄 𝚃𝙸𝙴𝙼𝙿𝙾 𝙳𝙴 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!*\n𝚂𝙸 𝚀𝚄𝙸𝙴𝚁𝙴𝚂 𝙾𝙱𝚃𝙴𝙽𝙴𝚁 𝚄𝙽 𝙽𝚄𝙴𝚅𝙾 𝙿𝙰𝚂𝙴 𝚄𝚂𝙰 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾\n*#pase premium*`, false, { mentions: [m.sender] })
user.premiumTime = 0
user.premium = false 
}}}
