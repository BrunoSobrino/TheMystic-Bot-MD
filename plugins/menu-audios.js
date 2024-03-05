// E S S A O U I D I 
// +212648753294
import fetch from 'node-fetch';
const handler = async (m, {conn, usedPrefix, usedPrefix: _p, __dirname, text, isPrems}) => {
  try {
    const pp = imagen4;
    // let vn = './media/menu.mp3'
    const img = './Menu2.jpg';
    const d = new Date(new Date + 3600000);
    const locale = 'es';
    const week = d.toLocaleDateString(locale, {weekday: 'long'});
    const date = d.toLocaleDateString(locale, {day: 'numeric', month: 'long', year: 'numeric'});
    const _uptime = process.uptime() * 1000;
    const uptime = clockString(_uptime);
    const user = global.db.data.users[m.sender];
    const {money, joincount} = global.db.data.users[m.sender];
    const {exp, limit, level, role} = global.db.data.users[m.sender];
    const rtotalreg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
    const more = String.fromCharCode(8206);
    const readMore = more.repeat(850);
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const document = doc[Math.floor(Math.random() * doc.length)];
    const str = `╮───────────────╭ـ
│「❥🏪 *المتجر* 🏦❥」
│اهـلاً بك في قـسـم المتجر 
│🧿الاسم : ${taguser}
│🪙عملاتك : ${limit}
│⚡الطاقه : ${exp}
│───────────────╰ـ
│⚝ ⃟🏪❯ .شراء <العدد>
│لشراء عملات من الطاقة الخاصة بك
│───────────────╰ـ
│⚝ ⃟🏪❯ .شراء الكل
|لشراء عملات بكل ما لديك من طاقة
│───────────────╰ـ
│⚝ ⃟🏪❯ .عملات 
│لتجميع عملات عشوائية
│───────────────╰ـ
│⚝ ⃟🏪❯ .راتب 
│لتجميع اليومي الخاص بك 
│───────────────╰ـ
