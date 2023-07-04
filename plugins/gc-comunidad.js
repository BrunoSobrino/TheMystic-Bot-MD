let handler = async (m, { conn }) => {
m.reply(global.comunidad)}
handler.help = ['comunidad']
handler.tags = ['grupo']
handler.command = /^(comunidad|grupocomunidad|grupoavisos)$/i
export default handler

global.comunidad = `*GRUPO DE LA COMUNIDAD*

_⚠️| Este grupo será solamente de avisos o noticias relacionada con los grupos de la comunidad Futabu, solo podran hablar los del Equipo de Staff y los miembros solo podran ver, usaremos este grupo ya que facilitara el ver mas rapido el mensaje ya que en varios grupos se habla demasiado y se pierden los mensajes._

Link: https://chat.whatsapp.com/KAVBUhcHZvqK510kn7wofQ`
