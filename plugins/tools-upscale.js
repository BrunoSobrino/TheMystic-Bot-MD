import axios from "axios"
import FormData from "form-data"
import uploadImage from "../src/libraries/uploadImage.js"

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ""

    if (!mime || !mime.includes("image")) {
      return m.reply(`✖️ *Envía o responde una imagen para mejorarla en HD.*`)
    }

    // Mensaje de procesamiento
    let status = await conn.sendMessage(m.chat, { text: "⏳ *Procesando imagen en HD...*" }, { quoted: m })

    // Descargar imagen
    let img = await q.download()
    if (!img) return m.reply("✖️ No pude descargar la imagen.")

    // Preparar formulario para POST
    let form = new FormData()
    form.append("image", img, {
      filename: "image.jpg",
      contentType: mime
    })
    form.append("scale", 4)

    // Llamada API
    const { data } = await axios.post(
      "https://api.siputzx.my.id/api/iloveimg/upscale",
      form,
      {
        headers: {
          ...form.getHeaders()
        },
        responseType: "arraybuffer"
      }
    )

    // Enviar imagen HD
    await conn.sendMessage(
      m.chat,
      { image: data, caption: "✅ *Imagen mejorada a HD.*" },
      { quoted: m }
    )

    // Cambiar mensaje a check ✔
    await conn.sendMessage(
      m.chat,
      { edit: status.key, text: "✔️ *Proceso completado*" }
    )

  } catch (e) {
    console.log(e)
    m.reply("✖️ Ocurrió un error procesando la imagen.")
  }
}

handler.help = ["hd", "upscale"]
handler.tags = ["tools"]
handler.command = /^(hd|upscale|enhance)$/i

export default handler
