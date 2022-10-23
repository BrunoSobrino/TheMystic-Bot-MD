let handler = async (m, { conn, args, command }) => {
await m.reply('*Adios a todos, el Bot se despide! (≧ω≦)ゞ*') 
await  conn.groupLeave(m.chat)}
handler.command = /^(out|leavegc|leave|salirdelgrupo)$/i
handler.group = true
handler.rowner = true
export default handler
