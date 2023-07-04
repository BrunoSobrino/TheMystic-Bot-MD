let handler = async (m, { conn }) => {
m.reply(global.telegram)}
handler.help = ['telegram']
handler.tags = ['grupo']
handler.command = /^(telegram|grupodetelegram|linktelegram)$/i
export default handler

global.telegram = `Nuestro grupo de Telegram!
Link: https://t.me/FutabuClub`
