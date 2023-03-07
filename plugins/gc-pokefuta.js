let handler = async (m, { conn, command }) => {
let str = `
Nuestro grupo de una sola tematica!

*⚠️| RECUERDA ESTE GRUPO ES DE UNA SOLA TEMATICA QUE ES FUTANARI RELACIONADO CON LA SERIE POKEMON, PUEDES MANDAR CONTENIDO VARIADO PERO SE RECOMIENDA MANDAR MAS DE LA TEMATICA!*

Link: https://chat.whatsapp.com/Hu4JbtFdWWDItj2hoe4X1D
`.trim()
  
conn.sendHydrated(m.chat, str, wm, null, 'https://chat.whatsapp.com/Hu4JbtFdWWDItj2hoe4X1D', 'ENTRAR | JOIN 🤠', null, null, [
['𝙑𝙤𝙡𝙫𝙚𝙧 𝙖𝙡 𝙈𝙚𝙣𝙪́ | 𝘽𝙖𝙘𝙠 𝙩𝙤 𝙈𝙚𝙣𝙪 ☘️', '/menu']
], m,)}

handler.command = /^pokefuta|linkpokefuta$/i
handler.exp = 35
export default handler
