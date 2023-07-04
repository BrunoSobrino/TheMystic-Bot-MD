let handler = async (m, { conn }) => {
m.reply(global.telegram)}
handler.help = ['apoyo']
handler.tags = ['grupo']
handler.command = /^(apoyo|mejorar|apoyobot|mejorarbot)$/i
export default handler

global.telegram = `Nuestro grupo de Telegram!
Link: https://t.me/FutabuClub`
