import fetch from 'node-fetch'
export let on = {
  names: ['Tools'],
  tags: ['chatgpt'],
  command: ['chatgpt'],
  on: async (m, {
    text
  }) => {
    if (!text) return m.reply('مثال:\n.ai ما هو الاسلام')
    await m.reply('جاري الاجابة...')
    let res = await fetch(`https://vihangayt.me/tools/chatgpt?q=${text}`)
    let open = await res.json()
    let ai = await open.data
    await m.reply(`${ai}`)
  }
};
