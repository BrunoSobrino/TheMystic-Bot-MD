//let media = './media/menus/telefutaclub.jpeg'
let handler = async (m, { conn, command }) => {
let str = `
Nuestro Server de Discord!
Link: https://discord.gg/UjdSaTESQG
`.trim()
  
conn.sendHydrated(m.chat, str, wm, null, 'https://discord.gg/UjdSaTESQG', 'ENTRAR | JOIN 🤠', null, null, [
['𝙑𝙤𝙡𝙫𝙚𝙧 𝙖𝙡 𝙈𝙚𝙣𝙪́ | 𝘽𝙖𝙘𝙠 𝙩𝙤 𝙈𝙚𝙣𝙪 ☘️', '/menu']
], m,)}

handler.command = /^serverdis|serverdiscord|discord|grupodiscord|linkdiscord$/i
handler.exp = 35
export default handler
