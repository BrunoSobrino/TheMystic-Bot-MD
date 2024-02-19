import fetch from 'node-fetch'
export let event = {
	on: async (m, {
		conn,
		budy,
		Limit,
		autodl,
		mess,
		checkLimitUser
	}) => {
		let domain = budy.match(/(https?:\/\/(?:www\.)?instagram\.[a-z\.]{2,6}\/[\w\-\.]+(\/[^\s]*)?)/g);
		let exc = budy.includes('User') || budy.includes('Premium')
		if (autodl && !exc && domain && domain.length > 0) {
			if (checkLimitUser(m.sender) <= 0) {
				return m.reply(mess.limit);
			}
			try {
				let res = await fetch(`https://vihangayt.me/download/instagram?url=${domain[0]}`);
				let igeh = await res.json();
				m.react('🕒', m.chat)
				if (igeh.data && igeh.data.data.length > 0) {
					for (let item of igeh.data.data) {
						conn.sendFile(m.chat, item.url, {
							quoted: m
						});
					}
				} else {
					m.reply(`Media tidak ditemukan`);
				}
			} catch (error) {
				console.log(error);
				m.reply(`Terjadi kesalahan saat mengambil data Instagram\n${error}`);
			}
		}
	}
};
