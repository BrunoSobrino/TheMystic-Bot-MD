let handler = async (m, { conn, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, {
   react: {
 text: "🏎️",
 key: m.key,
   }
  })

  await conn.sendMessage(m.chat, { video: { url: dir[Math.floor(Math.random() * dir.length)] }, caption: global.veeeee }, { quoted: m })
}

handler.help = ['ايديت_زو-رو']
handler.tags = ['anime']
handler.command = /^(editcar|اديت-سيارات|اديت-كار|ايديت كار)$/i
handler.limit = false

export default handler

const dir = [
'https://telegra.ph/file/ee325a0a341ee173eec9c.mp4',
'https://telegra.ph/file/d8c4ba7aee05a8f7ab9af.mp4',
'https://telegra.ph/file/46d36ddea72b42c8a8fbc.mp4',
'https://telegra.ph/file/6b57530e815f4fa72b218.mp4',
'https://telegra.ph/file/9cb12f19c845f23adafc2.mp4',
'https://telegra.ph/file/efe644ac9f821d9fb0347.mp4',
'https://telegra.ph/file/e81ba6bd036d26a69fdb6.mp4',
'https://telegra.ph/file/cdb6bea3c1a143b3a85c9.mp4',
'https://telegra.ph/file/777fced1fdbcf077cb279.mp4',
'https://telegra.ph/file/3177e7f9049b1f3744bec.mp4',
'https://telegra.ph/file/1f4f0d1b80e8b0f9c3581.mp4',
'https://telegra.ph/file/8c8179a0f472ae3104bfb.mp4',
'https://telegra.ph/file/fb150150c7808a10528d4.mp4',
'https://telegra.ph/file/86272fe9eb454028adda7.mp4',
'https://telegra.ph/file/80373dc38502969a07112.mp4',
'https://telegra.ph/file/c19e3f7142ba9ef7567d2.mp4',
'https://telegra.ph/file/5a778f9cdfdb663c0166d.mp4',
'https://telegra.ph/file/198643db60caee6ad98f2.mp4',
'https://telegra.ph/file/308642155c1f7b987009d.mp4',
'https://telegra.ph/file/8737d43a65b93cc33f732.mp4',
'https://telegra.ph/file/be5d1f4e6ce6edf54c1a5.mp4',
'https://telegra.ph/file/5a5547c0970d508084e05.mp4',
'https://telegra.ph/file/4ba9e08ac647b90042eef.mp4',
'https://telegra.ph/file/34258adcd7d940f923916.mp4',
'https://telegra.ph/file/e6447d3c2a75607286a2b.mp4',
'https://telegra.ph/file/27c283614afe9bce3a1f6.mp4',
'https://telegra.ph/file/4ec3987385e00ec3b99d4.mp4',
'https://telegra.ph/file/69c82ebcf939925cb00b0.mp4',
'https://telegra.ph/file/c6521764d81b3aef7a0aa.mp4',
'https://telegra.ph/file/4711436a06e7114c5c02f.mp4',
'https://telegra.ph/file/0da9cabf8f654beaa8ab1.mp4',
'https://telegra.ph/file/1b938d65265dad09a18f4.mp4',
'https://telegra.ph/file/4f1875f7d3a7e918e8383.mp4',
'https://telegra.ph/file/e316f2e03cd5351c44be1.mp4',
'https://telegra.ph/file/0005be786d5c6290c21bf.mp4',
'https://telegra.ph/file/97e1d917ef27bdde139b5.mp4',
'https://telegra.ph/file/200d367d52fae71a8c1dc.mp4',
'https://telegra.ph/file/e8748bc27e4bedba4497d.mp4',
'https://telegra.ph/file/ab1adeb3060d8a61c16f2.mp4',
'https://telegra.ph/file/071b2fdb705c762edeb65.mp4',
'https://telegra.ph/file/53a798ff2300aec3dcc43.mp4',
'https://telegra.ph/file/29e777a0249addbf5010b.mp4',
'https://telegra.ph/file/3340b863eb3da14dc33c3.mp4',
'https://telegra.ph/file/ef560987c09353e688ac1.mp4',
'https://telegra.ph/file/52e5928afc33c94eab77c.mp4',
'https://telegra.ph/file/03bd665c91e9973cbd029.mp4',
'https://telegra.ph/file/ce860a3cd452979562f49.mp4',
'https://telegra.ph/file/fa6226f8a2fb21e7febb0.mp4',
'https://telegra.ph/file/58bc613038a6bd6e8654f.mp4',
'https://telegra.ph/file/57f63af095f7d1275730a.mp4',
'https://telegra.ph/file/6e5329f46ddb0b1ca4999.mp4',
'https://telegra.ph/file/c433b911b7d15afa127d2.mp4',
'https://telegra.ph/file/ede787d68d40b611df959.mp4',
'https://telegra.ph/file/f16f1d4b80f85f2c2125e.mp4',
'https://telegra.ph/file/53d9e5b0783aa5ce99b9b.mp4',
]
