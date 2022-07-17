import fetch from 'node-fetch'
const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
let handler = async (m, { args, usedPrefix, command }) => {
if (!args[0]) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝚄𝙽 𝙴𝙽𝙻𝙰𝙲𝙴 𝙳𝙴 𝙶𝙸𝚃𝙷𝚄𝙱, 𝙴𝙹𝙴𝙼𝙿𝙻𝙾: ${usedPrefix + command} https://github.com/BrunoSobrino/TheMystic-Bot-MD*`
if (!regex.test(args[0])) throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙻𝙸𝙽𝙺 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾!*'
let [_, user, repo] = args[0].match(regex) || []
repo = repo.replace(/.git$/, '')
let url = `https://api.github.com/repos/${user}/${repo}/zipball`
let filename = (await fetch(url, { method: 'HEAD' })).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
m.reply(`*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚂𝙿𝙴𝚁𝙴 𝚄𝙽 𝙼𝙾𝙼𝙴𝙽𝚃𝙾 𝙴𝙽 𝙻𝙾 𝚀𝚄𝙴 𝙴𝙽𝚅𝙸𝙾 𝚂𝚄 𝙰𝚁𝙲𝙷𝙸𝚅𝙾, 𝚂𝙸 𝙴𝚂𝚃𝙴 𝙽𝙾 𝙴𝚂 𝙴𝙽𝚅𝙸𝙰𝙳𝙾 𝙿𝚄𝙴𝙳𝙴 𝙳𝙴𝙱𝙴𝚁𝚂𝙴 𝙰 𝚀𝚄𝙴 𝙴𝙻 𝚁𝙴𝙿𝙾𝚂𝙸𝚃𝙾𝚁𝙸𝙾 𝙴𝚂 𝙼𝚄𝚈 𝙿𝙴𝚂𝙰𝙳𝙾*`)
conn.sendFile(m.chat, url, filename, null, m)
}
handler.help = ['gitclone <url>']
handler.tags = ['downloader']
handler.command = /gitclone/i
export default handler
