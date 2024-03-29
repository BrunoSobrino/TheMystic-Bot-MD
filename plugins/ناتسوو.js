let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    let name = conn.getName(m.sender);
    let taguser = '@' + m.sender.split("@s.whatsapp.net")[0];
    let message = 🙄🙄مرحبا ماذا تريد مني;

    conn.sendFile(m.chat, 'https://telegra.ph/file/82e0c0e8451ec05e854f3.jpg', 'image.jpg', message, m);
};

handler.customPrefix = /^(NATSU|ناتسو|ناتسوو|natsu)$/i;
handler.command = new RegExp;

export default handler;
