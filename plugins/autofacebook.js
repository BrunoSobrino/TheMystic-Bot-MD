import { fbdl } from '../../lib/download.js'
export let event = {
	on: async (m, {
		conn,
		budy,
		Limit,
		autodl,
		mess,
		checkLimitUser
	}) => {
		if (autodl && /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.gg)\/[^\s/]+(?:\/videos\/\d+\/?)?/.test(budy)) {
			let exf = budy.includes('User') || budy.includes('Premium')
			if (exf) return
			if (checkLimitUser(m.sender) <= 0) {
				return m.reply(mess.limit);
			}
			m.react('🕒', m.chat)
			let {
				video
			} = await fbdl(budy);
			m.react('🕗', m.chat)
			conn.sendFile(m.chat, video, {
				caption: ` Facebook\ninstagram.com/essaouidi_yassine`,
				quoted: m
			});
			Limit(m.sender, 3);
		}
	}
};
