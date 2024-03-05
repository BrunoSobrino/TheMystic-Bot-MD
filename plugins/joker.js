let fetch = require('node-fetch')
let handler = async (m, { conn, args, text, command, usedPrefix, isCreator, isPrems }) => {
  if (!text) return conn.reply(m.chat, `• *Example :* ${usedPrefix}${command} kemii`, m)
	conn.sendMessage(m.chat, {
		react: {
			text: '🕒',
			key: m.key,
		}
	})
  let res = `https://api.lolhuman.xyz/api/textprome/jokerlogo?apikey=${global.lolkey}&text=${text}`
  conn.sendFile(m.chat, res, 'joker.jpg', '```Success...\nDont forget to donate```', m, false)
}
handler.help = ['joker'].map(v => v + ' *<text>*')
handler.tags = ['maker']
handler.command = /^(joker)$/i
handler.register = true
handler.limit = true

module.exports = handler

