const handler = async (m, { conn, text }) => {
    text = no(text);
    let number = '';
    if (isNaN(text)) {
        const parts = text.split('@');
        if (parts.length > 1) {
            number = parts[1];
        }
    } else if (!isNaN(text)) {
        number = text;
    }
    if (!text && !m.quoted) {
        return conn.sendMessage(m.chat, {text: `*[❗] Usuario no encontrado. Responda a un mensaje, etiquete a un usuario o escriba su número de usuario.*`}, {quoted: m});
    }

    if (isNaN(number)) {
        return conn.reply(m.chat, {text: `*[❗] El número ingresado no es válido. Por favor, ingrese un número válido.*`}, {quoted: m});
    }

    try {
        const user = text ? number + '@s.whatsapp.net' : m.quoted.sender || number + '@s.whatsapp.net';
    } catch (e) {
    } finally {
        const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {};
        const participants = m.isGroup ? groupMetadata.participants : [];
        const users = m.isGroup ? participants.find(u => u.jid == user) : {};
        const userNumber = user.split('@')[0];

        delete global.global.db.data.users[user];
        conn.sendMessage(m.chat, {text: `*[❗] Todos los datos del usuario @${userNumber} en la base de datos han sido eliminados.*`, mentions: [user]}, {quoted: m});
    }
};
handler.tags = ['owner'];
handler.command = /(restablecerdatos|deletedatauser|resetuser)$/i;
handler.rowner = true;
export default handler;

async function no(number) {
    return number.replace(/\s/g, '').replace(/([@+-])/g, '');
}
