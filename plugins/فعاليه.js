import fetch from 'node-fetch';

const timeout = 60000;
const poin = 500;

const handler = async (m, { conn, command, usedPrefix }) => {
    conn.tebakbendera = conn.tebakbendera ? conn.tebakbendera : {};
    const id = m.chat;
    if (id in conn.tebakbendera) {
        conn.reply(m.chat, '❐┃لم يتم الاجابة علي السؤال بعد┃❌ ❯', conn.tebakbendera[id][0]);
        throw false;
    }
    try {
        const response = await fetch('https://gist.githubusercontent.com/Kyutaka101/2ca0f797f66d524a1f2e3685f66298f2/raw/7fe3898420592b47ca37db07fdd173b9b4ca9a63/Game.json');
        const src = await response.json();
        const json = src[Math.floor(Math.random() * src.length)];
        const caption = `*· • • ━━ ⌝🐉⌞ ━━ • • ·*
        *${command.toUpperCase()}*
        *🜋↫╎السـؤال ✍🏻⇜『من في الصورة』*
        *🜋↫╎الـوقـت⏳↞ ${(timeout / 1000).toFixed(2)} ┇*
        *استخدم .انسحب للأنسحاب*
        *🜋↫╎الـجـائزة💰↞ ${poin} نقاط┇*
        ∞┇━━━ •🐉• ━━━┇∞
        *✠ ~تــ✍︎ــوقــيــع ↯:~*
        『𝑁𝐴𝑇𝑆𝑈-𝐵𝑂𝑇』
        `.trim();
        conn.tebakbendera[id] = [
            await conn.sendFile(m.chat, json.img, '', caption, m),
            json, poin,
            setTimeout(() => {
                if (conn.tebakbendera[id]) conn.reply(m.chat, `❮ ⌛┇انتهي الوقت┇⌛❯\n❐↞┇الاجـابـة✅↞ *${json.name}* ┇`, conn.tebakbendera[id][0]);
                delete conn.tebakbendera[id];
            }, timeout)
        ];
    } catch (error) {
        console.error(error);
        conn.reply(m.chat, 'حدث خطأ أثناء جلب البيانات', m);
    }
}

handler.help = ['guessflag'];
handler.tags = ['game'];
handler.command = /^فعاليه/i;

export default handler;
