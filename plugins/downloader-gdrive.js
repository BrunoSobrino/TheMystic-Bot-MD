import fetch from 'node-fetch'
import { sizeFormatter } from 'human-readable'
let formatSize = sizeFormatter({
	std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B`
})

let handler = async (m, { conn, args }) => {
	if (!args[0]) throw '\nهذا الامر خاص بتحميل الملفات من غوغل درايف مثال : \n\n*.gdrive*  https://drive.google.com/u/0/uc?id=1-XxkNNYHEvKlbPMEMNbgEBg6tgKEC8bO&export=download' 
	GDriveDl(args[0]).then(async (res) => {
		if (!res) throw res
		await m.reply(JSON.stringify(res, null, 2))
		conn.sendMessage(m.chat, { document: { url: res.downloadUrl }, fileName: res.fileName, mimetype: res.mimetype }, { quoted: m })
	})
}

handler.help = ['gdrive']
handler.tags = ['downloader']
handler.command = /^(gdrive)$/i
handler.disabled = false

export default handler

async function GDriveDl(url) {
	let id
	if (!(url && url.match(/drive\.google/i))) throw 'هذا الرابط غير موجود'
	id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1]
	if (!id) throw 'لم يتم العثور على المعرف'
	let res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
		method: 'post',
		headers: {
			'accept-encoding': 'gzip, deflate, br',
			'content-length': 0,
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			'origin': 'https://drive.google.com',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
			'x-client-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=',
			'x-drive-first-party': 'DriveWebUi',
			'x-json-requested': 'true' 
		}
	})
	let { fileName, sizeBytes, downloadUrl } =  JSON.parse((await res.text()).slice(4))
	if (!downloadUrl) throw 'رابط تحميل محدود!'
	let data = await fetch(downloadUrl)
	if (data.status !== 200) throw data.statusText
	return { downloadUrl, fileName, fileSize: formatSize(sizeBytes), mimetype: data.headers.get('content-type') }
}