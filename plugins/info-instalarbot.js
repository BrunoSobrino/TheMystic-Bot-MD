import { generateWAMessageFromContent } from '@adiwajshing/baileys'
let handler  = async (m, { conn }) => {
let texto = `
*—◉ 𝚃𝚄𝚃𝙾𝚁𝙸𝙰𝙻 𝙱𝙾𝚇𝙼𝙸𝙽𝙴 𝙷𝙾𝚂𝚃*
> Tutorial: https://youtu.be/eC9TfKICpcY
> Pagina Oficial: https://boxmineworld.com
> Dashboard: https://dash.boxmineworld.com/home
> Panel: https://panel.boxmineworld.com
> Soporte: https://discord.gg/84qsr4v 

------------------------------------

*—◉ 𝚃𝚄𝚃𝙾𝚁𝙸𝙰𝙻 𝙰𝙲𝙸𝙳𝙸𝙲𝙽𝙾𝙳𝙴𝚂 𝙷𝙾𝚂𝚃*
> Tutorial: https://youtu.be/nbjvreJ0tUk
> Pagina: https://billing.acidicnodes.ml/register?ref=ADII104p
> Soporte: https://whatsapp.acidicnodes.com

------------------------------------

*—◉ 𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂 𝚃𝙴𝚁𝙼𝚄𝚇*
> cd && termux-setup-storage
> apt-get update -y && apt-get upgrade -y
> pkg install -y git nodejs ffmpeg imagemagick && pkg install yarn 
> git clone https://github.com/BrunoSobrino/Mystic-termux.git && cd Mystic-termux 
> yarn install 
> npm install
> npm update
> npm install 
> npm start` 
let aa = { quoted: m, userJid: conn.user.jid }
let prep = generateWAMessageFromContent(m.chat, { extendedTextMessage: { text: texto, contextInfo: { externalAdReply: { title: 'ᴛʜᴇ ᴍʏsᴛɪᴄ - ʙᴏᴛ', body: null, thumbnail: imagen1, sourceUrl: 'https://github.com/BrunoSobrino/TheMystic-Bot-MD' }, mentionedJid: [m.sender] }}}, aa)
conn.relayMessage(m.chat, prep.message, { messageId: prep.key.id, mentions: [m.sender] })  
}
handler.command = /^(instalarbot)/i
export default handler
