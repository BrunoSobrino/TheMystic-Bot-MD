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
    let img = await q.download?.()
    let fileUrl = await uploadToUploadF(img)
    let banner = await upscaleWithStellar(fileUrl)

    await conn.sendMessage(m.chat, { image: banner }, { quoted: m })
  } catch {
    throw tradutor.texto4
  }
}

handler.help = ["remini", "hd", "enhance"]
handler.tags = ["ai", "tools"]
handler.command = ["remini", "hd", "enhance"]
export default handler

async function uploadToUploadF(buffer) {
  const form = new FormData()
  form.append("file", buffer, "image.jpg")

  const { data } = await axios.post("https://uploadf.com/api/upload", form, {
    headers: form.getHeaders()
  })

  if (!data || !data.status || !data.url) throw new Error("Falló la subida a UploadF")
  return data.url.trim()
}

async function upscaleWithStellar(url) {
  const endpoint = `https://api.stellarwa.xyz/tools/upscale?url=${url}&apikey=BrunoSobrino`

  const { data } = await axios.get(endpoint, {
    responseType: "arraybuffer",
    headers: {
      accept: "image/*"
    }
  })

  return Buffer.from(data)
}