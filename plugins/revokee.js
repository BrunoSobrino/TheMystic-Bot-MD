import fetch from "node-fetch"


let handler = async (m, { conn }) => {

  let rest = await conn.groupRevokeInvite(m.chat)
  let linked = 'https://chat.whatsapp.com/' + rest
 let s = await shortUrl(linked)

    m.reply(s)

}
handler.help = ['revoke']
handler.tags = ['owner']
handler.command = /^revoke$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler


async function shortUrl(url) {
  let res = await fetch(`https://tinyurl.com/api-create.php?url=${url}`)
  return await res.text()
}
