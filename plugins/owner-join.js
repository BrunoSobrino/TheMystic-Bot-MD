export let on = {
	tags: ['join'],
	command: ['join', 'gabung'],
	owner: true,
	on: async (m, {
		args,
		text
	}) => {
		if (!text) return m.reply('Masukkan Link Group!')
		if (!isUrl(args[0]) && !args[0].includes('whatsapp.com')) return m.reply('Link Invalid!')
		m.reply('Menyatukan...')
		let result = args[0].split('https://chat.whatsapp.com/')[1]
		await conn.groupAcceptInvite(result)
		m.reply('Berhasil Bersatu Ke Group Yang Kamu Berikan')
		function isUrl(url) {
			return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
		}
	}
};
