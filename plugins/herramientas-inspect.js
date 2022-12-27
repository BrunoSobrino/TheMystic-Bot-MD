import * as baileys from '@adiwajshing/baileys'
let handler = async (m, { conn, text }) => {
let [, code] = text.match(/chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i) || []
if (!code) throw 'Invalid URL'
let res = await conn.query({ tag: 'iq', attrs: { type: 'get', xmlns: 'w:g2', to: '@g.us' }, content: [{ tag: 'invite', attrs: { code } }] }), data = extractGroupMetadata(res), txt = Object.keys(data).map(v => `*${v.capitalize()}:* ${data[v]}`).join('\n'), pp = await conn.profilePictureUrl(data.id, 'image').catch(console.error)
let groupinfo = `
*╭───────────────╮*
*│🎋❐ ID:* ◜${data.id}◞
*│🎋❐ Nombre:* ◜${data.subject}◞
*│🎋❐ Creado:* ◜${data.creation}◞
*│🎋❐ Owner:* ◜${data.owner}◞
*╰───────────────╯*
`
await conn.reply(m.chat, groupinfo, m)
const botones = [
{index: 1, urlButton: {displayText: `•Copiar Desc`, url: `https://www.whatsapp.com/otp/copy/${data.desc}`}},
]
await conn.sendMessage(m.chat, { text: `*╭──────────────╮*\n│🐳 • ¿Desea copiar la descripción?\n*╰──────────────╯*`, templateButtons: botones, footer: author })
}
handler.command = /^(inspect2)$/i

export default handler
handler.owner = true

const extractGroupMetadata = (result) => {
	const group = baileys.getBinaryNodeChild(result, 'group')
	const descChild = baileys.getBinaryNodeChild(group, 'description')
	let desc
	if (descChild) desc = baileys.getBinaryNodeChild(descChild, 'body')?.content
	const metadata = {
		id: group.attrs.id.includes('@') ? group.attrs.id : baileys.jidEncode(group.attrs.id, 'g.us'),
		subject: group.attrs.subject,
		creation: new Date(+group.attrs.creation * 1000).toLocaleString('id', { timeZone: 'Asia/Jakarta' }),
		owner: group.attrs.creator ? 'wa.me/' + baileys.jidNormalizedUser(group.attrs.creator).split('@')[0] : undefined,
		desc
	}
	return metadata
}
