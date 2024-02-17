import { webp2mp4 } from '../lib/webp2mp4.js'

let handler = async (m, { conn, usedPrefix, command }) => {
	let q = m.quoted ? m.quoted : m
	let mime = (q.msg || q).mimetype || q.mediaType || ''
	if (/webp/.test(mime) || /ptv/.test(q.mtype) || q.isAnimated) {
	let out = await q.download()
	if (/webp/.test(mime)) out = await webp2mp4(out).catch(_ => null) || Buffer.alloc(0)
	await conn.sendFile(m.chat, out, '', '*DONE*', m)
	} else throw `Reply sticker / ptv with command *${usedPrefix + command}*`
}

handler.help = ['ptvtovideo','tomp4']
handler.tags = ['tools']
handler.command = /^((ptv)?to(mp4|video))$/i

export default handler
