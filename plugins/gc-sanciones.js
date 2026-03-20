let handler = async (m, { conn }) => {
m.reply(global.sanciones)}
handler.help = ['sanciones']
handler.tags = ['grupo']
handler.command = /^(sanciones|sanctions|sancionesgrupo|sanctionsgroup)$/i
handler.group = true;
export default handler

global.sanciones = `🔨| Sanciones:

✭ No Respetar, Peleas, Ser Tóxico, Spam
﹂1-2 Warns: Temporal, 3 Warns: Temporal, 4 Warns o más: Permanente

✭ Pedofilia, Doxear, Mandar Binarios o Inmune, Mandar CP
﹂BAN PERMANENTE

✭ Mandar Gore, Acosar, Mandar Packs
﹂4 Warns: Temporal o Permanente

✭ Flood
﹂3 Warns: Temporal, 4 Warns o más: Permanente

-------------------------------

🔄| Eliminación de Warns:
Si no recibes warns en 1 mes, se eliminarán gradualmente.

🚫| 15 Warns:
Ban permanente del grupo.

❓| Apelaciones:
Dependerá del admin y se discutirá con admins supremos y otros admins.`
