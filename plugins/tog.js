const { TogCmd, bot } = require('../lib/')

bot(
	{
		pattern: 'tog ?(.*)',
		fromMe: true,
		desc: 'تمكين أو تعطيل كمد',
		type: 'misc',
	},
	async (message, match) => {
		const [cmd, tog] = match.split(' ')
		if (!cmd || (tog != 'off' && tog != 'on'))
			return await message.send('*Example :* tog ping off')
		if (cmd == 'tog')
			return await message.send(`هل تريد حقا أن تقتلني`)
		await TogCmd(cmd, tog)
		await message.send(`_${cmd} ${tog == 'on' ? 'ممكّن' : 'عاجز'}._`)
	}
)
