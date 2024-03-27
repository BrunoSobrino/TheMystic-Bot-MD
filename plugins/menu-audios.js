import { createHash } from 'crypto'
 import PhoneNumber from 'awesome-phonenumber'
 import { canLevelUp, xpRange } from '../lib/levelling.js'
 import fetch from 'node-fetch'
 import fs from 'fs'
 const { levelling } = '../lib/levelling.js'
 import moment from 'moment-timezone'
 import { promises } from 'fs'
 import { join } from 'path'
 const time = moment.tz('Egypt').format('HH')
 let wib = moment.tz('Egypt').format('HH:mm:ss')
 //import db from '../lib/database.js'

 let handler = async (m, { conn, usedPrefix, command}) => {
   await 
     conn.sendMessage(m.chat, {
     react: {
   text: "📂",
   key: m.key,
     }
   }) 
     let d = new Date(new Date + 3600000)
     let locale = 'en'
     let week = d.toLocaleDateString(locale, { weekday: 'long' })
     let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
     let _uptime = process.uptime() * 1000
     let uptime = clockString(_uptime)
 let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
 if (!(who in global.db.data.users)) throw `✳️ المستخدم غير موجود في قاعدة بيناتي`
 let videoUrl = 'https://telegra.ph/file/4888490f550636ba35cd4.mp4'
 let user = global.db.data.users[who]
 let { name, exp, diamond, lastclaim, registered, regTime, age, level, role, warn } = global.db.data.users[who]
 let { min, xp, max } = xpRange(user.level, global.multiplier)
 let username = conn.getName(who)
 let math = max - xp
 let prem = global.prems.includes(who.split`@`[0])
 let sn = createHash('md5').update(who).digest('hex')
 let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length 
 let more = String.fromCharCode(8206)
 let readMore = more.repeat(850) 
 let taguser = '@' + m.sender.split("@s.whatsapp.net")[0]
 let str = `
 *㋡ اسـم الـبوت : ناتسو*
 *㋡ حط قبل كل امر : .*
 *㋡ اســم الـمطور : HODA*
 *㋡ البوت شغـال مـنذ : ${uptime}*
 *㋡ الـمنـصه : REPLIT*
 *㋡ المنشن : ${taguser}*
 *㋡ التحذيرات : ${warn}*
 *㋡ اسمك : ${name}*
 *㋡ كودك : ${sn}*
 *㋡ لفلك : ${level}*
 *㋡ التسجيل : ${registered}*
 *㋡ رتبتك : ${role}*
 *㋡ المستخدمين : ${rtotalreg}*
 

*ــــ๋͜ـ𖣊ــــ الجروب ـــ๋͜ـ𖣊ــــ*

*㋡➪تسجيل*
*㋡➪الغاء-االتسجيل*
*㋡➪لفل*
*㋡➪تعدين*
*㋡➪شهري*
*㋡➪يومي*
*㋡➪صحتي*
*㋡➪تصنيف*
*㋡➪طرد*
*㋡➪جروب قفل/فتح*
*㋡➪المشرفين*
*㋡➪تحذير*
*㋡➪منشن*
*㋡➪مخفي*
*㋡➪حذف_تحذير*
*㋡➪لينك*
*㋡➪تاج*
*㋡➪انطق*
*㋡➪الطقس*
*㋡➪الجروب*
*㋡➪خلفيه*

*ــۥـ𖣦ـۥــ التنزيل ــۥـ𖣦ـۥــ*

*㋡➸تحميل*
*㋡➸صوره*
*㋡➸بحث*
*㋡➸ارسم*
*㋡➸فيسبوك*
*㋡➸ايديت*
*㋡➸يوتيوب*
*㋡➸انستا*
*㋡➸يوتيوب2*

*ـﹻ۬ۦٕ٘۬〠ﹻ۬ۦٕ٘۬ـ الترفيه ـﹻ۬ۦٕ٘۬〠ﹻ۬ۦٕ٘۬ـ*

*㋡↯➠تويت*
*㋡↯➠شاذ*
*㋡↯➠تعليق*
*㋡↯➠لو*
*㋡↯➠علم*
*㋡↯➠فكك*
*㋡↯➠اكس*
*㋡↯➠تحدي*
*㋡↯➠كت*
*㋡↯➠ايموجي*
*㋡↯➠دين*
*㋡↯➠حساب*
*㋡↯➠هل*
*㋡↯➠نرد*
*㋡↯➠زوجني*
*㋡↯➠طلاق*
*㋡↯➠صداقه*
*㋡↯➠توب*
*㋡↯➠زواج*
*㋡↯➠عين*
*㋡↯➠حظ*

*ــٚـ‹̷ٰٖ٭̷ٰٖ›ــٚـ التحويل ــٚـ‹̷ٰٖ٭̷ٰٖ›ــٚـ*

*㋡⇒لجيف*
*㋡⇒لفيديو*
*㋡⇒لصوره*
*㋡⇒لكرتون*
*㋡⇒لانمي*
*㋡⇒كامل*
*㋡⇒زغرفه*
*㋡⇒ملصق*
*㋡⇒دمج*
*㋡⇒سرقه*
*㋡⇒تليجراف*

*ــ̈́ـ̸ـۧ⸙ــུـــ الاعضاء ــ̈́ـ̸ـۧ⸙ــུـــ*

*㋡≫🚶‍♂اختفاء*
*㋡≫🚶‍♂رقمي*
*㋡≫🚶‍♂بروفايل*
*㋡≫🚶‍♂ميمز*
*㋡≫🚶‍♂تطقيم_اولاد*
*㋡≫🚶‍♂تطقيم_بنات*
*㋡≫🚶‍♂تطقيم*
*㋡≫🚶‍♂طقم2*
*㋡≫🚶‍♂المميزين*
*㋡≫🚶‍♂بنت*
*㋡≫🚶‍♂قطه*
*㋡≫🚶‍♂باركود*
*㋡≫🚶‍♂المستخدمين*
*㋡≫🚶‍♂تصليح*
*㋡≫🚶‍♂تصميم*

*ــــ๋͜ـ𖣊ــــ 👑المطور👑ــــ๋͜ـ𖣊ــــ*

*㋡┇➥ضيف_اكس_بي*
*㋡┇➥نشر*
*㋡┇➥ارفعني*
*㋡┇➥انضم*
*㋡┇➥حظر*
*㋡┇➥بان*
*㋡┇➥الغاء_البان*
*㋡┇➥بلوك*
*㋡┇➥ضيف_بريم*
*㋡┇➥رفع_البلوك*
*㋡┇➥موت*
*㋡┇➥تنظيف*
*㋡┇➥ضيف*
*㋡┇➥الغاء*
*㋡┇➥افتح*
*㋡┇➥ضيف_جواهر*
*㋡┇➥ملف*

*ــــ๋͜ـ𖣊ــــ 👑المطور👑ــــ๋͜ـ𖣊ــــ*



*㋡ـــ͙͢♪♤♪͙͢ـــ حقوق المطور ـــ͙͢♪♤♪͙͢ـــ*

*㋡〄رقم المطور〄*
*㋡◐↯ده: https://wa.me/201554824764* 
*㋡〄جروب المطور〄*
*㋡◐↯ده: https://chat.whatsapp.com/F8vu51zUa1UD0Y2AyKjWu1* 
*㋡〄يوتيوب المطور〄*
*㋡◐↯ده: https: //www.youtube.com/@legendmahmoud6502*

*㋡ـــ͙͢♪♤♪͙͢ـــ حقوق المطور ـــ͙͢♪♤♪͙͢ـــ*
 `.trim()
     conn.sendMessage(m.chat, {
         video: { url: videoUrl }, caption: str,
   mentions: [m.sender,global.conn.user.jid],
   gifPlayback: true,gifAttribution: 0
     }, { quoted: m });
 };
 handler.help = ['main']
 handler.tags = ['group']
 handler.command = ['مهام','المهام'] 

 export default handler
 function clockString(ms) {
     let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
     let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
     let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
     return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')}

     function ucapan() {
       const time = moment.tz('Egypt').format('HH')
       let res = "بداية يوم سعيده ☀️"
       if (time >= 4) {
         res = "صباح الخير 🌄"
       }
       if (time >= 10) {
         res = "مساء الخير ☀️"
       }
       if (time >= 15) {
         res = "مساء الخير 🌇"
       }
       if (time >= 18) {
         res = "مساء الخير 🌙"
       }
       return res
     }
