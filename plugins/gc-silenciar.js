// Codigo creado por: Bruno Sobrino (https://github.com/BrunoSobrino/
// Recreado del Código por: MoonContentCreator
import fetch from 'node-fetch';

// Función para obtener cadenas codificadas
const getStringFromCode = (index) => {
    const strings = [
        '✨ *Sólo otro administrador puede desmutarte*', '👑 *El creador del bot no puede ser mutado*',
        '129PEBBUv', '51289OMfQvC', 'data', '9070eQsjRl', 'users', 'owner', 'user',
        'Tus mensajes serán eliminados', 'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD',
        'mute', 'muto', 'Halo', '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗺𝘂𝘁𝗮𝗱𝗼', '3136705kmgDtk', 'mentionedJid', '💥 *Menciona a la persona que deseas demutar*',
        '@s.whatsapp.net', 'reply', 'sender', '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗱𝗲𝗺𝘂𝘁𝗮𝗱𝗼', '🚩 *No puedes mutar el bot*',
        'group', '0@s.whatsapp.net', 'unmute', '14340DPskXA', '☁ *Este usuario no ha sido mutado*',
        '💥 *Menciona a la persona que deseas mutar*', '472398wcTpbo', '848XQksSy', '🚩 *Este usuario ya ha sido mutado*',
        'groupMetadata', '👑 *No puedes mutar el creador del grupo*', '6547128nviniQ', '3051obNcjV', 'chat', 'jid', 'quoted',
        '💭 *Solo un administrador puede ejecutar este comando', '955169UoGRsU'
    ];
    return strings[index - 310];
};

// Handler para procesar comandos de mensajes
const handler = async (message, { conn, command, text, isAdmin }) => {
    const muteCommand = getStringFromCode(316);
    const unmuteCommand = getStringFromCode(331);

    if (command === muteCommand) {
        if (!isAdmin) throw getStringFromCode(367);

        const ownerJid = global.owner[0][0] + getStringFromCode(320);
        if (message.mentionedJid[0] === ownerJid) throw getStringFromCode(311);

        let targetJid = message.mentionedJid[0] ? message.mentionedJid[0] : message.quoted ? message.quoted.sender : text;
        if (targetJid === conn.user.jid) throw getStringFromCode(323);

        const groupMetadata = await conn.groupMetadata(message.chat);
        const groupOwnerJid = groupMetadata.owner || message.chat.split('-')[0] + getStringFromCode(320);
        if (message.mentionedJid[0] === groupOwnerJid) throw getStringFromCode(350);

        let userData = global.db.data.users[targetJid];

        if (userData.mute === true) throw getStringFromCode(345);

        let responseMessage = {
            key: { participants: getStringFromCode(329), fromMe: false, id: getStringFromCode(315) },
            message: {
                locationMessage: {
                    name: getStringFromCode(318),
                    jpegThumbnail: await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer(),
                    vcard: getStringFromCode(309)
                }
            },
            participant: getStringFromCode(329)
        };

        conn.reply(message.chat, getStringFromCode(317), responseMessage, null, { mentions: [targetJid] });
        global.db.data.users[targetJid].mute = true;
    } else if (command === unmuteCommand) {
        if (!isAdmin) throw getStringFromCode(367);

        let targetJid = message.mentionedJid[0] ? message.mentionedJid[0] : message.quoted ? message.quoted.sender : text;
        let userData = global.db.data.users[targetJid];

        if (userData.mute === false) throw getStringFromCode(328);

        let responseMessage = {
            key: { participants: getStringFromCode(329), fromMe: false, id: getStringFromCode(315) },
            message: {
                locationMessage: {
                    name: getStringFromCode(325),
                    jpegThumbnail: await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer(),
                    vcard: getStringFromCode(309)
                }
            },
            participant: getStringFromCode(329)
        };

        conn.reply(message.chat, 'Tus mensajes no serán eliminados', responseMessage, null, { mentions: [targetJid] });
        global.db.data.users[targetJid].mute = false;
    }
};

handler.command = /^(mute|unmute)$/i;
handler.admin = true;
handler.botAdmin = true;
export default handler;
