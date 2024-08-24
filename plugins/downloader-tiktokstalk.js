import fetch from 'node-fetch'
let handler = async (m, { conn, text, args }) => {

  if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝚂𝙴𝚁𝚃𝙴 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 𝙼𝙰𝚂 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴 𝚄𝙽 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴 𝚃𝙸𝙺𝚃𝙾𝙺*`
  const response = await axios.get("https://deliriusapi-official.vercel.app/tools/tiktokstalk", { params: { q: text } });
    const data = response.data;

    if (data.status && data.result) {

      const user = data.result.users;
      const stats = data.result.stats;
      
      let msg = `
┌────「 TIKTOKSTALK 」
│✰ *Nombre:* ${user.nickname}
│✰ *Usuario:* ${user.username}
│✰ *Seguidores:* ${(stats.followerCount) || stats.followerCount}
│✰ *Siguiendo:* ${(stats.followingCount) || stats.followingCount}
│✰ *Data:* ${user.signature}
│✰ *Enlace:*
│✰ https://tiktok.com/${user.nickname}
└───────────────┈`
  await conn.sendFile(m.chat, user.avatarLarger, 'tt.png', msg, m)
}
handler.help = ['tiktokstalk']
handler.tags = ['dl']
handler.command = /^t(tstalk|tiktokstalk|ttstalk|tiktoktalk)$/i

export default handler;
