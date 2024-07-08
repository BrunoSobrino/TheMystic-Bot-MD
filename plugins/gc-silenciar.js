// Codigo creado por: Bruno Sobrino (https://github.com/BrunoSobrino/
// Recreado del Código por: MoonContentCreator
import fetch from 'node-fetch';

const messages = {
    onlyAdmin: '💌 *Solo un administrador puede ejecutar este comando*',
    muteBotOwner: '👑 *El creador del bot no puede ser mutado*',
    mentionTarget: '💥 *Menciona a la persona que deseas mutar*',
    alreadyMuted: '🚩 *Este usuario ya ha sido mutado*',
    cannotMuteBot: '🚩 *No puedes mutar el bot*',
    muteSuccess: 'Tus mensajes serán eliminados',
    unmuteSuccess: 'Tus mensajes no serán eliminados',
    notMuted: '☁ *Este usuario no ha sido mutado*',
    creatorCannotBeMuted: '👑 *No puedes mutar el creador del grupo*',
    userMuted: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗺𝘂𝘁𝗮𝗱𝗼',
    userUnmuted: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗱𝗲𝗺𝘂𝘁𝗮𝗱𝗼',
    vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD',
    botImageUrl: 'https://telegra.ph/file/f8324d9798fa2ed2317bc.png',
    userImageUrl: 'https://telegra.ph/file/aea704d0b242b8c41bf15.png'
};

const handler = async (message, { conn, command, text, isAdmin }) => {
    const muteCommand = 'mute';
    const unmuteCommand = 'unmute';

    if (command === muteCommand) {
        if (!isAdmin) throw messages.onlyAdmin;

        const ownerJid = global.owner[0][0] + '@s.whatsapp.net';
        if (message.mentionedJid[0] === ownerJid) throw messages.muteBotOwner;

        let targetJid = message.mentionedJid[0] ? message.mentionedJid[0] : message.quoted ? message.quoted.sender : text;
        if (targetJid === conn.user.jid) throw messages.cannotMuteBot;

        const groupMetadata = await conn.groupMetadata(message.chat);
        const groupOwnerJid = groupMetadata.owner || message.chat.split('-')[0] + '@s.whatsapp.net';
        if (message.mentionedJid[0] === groupOwnerJid) throw messages.creatorCannotBeMuted;

        let userData = global.db.data.users[targetJid];

        if (userData.mute === true) throw messages.alreadyMuted;

        let responseMessage = {
            key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
            message: {
                locationMessage: {
                    name: messages.userMuted,
                    jpegThumbnail: await (await fetch(messages.botImageUrl)).buffer(),
                    vcard: messages.vcard
                }
            },
            participant: '0@s.whatsapp.net'
        };

        conn.reply(message.chat, messages.muteSuccess, responseMessage, null, { mentions: [targetJid] });
        global.db.data.users[targetJid].mute = true;
    } else if (command === unmuteCommand) {
        if (!isAdmin) throw messages.onlyAdmin;

        let targetJid = message.mentionedJid[0] ? message.mentionedJid[0] : message.quoted ? message.quoted.sender : text;
        let userData = global.db.data.users[targetJid];

        if (userData.mute === false) throw messages.notMuted;

        let responseMessage = {
            key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
            message: {
                locationMessage: {
                    name: messages.userUnmuted,
                    jpegThumbnail: await (await fetch(messages.userImageUrl)).buffer(),
                    vcard: messages.vcard
                }
            },
            participant: '0@s.whatsapp.net'
        };

        conn.reply(message.chat, messages.unmuteSuccess, responseMessage, null, { mentions: [targetJid] });
        global.db.data.users[targetJid].mute = false;
    }
};

handler.command = /^(mute|unmute)$/i;
handler.admin = true;
handler.botAdmin = true;
export default handler;
