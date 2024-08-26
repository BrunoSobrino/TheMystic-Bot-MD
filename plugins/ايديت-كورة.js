let handler = async (m, { conn, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, {
   react: {
 text: "⚽",
 key: m.key,
   }
  })

  await conn.sendMessage(m.chat, { video: { url: dir[Math.floor(Math.random() * dir.length)] }, caption: global.veeeee }, { quoted: m })
}

handler.help = ['ايديت_زو-رو']
handler.tags = ['anime']
handler.command = /^(editfoot|اديت-كوره|اديت-كورة|اديت-فوت)$/i
handler.limit = false

export default handler

const dir = [
'https://telegra.ph/file/5fb7c13a4d93917f97ff3.mp4',
'https://telegra.ph/file/2a4e007bec39cc66385b0.mp4',
'https://telegra.ph/file/a22d5d23a85c4d7b2cdac.mp4',
'https://telegra.ph/file/148dcadb72c631e0a9d1c.mp4',
'https://telegra.ph/file/6699964c4f9486bafac22.mp4',
'https://telegra.ph/file/aec768d540e249ceb0c5b.mp4',
'https://telegra.ph/file/b2f92a40a7b869896d360.mp4',
'https://telegra.ph/file/cd611bb1e76ceac182de8.mp4',
'https://telegra.ph/file/0c4046c6477431bbed40d.mp4',
'https://telegra.ph/file/d84e53e96fb44ec4cbd23.mp4',
'https://telegra.ph/file/1286e1bf83c9901308cd8.mp4',



'',
]
