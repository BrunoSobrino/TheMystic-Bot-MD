

const handler = async (m, { conn, text }) => {
    const datas = global
    const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
    const tradutor = _translate.plugins.owner_resetuser


    const numberPattern = /\d+/g;
    let user = '';
    const numberMatches = text.match(numberPattern);
    if (numberMatches) {
        const number = numberMatches.join('');
        user = number + '@s.whatsapp.net';
    } else if (m.quoted && m.quoted.sender) {
        const quotedNumberMatches = m.quoted.sender.match(numberPattern);
        if (quotedNumberMatches) {
            const number = quotedNumberMatches.join('');
            user = number + '@s.whatsapp.net';
        } else {
            return conn.sendMessage(m.chat, { text: tradutor.texto1 }, { quoted: m });
        }
    } else {
        return conn.sendMessage(m.chat, { text: tradutor.texto2 }, { quoted: m });
    }
    const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {};
    const participants = m.isGroup ? groupMetadata.participants : [];
    const users = m.isGroup ? participants.find(u => u.jid == user) : {};
    const userNumber = user.split('@')[0];
    if (!global.global.db.data.users[user] || global.global.db.data.users[user] == '') {
        return conn.sendMessage(m.chat, { text: `${tradutor.texto3[0]} @${userNumber} ${tradutor.texto3[1]}`, mentions: [user] }, { quoted: m });
    }
    delete global.global.db.data.users[user];
    conn.sendMessage(m.chat, { text: `${tradutor.texto4[0]} @${userNumber} ${tradutor.texto4[1]}`, mentions: [user] }, { quoted: m });
};
handler.tags = ['owner'];
handler.command = /(restablecerdatos|deletedatauser|resetuser)$/i;
handler.rowner = true;
export default handler;
