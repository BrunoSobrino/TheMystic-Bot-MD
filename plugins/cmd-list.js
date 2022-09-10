let handler = async (m, { conn }) => {
conn.reply(m.chat, `
*< 𝙻𝙸𝚂𝚃𝙰 𝙳𝙴 𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂 / 𝚃𝙴𝚇𝚃𝙾𝚂 𝙰𝚂𝙸𝙶𝙰𝙽𝙳𝙾𝚂 />*

${Object.entries(global.db.data.sticker).map(([key, value], index) => `${index + 1}. ${value.locked ? `*(bloqueado)* ${key}` : key} : ${value.text}`).join('\n\n')}
`.trim(), null, {mentions: Object.values(global.db.data.sticker).map(x => x.mentionedJid).reduce((a, b) => [...a, ...b], [])})
}
handler.command = ['listcmd', 'cmdlist']
export default handler
