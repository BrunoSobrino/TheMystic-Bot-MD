import fs from 'fs';

let timeout = 60000;
let poin = 500;

let handler = async (m, { conn, usedPrefix }) => {
    conn.tekateki = conn.tekateki ? conn.tekateki : {};
    let id = m.chat;
    if (id in conn.tekateki) {
        conn.reply(m.chat, '𖣐➽╎لم يتم الاجابة علي السؤال بعد╎❌ ➽', conn.tekateki[id][0]);
        throw false;
    }
    let tekateki = JSON.parse(fs.readFileSync(`./src/game2/miku2.json`));
    let json = tekateki[Math.floor(Math.random() * tekateki.length)];
    let _clue = json.response;
    let clue = _clue.replace(/[A-Za-z]/g, ''); // Fixed this line
    let caption = `
ⷮ ${json.question}

𖣐➽╎الـوقـت⏳↞ ${(timeout / 1000).toFixed(2)}┇
𖣐➽╎الـجـائـزة💰↞ ${poin} نقاط┇
𓅃⍣⃝𝑁𝐴𝑇𝑺𝑈 𝐵𝛩𝑇✭
`.trim();
    conn.tekateki[id] = [
       await conn.reply(m.chat, caption, m),
        json, poin,
        setTimeout(async () => {
            if (conn.tekateki[id]) await conn.reply(m.chat, `❮ ⌛┇انتهي الوقت╎⌛➽\n الاجـابـة𖣐➽╎✅↞ ${json.response}┇`, conn.tekateki[id][0]);
            delete conn.tekateki[id];
        }, timeout)
    ];
};

handler.help = ['𝑁𝐴𝑇𝑺𝑈'];
handler.tags = ['game'];
handler.command = /^(فكك)$/i;

export default handler;