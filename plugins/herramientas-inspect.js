import * as baileys from '@adiwajshing/baileys'

let handler = async (m, { conn, text }) => {
	let [, code] = text.match(/chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i) || []
	if (!code) throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙻𝙸𝙽𝙺 𝙳𝙴𝙻 𝙶𝚁𝚄𝙿𝙾*'
	let res = await conn.query({ tag: 'iq', attrs: { type: 'get', xmlns: 'w:g2', to: '@g.us' }, content: [{ tag: 'invite', attrs: { code } }] }),
		data = extractGroupMetadata(res),
		txt = Object.keys(data).map(v => `*${v.capitalize()}:* ${data[v]}`).join('\n'),
		pp = await conn.profilePictureUrl(data.id, 'image').catch(console.error)
	if (pp) return conn.sendMessage(m.chat, { image: { url: pp }, caption: txt }, { quoted: m })
	let groupinfo = `⫹⫺ 𝙸𝙳: ${data.id}\n⫹⫺ 𝙽𝙾𝙼𝙱𝚁𝙴: ${data.subject}\n⫹⫺ 𝙲𝚁𝙴𝙰𝙳𝙾: ${data.creation}\n⫹⫺ 𝙾𝚆𝙽𝙴𝚁: ${data.owner}\n⫹⫺ 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝙲𝙸𝙾𝙽:\n${data.desc}`
	await conn.reply(m.chat, groupinfo, m)
	//m.reply(txt)
}
handler.command = /^(inspect)$/i

export default handler

const extractGroupMetadata = (result) => {
	const group = baileys.getBinaryNodeChild(result, 'group')
	const descChild = baileys.getBinaryNodeChild(group, 'description')
	let desc
	if (descChild) desc = baileys.getBinaryNodeChild(descChild, 'body')?.content
	const metadata = {
		id: group.attrs.id.includes('@') ? group.attrs.id : baileys.jidEncode(group.attrs.id, 'g.us'),
		subject: group.attrs.subject,
		creation: new Date(+group.attrs.creation * 1000).toLocaleString('id', { timeZone: 'Asia/Jakarta' }),
		owner: group.attrs.creator ? 'wa.me/' + baileys.jidNormalizedUser(group.attrs.creator).split('@')[0] :
			// group.attrs.s_o ? 'wa.me/' + baileys.jidNormalizedUser(group.attrs.s_o).split('@')[0] :
			group.attrs.id.includes('-') ? 'wa.me/' + group.attrs.id.split('-')[0] : '',
		desc
	}
	return metadata
}
