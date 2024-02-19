import fs from 'fs'
export let on = {
	tags: ['simpan'],
	command: ['sf', 'simpan'],
	owner: true,
	on: async (m, {
		text
	}) => {
		if (!text) return m.reply('contoh .sf plugins/cinta.js atau file yang ingin kamu save');
		let path = `${text}`
		await fs.writeFileSync(path, m.quoted.text);
		await m.reply(`tersimpan di ${path}`)
	}
};
