//let media = './media/menus/telefutaclub.jpeg'
let handler = async (m, { conn, command }) => {
let str = `
Nada aún!
`.trim()
  
conn.sendHydrated(m.chat, str, null, null, null, null, null, [
], m,)}

handler.command = /^concurso|concursofutabuclub$/i
handler.exp = 35
export default handler
