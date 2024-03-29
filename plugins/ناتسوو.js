let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    let name = conn.getName(m.sender);
    let taguser = '@' + m.sender.split("@s.whatsapp.net")[0];
    let message = *مرحبا ماذا تريد*;

    conn.sendFile(m.chat, 'https://telegra.ph/file/9456fe895b3315ea993e4.jpg', 'image.jpg', message, m);
};

handler.customPrefix = /^(natsu|ناتسوو|ناتسو|ناتسووو|NATSU)$/i;
handler.command = new RegExp;

export default handler;
