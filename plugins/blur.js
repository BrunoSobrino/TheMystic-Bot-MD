import jimp from 'jimp'

let handler = async (m, { conn, text }) => {
	let image = m.message?.imageMessage
		? await m.download()
			: /image/.test(m.quoted?.mediaType)
		? await m.quoted.download()
			: m.mentionedJid?.[0]
		? await conn.profilePictureUrl(m.mentionedJid[0], 'image')
			: await conn.profilePictureUrl(m.quoted?.sender || m.sender, 'image')
	if (!image) throw `تعذر جلب الصورة المطلوبة`
	let level = text || '5', img = await jimp.read(image)
	img.blur(isNaN(level) ? 5 : parseInt(level))
	img.getBuffer('image/jpeg', (err, buffer) => {
		if (err) throw err?.message || `تعذر تعتيم الصورة`
		m.reply(buffer)
	})
}
handler.help = ["blur"]
handler.tags = ["image-edit"];
handler.command = /^(blur)$/i

export default handler
