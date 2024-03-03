// made by lua ser ofc
import fetch from 'node-fetch'

let handler = async (m, { text,  usedPrefix,  command }) => {
    if (!text) throw `Hey is there anything I can help you with??`
    let order = { text: wait, mentions: [m.sender], contextInfo: { forwardingScore: 256, isForwarded: true }};
let aii = await fetch(`https://api.lolhuman.xyz/api/openai?apikey=${apilol}
&text=${text}&user=user-unique-en`)
  let oke = await aii.json()
  let { key } = await conn.sendMessage(m.chat, order, { quoted: m });
  await new Promise(resolve => setTimeout(resolve, 2000));
  await conn.sendMessage(m.chat, { text: `${oke.result}`, edit: key }, { quoted: m });
    }

handler.help = ['ai', 'openai', 'gpt']
handler.tags = ['ai']
handler.command = /^(ai|openai|gpt)$/i

export default handler
