//let media = './media/menus/telegramfutabuclub.jpg'
let handler = async (m, { conn, command }) => {
let str = `
*GRUPO DE LA COMUNIDAD*

_⚠️| Este grupo será solamente de avisos o noticias relacionada con los grupos de la comunidad Futabu, solo podran hablar los del Equipo de Staff y los miembros solo podran ver, usaremos este grupo ya que facilitara el ver mas rapido el mensaje ya que en varios grupos se habla demasiado y se pierden los mensajes._

Link: https://chat.whatsapp.com/KAVBUhcHZvqK510kn7wofQ
`.trim()
  
conn.sendHydrated(m.chat, str, wm, null, null, null, null, null,
], m,)}

handler.command = /^comunidad|grupocomunidad|grupoavisos$/i
handler.exp = 35
export default handler
