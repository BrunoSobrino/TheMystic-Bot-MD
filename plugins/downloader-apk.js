import fetch from 'node-fetch' 
let handler = async (m, { conn, args, usedPrefix, command, text }) => {
if (!text) throw `⚠️️ *_Ingrese el nombre de la aplicación de Play Store que desea descargar._*`
try {
let res = await fetch(`https://api.akuari.my.id/downloader/apkdownloader?query=${text}`)
let json = await res.json()
let { version, updated, developer, id, requirements, installed } = json.info
let pp = await (await fetch('https://telegra.ph/file/e867ad919a98764a4d719.jpg')).buffer()
let info = `*🎋 • Versión:* ${version}\n*🗓️ • Actualización:* ${updated}\n*👨🏻‍💻 • Desarrollador:* ${developer}\n*ℹ️ • ID:* ${id}\n*📱 • Android:* ${requirements}\n*📈 • Instalada:* ${installed}`
await conn.sendNyanCat(m.chat, `${info}\n\n${global.wait}`, pp, `• Downloader Play Store🥗`, me, script, m)
conn.sendMessage(m.chat, { document: { url: `${json.apkdownload}` }, mimetype: 'application/videos.android.package-archive', fileName: `${text}.apk` }, { quoted: m })
} catch { m.reply('⚠️ *_Resultados no encontrados._*')}}
handler.help = ['apkdl *<nombre de apk>*']
handler.tags = ['downloader']
handler.command = ['dlapk', 'apkdl'] 
export default handler
