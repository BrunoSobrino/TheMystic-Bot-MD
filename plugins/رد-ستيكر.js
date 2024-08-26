import { sticker } from '../lib/sticker.js'
let handler = async(m, { conn }) => {
 
    const s = [
"https://i.imgur.com/0g7Z1cF.png"
    ];  
    
    let stiker = await sticker(null, s[Math.floor(Math.random() * s.length)])
    if (stiker) {
        conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
    }
}

handler.customPrefix = /(سكس|هات سكس|.سكس|.هات سكس|فديو سكس|.فديو سكس)$/i;
handler.command = new RegExp
handler.exp = 50
export default handler
