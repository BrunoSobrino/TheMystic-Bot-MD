export let on = {
	names: ['Owner'],
	tags: ['on welcome'],
	command: ['on'],
	owner: true,
	on: async (m, {
		conn,
		text,
		groupName,
		switchGroup
	}) => {
		if (!text) return m.reply(`Masukan Parameternya contoh .on welcome`)
		const change = {
			welcome: true
		}
		switchGroup(m.chat, change);
		m.reply(`Welcome Berhasil Di Nyalakan Di Group ${groupName}`)
	}
};
