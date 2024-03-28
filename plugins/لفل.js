import { canLevelUp, xpRange } from '../lib/levelling.js'

let handler = async (m, { conn }) => {
let { role } = global.db.data.users[m.sender]
let name = conn.getName(m.sender)
 let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/moyt.jpg')
let user = global.db.data.users[m.sender]
    if (!canLevelUp(user.level, user.exp, global.multiplier)) {
        let { min, xp, max } = xpRange(user.level, global.multiplier)
      let lvl = `┓━━━━【 *الـتصـنـيف* 】━━━━┏
┇ *☎️ الاسم* : ${name} ღ
┇ *🚒 الفل :* *${user.level}*
┇ *♟️ مصنف :* ${role}
┇ *♨️ نقاط الخبرة :* *${user.exp - min}/${xp}*
┛━━━⊰ بـــــــوت ⊱━━━┗

*تحتاج ${max - user.exp} من نقاط الخبرة للوصول الي مستوي جديد*`
conn.sendFile(m.chat, pp, 'levelup.jpg', lvl, m)
    }

    let before = user.level * 1
    while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++
    if (before !== user.level) {
        let teks = `عاش يحب! ${conn.getName(m.sender)} المستوي: ${user.level}`
        let str = `┓━━━━【 *الـتصـنـيف* 】━━━━┏
┇♨️ *المستوي السابق :* *${before}*
┇🎉 *المستوي الحالي :* *${user.level}*
┇♟️ *التصنيف :* ${role} 
┛━━━⊰ بـــــوت ⊱━━━┗`.trim()
        try {
            const img = await levelup(teks, user.level)
            conn.sendFile(m.chat, pp, 'levelup.jpg', str, m)
        } catch (e) {
            m.reply(str)
        }
    }
await delay(5 * 5000)  
}
handler.help = ['levelup']
handler.tags = ['xp']

handler.command = ['nivel', 'lvl', 'رانك', 'لفل'] 

export default handler
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/*import { canLevelUp, xpRange } from '../lib/levelling.js'
let handler = async (m, { conn }) => {
    let name = conn.getName(m.sender)
   let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
if (!(who in global.db.data.users)) throw `✳️ The user is not found in my database`
let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/killua.jpg')
    let user = global.db.data.users[m.sender]
    if (!canLevelUp(user.level, user.exp, global.multiplier)) {
        let { min, xp, max } = xpRange(user.level, global.multiplier)
        let txt = `
┓━━【 *الـتصـنـيف* 】━━┏
☎️ الـرقـم : *${name}*
🚒 الـلـفـل : *${user.level}*
♨️ الـاكـس بـي : *${user.exp - min}/${xp}*
♟️ الـتـصـنيـف : *${user.role}*

ناقـصـك *${max - user.exp}* من *الـاكس  بـي* لـلـصعود الـى لفـل جـديـد
`.trim()
try {
  let imgg = API('fgmods', '/api/rank', {
    username: name,
    xp: user.exp - min,
    exp: xp,
    avatar: pp,
    level: user.level,
    background: 'https://i.ibb.co/CsNgBYw/qiyana.jpg'
}, 'apikey')

    conn.sendFile(m.chat, pp, 'level.jpg', txt, m)
} catch (e) {
    m.reply(txt)
}
    }
    let before = user.level * 1
    while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++
    if (before !== user.level) {
      user.role = global.rpg.role(user.level).name

        let str = `
┓━━【 *لفل جديد* 】━━┏
♨️ اللفل القديم : *${before}*
🎉 اللفل الجديد : *${user.level}*
♟️ التصنيف : *${user.role}*
`.trim()
         try {
            let img = API('fgmods', '/api/levelup', { 
                avatar: pp 
             }, 'apikey')
      conn.sendFile(m.chat, img, 'levelup.jpg', str, m)
        } catch (e) {
            m.reply(str)
        }
    }
}

handler.help = ['levelup']
handler.tags = ['econ']
handler.command = ['رانك', 'لفل', 'levelup', 'lvl'] 

export default handler*/
