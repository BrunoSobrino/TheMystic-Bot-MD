import xa from 'xfarr-api'

let handler = async (m, { conn, text }) => {
   if (!text) throw `[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙲𝙾𝙳𝙸𝙶𝙾 𝙾 𝚃𝙴𝚇𝚃𝙾 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙰 𝙾𝙵𝚄𝚂𝙲𝙰𝚁`
   let res = await xa.tools.obfuscatorjs(text)
   conn.reply(m.chat, res.result, m)
}

handler.help = ['encsc','encscrip','obf']
handler.tags = ['tools']
handler.premium = true
handler.command = /^(encscrip|encsc|obf)$/i
export default 𝚑𝚊𝚗𝚍𝚕𝚎𝚛

/* El comando favorito de Bruno

By Diego-ofc programador profesional*/
