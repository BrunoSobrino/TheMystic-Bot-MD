//let media = './media/menus/telefutaclub.jpeg'
let handler = async (m, { conn, command }) => {
let str = `
*_Aca tienes los 2 bancos para transferir dinero para la mejora del bot!_*
*Paypal:* colapsuspaypal2005@gmail.com (Benjamin Chacon)
*Banco Virtual (Mercado Pago, Uala, Etc)*
Alias: COLAPSUSHD2020.UALA
CBU/CVU: 0000007900204654633937
Si estas deacuerdo con apoyar porfavor presiona el boton que esta debajo
`.trim()
  
conn.sendHydrated(m.chat, str, wm, null, null, null, null, null, [
['✊ APOYO A LA MEJORA!', 'null']
], m,)}

handler.command = /^apoyo|mejorar|apoyobot|mejorarbot$/i
handler.exp = 35
export default handler
