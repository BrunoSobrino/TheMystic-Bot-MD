let handler = m => {
let msgs = global.db.data.msgs
m.reply(`
*🔰 𝙻𝙸𝚂𝚃𝙰 𝙳𝙴 𝚃𝙴𝚇𝚃𝙾𝚂/𝙼𝙴𝙽𝚂𝙰𝙹𝙴𝚂/𝙿𝙰𝙻𝙰𝙱𝚁𝙰𝚂 𝙲𝙻𝙰𝚅𝙴𝚂 🔰*

*✳️ 𝙼𝙴𝙽𝚂𝙰𝙹𝙴𝚂 ✳️*
${Object.keys(msgs).map(v => '*👉🏻 ' + v).join('*\n*')}*
`.trim())
}
handler.help = ['vn', 'msg', 'video', 'audio', 'img', 'sticker'].map(v => 'list' + v)
handler.tags = ['database']
handler.command = /^lista(vn|msg|video|audio|img|sticker)$/
export default handler