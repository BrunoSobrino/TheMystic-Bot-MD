import { lirik } from "../lib/scrape.js"

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const judul = args.join(' ');
    if (!judul) throw `البحث عن كلمات اي اغنية مثال :\n${usedPrefix + command} hello`;
    try {
        const result = await lirik(judul);

        m.reply(`
العنوان \n*${judul}*

${result.lyrics}

الرابط \n ${result.link}
    `.trim());

    } catch (error) {
        console.error('Error:', error);
        conn.reply(m.chat, `وقعت مشكلة راسل نورالدين \ninstagram.com/noureddine_ouafy`, m);
    }
}

handler.help = ['lyrics']
handler.tags = ['tools']
handler.command = /^(lyrics)$/i

export default handler
