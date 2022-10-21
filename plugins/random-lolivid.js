let handler  = async (m, { conn, usedPrefix, command }) => {
let res = "https://recoders-area.caliph.repl.co/api/lolivid"
conn.sendHydrated(m.chat, null, null, res, null, null, null, null, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], m)}
handler.help = ['lolivid']
handler.tags = ['random']
handler.command = /^(lolivid|lolivideos|lolívid)$/i
export default handler
