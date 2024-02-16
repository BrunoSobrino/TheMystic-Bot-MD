import fetch from 'node-fetch'
let handler = async(m, { conn, usedPrefix, command, args }) => {
    let err = `*هذا الأمر خاص بالــترجمة الفـورية لكل اللغات يكفي فقط ان تعرف اختصار اي لغة سوف اعطيك مثال:*\nاولا نكتب الأمر ثم نتبعه رمز او اختصار اللغة التي نود الترجمة لها ثم يليها الشيء الذي نود ترجمته اليك مثال حتى تفهم\n\n\n*${usedPrefix + command} en مرحبا كيف حالك*
`.trim()
    if (!args[0]) throw err
    try {
        let txt = (args.length > 1 ? args.slice(1).join(' ') : '') || '' 
        let msg = m.quoted ? m.quoted.text : txt
        let src = await(await fetch(API('lol', '/api/translate/auto/' + args[0], { text: msg }, 'apikey'))).json()
        await m.reply(src.result.translated)
    } catch (e) {
        throw 'error'
    }
}
handler.help = ['tarjim']
handler.tags = ['tools']
handler.command = /^(tarjim)$/i
export default handler
