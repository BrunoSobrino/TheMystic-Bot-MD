import fg from 'api-dylux'
let handler = async (m, { conn, text, args }) => {

  if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝚂𝙴𝚁𝚃𝙴 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 𝙼𝙰𝚂 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴 𝚄𝙽 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴 𝚃𝙸𝙺𝚃𝙾𝙺*`
  let res = await fg.ttStalk(args[0])
  let gabrieltxt = `
┌────「 TIKTOKSTALK 」
│✰ *Nombre:* ${res.name}
│✰ *Usuario:* ${res.username}
│✰ *Seguidores:* ${res.followers}
│✰ *Siguiendo:* ${res.following}
│✰ *Data:* ${res.desc}
│✰ *Enlace:*
│✰ https://tiktok.com/${res.username}
└───────────────┈`
  await conn.sendFile(m.chat, res.profile, 'tt.png', gabrieltxt, m)
}
handler.help = ['tiktokstalk']
handler.tags = ['dl']
handler.command = /^t(tstalk|tiktokstalk|ttstalk|tiktoktalk)$/i

export default handler;