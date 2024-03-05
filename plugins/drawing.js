/* -------------------------------------------------------*/
/* [❗]                      [❗]                      [❗] */
/*                                                       */
/*        |- [ ⚠ ] - CODE CREDITS - [ ⚠ ] -|            */
/*          —◉ DEVELOPED BY LUA SER OFC:                 */
/*       ◉ git : (https://github.com/xxirfanx)           */
/*                                                       */
/* [❗]                      [❗]                      [❗] */
/* -------------------------------------------------------*/
import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {
        let wm = global.me
        if (!text) throw `This command generates image from texts\n\n Example usage\n${ usedPrefix + command } 1girl, blush, megane, school uniform`
        await m.reply('*انتظر قليلا*')
        await conn.relayMessage(m.chat, { reactionMessage: { key: m.key, text: '⌛'  }}, { messageId: m.key.id })
        try {
        let ff = await fetch(`https://api.neoxr.eu/api/waifudiff?q=${text}`)
        let anu = await ff.json()
        await conn.sendFile(m.chat, anu.data.url, 'image.jpg', wm, m)
        m.react('🎐')
      } catch (e) {
        console.log(e)
        m.reply('instagram.com/f.b.i_ys._ess._ui_.di_man_6000')
      }
    }

handler.help = ['animediff2 <text>']
handler.tags = ['ai']
handler.command = /^(drawing)$/i

export default handler
