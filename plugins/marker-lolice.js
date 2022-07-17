let handler = async (m, { conn, usedprefix }) => {
let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
conn.sendButton(m.chat, '*🚔🚨 𝐋𝐎𝐋𝐈𝐂𝐎𝐍𝐒 𝐂𝐎𝐌𝐎 𝐓𝐔 𝐒𝐎𝐋𝐎 𝐏𝐄𝐑𝐓𝐄𝐍𝐄𝐂𝐄𝐍 𝐀 𝐋𝐀 𝐂𝐀𝐑𝐂𝐄𝐋 🚨🚔*', author, global.API('https://some-random-api.ml', '/canvas/lolice', { 
avatar: await conn.profilePictureUrl(who, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png'),
}), [['𝚈𝙾 𝙰𝙼𝙾 𝙻𝙰𝚂 𝙻𝙾𝙻𝙸𝚂 💓', `/loli`]], m)}

handler.help = ['lolice']
handler.tags = ['maker']
handler.command = /^(lolice)$/i
export default handler
