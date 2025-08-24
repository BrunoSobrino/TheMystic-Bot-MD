import axios from "axios"
import fs from "fs"
import FormData from "form-data"

const handler = async (m, { conn, usedPrefix, command }) => {
  const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas_hd

  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ""
    if (!mime) throw `${tradutor.texto1} ${usedPrefix + command}*`
    if (!/image\/(jpe?g|png)/.test(mime)) throw `${tradutor.texto2[0]} (${mime}) ${tradutor.texto2[1]}`

    m.reply(tradutor.texto3)

    let imgUrl = q?.msg?.url || q?.url || ""
    if (!imgUrl || !imgUrl.startsWith("http")) throw tradutor.texto4

    let catboxUrl = await uploadToCatbox(imgUrl)
    let banner = await upscaleWithStellar(catboxUrl)

    await conn.sendMessage(m.chat, { image: banner }, { quoted: m })
  } catch {
    throw tradutor.texto4
  }
}

handler.help = ["remini", "hd", "enhance"]
handler.tags = ["ai", "tools"]
handler.command = ["remini", "hd", "enhance"]
export default handler

async function uploadToCatbox(imageUrl) {
  const form = new FormData()
  form.append("reqtype", "urlupload")
  form.append("url", imageUrl)

  const { data } = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders()
  })

  if (!data.startsWith("https://files.catbox.moe/")) throw "Falló la subida a Catbox"
  return data
}

async function upscaleWithStellar(url) {
  const endpoint = `https://api.stellarwa.xyz/tools/upscale?url=${encodeURIComponent(url)}&apikey=Gawr`

  const { data } = await axios.get(endpoint, {
    responseType: "arraybuffer",
    headers: {
      accept: "image/*"
    }
  })

  return Buffer.from(data)
}