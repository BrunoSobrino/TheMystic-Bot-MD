//import db from '../lib/database.js'
let reg = 40
let handler = async (m, { conn, args, usedPrefix, command }) => {
    let fa = `
كم تريد أن تراهن؟ 

📌 مثال :
*${usedPrefix + command}* 100`.trim()
    if (!args[0]) throw fa
    if (isNaN(args[0])) throw fa
    let apuesta = parseInt(args[0])
    let users = global.db.data.users[m.sender]
    let time = users.lastslot + 10000
    if (new Date - users.lastslot < 10000) throw `⏳ إنتظر *${msToTime(time - new Date())}* للاستخدام مرة أخرى`
    if (apuesta < 100) throw '✳️ الحد الأدنى للرهين هو *100 XP*'
    if (users.exp < apuesta) {
        throw `✳️ ليس لديك ما يكفي xp`
    }

    let emojis = ["🐋", "🐉", "🕊️"];
    let a = Math.floor(Math.random() * emojis.length);
    let b = Math.floor(Math.random() * emojis.length);
    let c = Math.floor(Math.random() * emojis.length);
    let x = [],
        y = [],
        z = [];
    for (let i = 0; i < 3; i++) {
        x[i] = emojis[a];
        a++;
        if (a == emojis.length) a = 0;
    }
    for (let i = 0; i < 3; i++) {
        y[i] = emojis[b];
        b++;
        if (b == emojis.length) b = 0;
    }
    for (let i = 0; i < 3; i++) {
        z[i] = emojis[c];
        c++;
        if (c == emojis.length) c = 0;
    }
    let end;
    if (a == b && b == c) {
        end = `🎁 فائر\n *+${apuesta + apuesta} XP*`
        users.exp += apuesta + apuesta
    } else if (a == b || a == c || b == c) {
        end = `🔮 كدت تجعلها تستمر في المحاولة :) \nالنتيجة *+${reg} XP*`
        users.exp += reg
    } else {
        end = `😔 لقد خسرت  *-${apuesta} XP*`
        users.exp -= apuesta
    }
    users.lastslot = new Date * 1
    return await m.reply(
        `
       🎰 ┃ *رهان كاذب* 
     ───────────
       ${x[0]} : ${y[0]} : ${z[0]}
       ${x[1]} : ${y[1]} : ${z[1]}
       ${x[2]} : ${y[2]} : ${z[2]}
     ───────────
        🎰┃🎰┃ 🎰
        *الرهان شيء محرم في دين الاسلام لاكن هذه مجرد لعبة لا خسرة او ربح حقيقي*

${end}`) 
}
handler.help = ['slot <bet amount>']
handler.tags = ['game']
handler.command = ['slot','رهان']

export default handler

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

    hours = (hours < 10) ? "0" + hours : hours
    minutes = (minutes < 10) ? "0" + minutes : minutes
    seconds = (seconds < 10) ? "0" + seconds : seconds

    return seconds + " Seconds(s)"
      }
