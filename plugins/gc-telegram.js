let handler = async (m, { conn }) => {
m.reply(global.telegram, 'https://t.me/FutabuClub', 'ENTRAR | JOIN 🤠')}
handler.customPrefix = /telegram|grupodetelegram|linktelegram/i
handler.command = new RegExp
export default handler

global.telegram = `
Nuestro grupo de Telegram!
Link: https://t.me/FutabuClub
`
