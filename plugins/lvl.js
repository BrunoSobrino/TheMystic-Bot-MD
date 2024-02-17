import { canLevelUp, xpRange } from '../lib/levelling.js'
import { levelup } from '../lib/canvas.js'

let handler = async (m, { conn }) => {
	let name = conn.getName(m.sender)
let user = global.db.data.users[m.sender]
if (!canLevelUp(user.level, user.exp, global.multiplier)) {
let { min, xp, max } = xpRange(user.level, global.multiplier)
throw `
┌───⊷ المستوي
▢ الاسم : ${name}
▢ المستوي : ${user.level}
▢ التقدم : ${user.exp - min}/${xp}
▢ الخبرة : ${xp}
▢ الماس : ${user.limit}
▢ رتبتك : ${user.role}
└──────────────

انت تحتاج الي ${max - user.exp} XP لرفع مستواك
`.trim()
}
let before = user.level * 1
while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++
if (before !== user.level) {
let teks = `🎊 عاش يحب ${conn.getName(m.sender)} المستوي:`
let str = `
┌─⊷ المستوي
▢ المستوي السابق : ${before}
▢ المستوي الحالي : ${user.level}
└──────────────

كلما تفاعلت مع البوت ارتفع مستواك
`.trim()
try {
const img = await levelup(teks, user.level)
conn.sendFile(m.chat, img, 'levelup.jpg', str, m)
} catch (e) {
m.reply(str)
}
}
}

handler.help = ['levelup']
handler.tags = ['xp']

handler.command = ['لفل', 'lvl', 'levelup', 'مستواي'] 

export default handler