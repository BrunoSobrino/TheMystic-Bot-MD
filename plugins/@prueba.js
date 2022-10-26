import { getLastMessageInChat } from '@adiwajshing/baileys'
let handler = async (m, { conn }) => {
 
const lastMsgInChat = await getLastMessageInChat('5219996125657@s.whatsapp.net') // implement this on your end
await conn.chatModify({ delete: true, lastMessages: [{ key: lastMsgInChat.key, messageTimestamp: lastMsgInChat.messageTimestamp }]}, '5219996125657@s.whatsapp.net')

}
handler.command = /^(clearchat)$/i
export default handler
