let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) throw `*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝚄𝙽 𝚃𝙴𝚇𝚃𝙾 𝙿𝙰𝚁𝙰 𝙲𝚁𝙴𝙰𝚁 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 𝚈 𝙰𝚂𝙸 𝚄𝚂𝙰𝚁 𝙻𝙰 𝙵𝚄𝙽𝙲𝙸𝙾𝙽 𝙳𝙴 𝙳𝙰𝙻𝙻-𝙴*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾𝚂 𝙳𝙴 𝙿𝙴𝚃𝙸𝙲𝙸𝙾𝙽𝙴𝚂*\n*◉ ${usedPrefix + command} gatitos llorando*\n*◉ ${usedPrefix + command} hatsune miku beso*`
try {
m.reply('*[❗] 𝙴𝚂𝙿𝙴𝚁𝙴 𝚄𝙽 𝙼𝙾𝙼𝙴𝙽𝚃𝙾 𝙴𝙽 𝙻𝙾 𝚀𝚄𝙴 𝙼𝙰𝙽𝙳𝙾 𝙻𝙾 𝚀𝚄𝙴 𝙼𝙴 𝙿𝙸𝙳𝙸𝙾*')
let tiores = await conn.getFile(`https://api.lolhuman.xyz/api/dall-e?apikey=${lolkeysapi}&text=${text}`)
await conn.sendFile(m.chat, tiores.data, null, null, m)
} catch {
throw `*[❗] 𝙴𝚁𝚁𝙾𝚁, 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝚁𝙻𝙾*`
}}
handler.command = ['dall-e', 'dalle', 'ia2', 'cimg', 'openai2']
export default handler
