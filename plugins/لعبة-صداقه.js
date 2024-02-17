let toM = a => '@' + a.split('@')[0]
function handler(m, { groupMetadata }) {
let ps = groupMetadata.participants.map(v => v.id)
let a = ps.getRandom()
let b
do b = ps.getRandom()
while (b === a)
m.reply(`*لنكوّن بعض الأصدقاء*\n\n*يا ${toM(a)} لتتحدث ف الخاص ${toM(b)} حتى يتمكنوا من اللعب ويصبحوا أصدقاء 🙆*\n\n*تبدأ أفضل الصداقات بالالعاب 😉*`, null, {
mentions: [a, b]
})}
handler.help = ['amistad']
handler.tags = ['main', 'fun']
handler.command = ['صداقه','صداقة']
handler.group = true
export default handler