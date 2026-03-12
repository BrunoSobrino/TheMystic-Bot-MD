import fs from "fs"
import axios from "axios"
import uploadImage from "../src/libraries/uploadImage.js"

const handler = async (m, { conn, usedPrefix, command }) => {
  const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas_hd

  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ""

    // Validación de imagen
    if (!mime) throw `*${tradutor.texto1} ${usedPrefix + command}*`
    if (!/image\/(jpe?g|png)/.test(mime)) throw `*${tradutor.texto2[0]} (${mime}) ${tradutor.texto2[1]}*`

    m.reply(tradutor.texto3) // Mensaje de "esperando..."

    const img = await q.download()
    const fileUrl = await uploadImage(img)
    
    // Llamada a la nueva API
    const imageBuffer = await upscaleImage(fileUrl)

    await conn.sendMessage(m.chat, { image: imageBuffer, caption: '✅ Imagen mejorada con éxito' }, { quoted: m })
  } catch (e) {
    console.error(e)
    throw `${tradutor.texto4} ${e.message || e}`
  }
}

handler.help = ["remini", "hd", "enhance"]
handler.tags = ["ai", "tools"]
handler.command = ["remini", "hd", "enhance"]

export default handler

// Función para conectar con la API de apicausas.xyz
async function upscaleImage(url) {
  try {
    // Nota: Sustituye 'TU_APIKEY' por tu clave real si es necesario
    const apikey = "causa-0e3eacf90ab7be15" 
    const endpoint = `https://rest.apicausas.xyz/api/v1/utilidades/upscale?apikey=${apikey}&url=${url}&type=4`

    const response = await axios.get(endpoint, {
      responseType: "arraybuffer"
    })

    return Buffer.from(response.data)
  } catch (err) {
    throw "Error al procesar la imagen con la API."
  }
}

