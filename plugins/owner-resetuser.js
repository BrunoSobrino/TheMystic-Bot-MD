const handler = async (m, { conn, text }) => {
    //text = no(text);
    const numberPattern = /\d+/;
    let user = '';
    if (text.match(numberPattern)) {
        const number = text.match(numberPattern)[0];
        user = number + '@s.whatsapp.net';
    } else if (m.quoted && m.quoted.sender) {
        const number = m.quoted.sender.match(numberPattern)[0];
        user = number + '@s.whatsapp.net';
    } else {
        return conn.sendMessage(m.chat, {text: `*[❗] Formato de usuario no reconocido. Responda a un mensaje, etiquete a un usuario o escriba su número de usuario.*`}, {quoted: m});
    }
        const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {};
        const participants = m.isGroup ? groupMetadata.participants : [];
        const users = m.isGroup ? participants.find(u => u.jid == user) : {};
        const userNumber = user.split('@')[0];

        delete global.global.db.data.users[user];
        conn.sendMessage(m.chat, {text: `*[❗] Todos los datos del usuario @${userNumber} en la base de datos han sido eliminados.*`, mentions: [user]}, {quoted: m});
};
handler.tags = ['owner'];
handler.command = /(restablecerdatos|deletedatauser|resetuser)$/i;
handler.rowner = true;
export default handler;

async function no(number) {
    return number.replace(/\s/g, '').replace(/([@+-])/g, '');
}
