let handler = async (m, { conn }) => {
    let id = m.chat;
    if (id in conn.tekateki) {
        let clue = conn.tekateki[id][1].clue;
        conn.reply(m.chat, `*التلميح هو :* ${clue}`, m, {
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: '𝜝𝜰 𝜜𝜡𝜜𝜲',
                    thumbnailUrl: 'https://telegra.ph/file/99536f653b0821c73b099.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029Vag9bvrLSmbRE2I5Oj2h',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
    } else {
        conn.reply(m.chat, '*لا يوجد سؤال نشط لعرض التلميح*', m, {
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: '𝜝𝜰 𝜜𝜡𝜜𝜲',
                    thumbnailUrl: 'https://telegra.ph/file/99536f653b0821c73b099.jpg',
                    sourceUrl: 'https://whatsapp.com/channel/0029Vag9bvrLSmbRE2I5Oj2h',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
    }
};

handler.help = ['clue'];
handler.tags = ['game'];
handler.command = /^تلميح$/i;

export default handler;
