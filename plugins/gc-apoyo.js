import { generateWAMessageFromContent } from '@adiwajshing/baileys'
import fs from 'fs'
let handler = async (m, { conn, usedPrefix, command }) => {
let name = await conn.getName(m.sender)
let apoyo =`*_Aca tienes los 2 bancos para transferir dinero para la mejora del bot!_*
*Paypal:* colapsuspaypal2005@gmail.com (Benjamin Chacon)

*Banco Virtual (Mercado Pago, Uala, Etc)*
Alias: COLAPSUSHD2020.UALA
CBU/CVU: 0000007900204654633937
Si estas deacuerdo con apoyar porfavor presiona el boton que esta debajo`.trim()
let aa = { quoted: m, userJid: conn.user.jid }
let res = generateWAMessageFromContent (m.chat, {null, null, null, caption: apoyo, secuenceNumber: "0", contextInfo: {mentionedJid: conn.parseMention()}}}, aa)
conn.relayMessage(m.chat, res.message, {})
}
handler.help = ['apoyo']
handler.tags = ['grupo']
handler.command = /^apoyo|mejorar|apoyobot|mejorarbot$/i
export default handler
