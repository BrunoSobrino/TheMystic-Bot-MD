let handler = async (m, { conn }) => {
m.reply(global.rolgacha)}
handler.help = ['rolgacha']
handler.tags = ['grupo']
handler.command = /^(rolgacha|gachainfo|infog)$/i
handler.group = true;
export default handler

global.rolgacha = `🌸| Comandos Gacha:

_*[BOT SUMIKA]*_
• #rw - Girar waifu.

• #waifus - Ver tus waifus.

• #c - Reclamar waifu.

• #ginfo - Ver tu información de gacha (Tiempo restante para volver a tirar o reclamar).

• #trade [Tu waifu] [Waifu del usuario a intercambiar] - Intercambias tu waifu por la del otro usuario.

• #wshop - Ver waifus en venta.

• #sell [Precio] [Nombre de la waifu] - Pon a la venta tu waifu.

• #buyc [Nombre de la waifu] - Comprar waifu a la venta.

• #delwaifu [Nombre de la waifu] - Eliminar una waifu reclamada.

• #givechar [Usuario] [Nombre de la waifu] - Regala waifu a un usuario.

_° Mas comandos de gacha usando #menu y mira la sección Gacha!_.
`
