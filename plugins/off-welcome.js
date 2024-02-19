export let on = {
	names: ['Owner'],
	tags: ['off welcome'],
	command: ['off'],
	owner: true,
	on: async (m, {
		conn,
		text,
		groupName,
		switchGroup
	}) => {
		if (!text) return m.reply(`Masukan Parameternya contoh .off welcome`)
		const change = {
			welcome: false
		}
		switchGroup(m.chat, change);
		m.reply(`Welcome Berhasil Di Matikan Di Group ${groupName}`)
	}
};
