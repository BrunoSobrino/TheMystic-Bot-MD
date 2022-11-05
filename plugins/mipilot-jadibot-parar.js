let handler  = async (m, { conn }) => {
if (global.conn.user.jid == conn.user.jid) conn.reply(m.chat, 'Por qué no vas directamente con el numero del Bot?', m)
else {
await conn.reply(m.chat, 'Adiós Bot :\')', m)
conn.ws.close()}}
handler.command = /^(berhenti|stop)$/i
handler.owner = true  
handler.fail = null
export default handler
