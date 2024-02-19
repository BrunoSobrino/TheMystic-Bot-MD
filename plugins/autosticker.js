export let event = {
	on: async (m, {
		conn,
		mess,
		quoted,
		setting,
		Limit,
		checkLimitUser
	}) => {
		if (m.mtype === 'imageMessage') {
			if (checkLimitUser(m.sender) <= 0) {
				return m.reply(mess.limit);
			}
			m.react('✅', m.chat)
			let buffer = await quoted.download()
			conn.sendImageAsSticker(m.chat, buffer, m, {
				packname: setting.botName,
				author: setting.footer
			});
		}
	}
};
