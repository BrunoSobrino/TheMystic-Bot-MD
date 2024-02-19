import { ytmp4 } from '../../lib/download.js'
export let event = {
	on: async (m, {
		conn,
		budy,
		Limit,
		autodl,
		mess,
		checkLimitUser
	}) => {
		let Links = /(http(?:s)?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/g;
		let ShortsLinks = /(http(?:s)?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^\s&]+)/g;
		let ExLyt = budy.includes('.ytv') || budy.includes('.ytmp4') || budy.includes('.yta') || budy.includes('.ytmp3') || budy.includes('.play')
		if (autodl && Links.test(budy) || ShortsLinks.test(budy)) {
			if (ExLyt) return
			if (m.isBaileys) return
			if (checkLimitUser(m.sender) <= 0) {
				return m.reply(mess.limit);
			}
			let youtubeLinks = budy.match(Links) || budy.match(ShortsLinks);
			for (let youtubeLink of youtubeLinks) {
				m.react('🕙', m.chat)
				let {
					title,
					video,
					quality,
					thumbnail,
					size
				} = await ytmp4(youtubeLink);
				m.react('🕒', m.chat)
				let txt = `🍌 Youtube Video\n`
				txt += `${java} Judul : ${title}\n`
				txt += `${java} Kualitas : ${quality}\n`
				txt += `${java} Size : ${size}`
				conn.sendFile(m.chat, video, {
					caption: txt,
					quoted: m
				});
				Limit(m.sender, 6);
			}
		}
	}
};
