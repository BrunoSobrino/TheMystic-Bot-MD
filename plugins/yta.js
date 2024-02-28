import fetch from 'node-fetch'
import { youtubedl } from '@bochilteam/scraper-sosmed'

let handler = async (m, { conn, args, usedPrefix, command }) => {
	if (!args[0]) throw `Example: ${usedPrefix + command} https://youtu.be/S1--lhvwLsc`
	if (!args[0].match(new RegExp(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/, 'gi'))) return m.reply(`Invalid Youtube URL.`)
	try {
		let anu = await youtubedl(args[0])
		let data = anu.audio[Object.keys(anu.audio)[0]]
		let url = await data.download()
		if (data.fileSize > 400000) return m.reply(`Filesize: ${data.fileSizeH}\nUnable to send, maximum file size is 400 MB`)
		await conn.sendFAudio(m.chat, { [/mp3/g.test(command) ? 'document' : 'audio']: { url: url }, mimetype: 'audio/mpeg', fileName: `${anu.title}.mp3` }, m, anu.title, anu.thumbnail, args[0])
	} catch (e) {
		console.log(e)
		try {
			let res = await fetch(`https://api.lolhuman.xyz/api/ytaudio?apikey=${apilol}&url=${args[0]}`)
			let anu = await res.json()
			anu = anu.result
			let vsize = anu.link.size.slice(-2)
			if (vsize == "GB") return m.reply(`No brain.\nWhere can I send videos ${anu.link.size}`)
			if (!somematch(['kB','KB'], vsize) && parseInt(anu.link.size.replace(" MB", "")) > 400) return m.reply(`Filesize: ${anu.link.size}\nUnable to send, maximum file size is 400 MB`)
			if (!anu.link.link) throw new Error('Error')
			await conn.sendFAudio(m.chat, { [/mp3/g.test(command) ? 'document' : 'audio']: { url: anu.link.link }, mimetype: 'audio/mpeg', fileName: `${anu.title}.mp3` }, m, anu.title, anu.thumbnail, args[0])
		} catch (e) {
			console.log(e)
			try {
				let res = await fetch(`https://api.lolhuman.xyz/api/ytaudio2?apikey=${apilol}&url=${args[0]}`)
				let anu = await res.json()
				anu = anu.result
				let vsize = anu.size.slice(-2)
				if (vsize == "GB") return m.reply(`No brain.\nWhere can I send videos ${anu.size}`)
				if (!somematch(['kB','KB'], vsize) && parseInt(anu.size.replace(" MB", "")) > 400) return m.reply(`Filesize: ${anu.size}\nUnable to send, maximum file size is 400 MB`)
				if (!anu.link) throw new Error('Error')
				await conn.sendFAudio(m.chat, { [/mp3/g.test(command) ? 'document' : 'audio']: { url: anu.link }, mimetype: 'audio/mpeg', fileName: `${anu.title}.mp3` }, m, anu.title, anu.thumbnail, args[0])
			} catch (e) {
				console.log(e)
				throw `Invalid Youtube URL / there is an error.`
			}
		}
	}
}

handler.help = ['yta <url>']
handler.tags = ['downloader']
handler.command = /^(yt(a(udio)?|mp3))$/i

export default handler

const somematch = ( data, id ) => {
	let res = data.find(el => el === id )
	return res ? true : false};
