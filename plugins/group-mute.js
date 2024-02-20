let handler = async (m, { conn, command, isOwner, isAdmin }) => {
	let isEnable = !/un/i.test(command)
	let chat = global.db.data.chats[m.chat] || {}
	switch (command) {
		case 'mute': case 'unmute':
			if (!m.isGroup) return dfail('group', m, conn)
			if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
			chat.isBanned = isEnable
			break 
		default:
			break 
	}
	m.reply(`*${conn.user.name}* succeeded in *${command}* in this group`)
}
handler.command = /^mute|unmute$/i

export default handler
