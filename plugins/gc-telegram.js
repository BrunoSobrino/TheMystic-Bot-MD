let handler = async (m, { conn, command }) => {
let str = `
Nuestro grupo de Telegram!
Link: https://t.me/FutabuClub
`.trim()
  
conn.sendHydrated(m.chat, str, wm, null, 'https://t.me/FutabuClub', 'ENTRAR | JOIN 🤠', null, null, [
['null']
], m,)}

handler.command = /^telegram|grupodetelegram|linktelegram$/i
handler.exp = 35
export default handler
