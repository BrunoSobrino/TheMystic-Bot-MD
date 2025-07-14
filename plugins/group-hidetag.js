import {generateWAMessageFromContent} from "baileys";
import * as fs from 'fs';

const handler = async (m, {conn, text, participants, isOwner, isAdmin}) => {
    const users = participants.map((u) => conn.decodeJid(u.id));
    const isDocumentMessage = m.message.documentMessage || (m.quoted && m.quoted.mtype === 'documentMessage');
    
    if (isDocumentMessage) {
        try {
            const q = m.quoted ? m.quoted : m || m.text || m.sender;
            const c = m.quoted ? await m.getQuotedObj() : m.msg || m.text || m.sender;
            const msg = conn.cMod(m.chat, generateWAMessageFromContent(m.chat, {[m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : {text: '' || c}}, {quoted: m, userJid: conn.user.id}), text || q.text, conn.user.jid, {mentions: users});
            await conn.relayMessage(m.chat, msg.message, {messageId: msg.key.id});
            return;
        } catch {
        }
    }
    
    const more = String.fromCharCode(8206);
    const masss = more.repeat(850);
    let htextos = text;
    if (!htextos) {
        if (m.message.imageMessage?.caption) {
            htextos = m.message.imageMessage.caption.replace(/^\.\w+\s*/, '');
        } else if (m.message.videoMessage?.caption) {
            htextos = m.message.videoMessage.caption.replace(/^\.\w+\s*/, '');
        } else {
            htextos = '*Hola :D*';
        }
    }
    if (m.message.imageMessage) {
        const mediax = await m.download();
        await conn.sendMessage(m.chat, {image: mediax, mentions: users, caption: htextos}, {quoted: m});
    } else if (m.message.videoMessage) {
        const mediax = await m.download();
        await conn.sendMessage(m.chat, {video: mediax, mentions: users, mimetype: 'video/mp4', caption: htextos}, {quoted: m});
    } else if (m.message.audioMessage) {
        const mediax = await m.download();
        await conn.sendMessage(m.chat, {audio: mediax, mentions: users, mimetype: 'audio/mpeg', fileName: `Hidetag.mp3`}, {quoted: m});
    } else if (m.message.stickerMessage) {
        const mediax = await m.download();
        await conn.sendMessage(m.chat, {sticker: mediax, mentions: users}, {quoted: m});
    } else if (m.message.documentMessage) {
        const mediax = await m.download();
        await conn.sendMessage(m.chat, {document: mediax, mentions: users, mimetype: m.message.documentMessage.mimetype, fileName: m.message.documentMessage.fileName || 'Hidetag_document', caption: htextos}, {quoted: m});
    } else if (m.quoted) {
        const quoted = m.quoted;
        const mime = (quoted.msg || quoted).mimetype || '';
        const isMedia = /image|video|sticker|audio|document/.test(mime);
        if (!htextos || htextos === '*Hola :D*') {
            if (quoted.text) {
                htextos = quoted.text;
            } else if (quoted.caption) {
                htextos = quoted.caption;
            } else if (quoted.msg?.caption) {
                htextos = quoted.msg.caption;
            } else {
                htextos = '*Hola :D*';
            }
        }
        if ((isMedia && quoted.mtype === 'imageMessage')) {
            const mediax = await quoted.download?.();
            await conn.sendMessage(m.chat, {image: mediax, mentions: users, caption: htextos}, {quoted: m});
        } else if ((isMedia && quoted.mtype === 'videoMessage')) {
            const mediax = await quoted.download?.();
            await conn.sendMessage(m.chat, {video: mediax, mentions: users, mimetype: 'video/mp4', caption: htextos}, {quoted: m});
        } else if ((isMedia && quoted.mtype === 'audioMessage')) {
            const mediax = await quoted.download?.();
            await conn.sendMessage(m.chat, {audio: mediax, mentions: users, mimetype: 'audio/mpeg', fileName: `Hidetag.mp3`}, {quoted: m});
        } else if ((isMedia && quoted.mtype === 'stickerMessage')) {
            const mediax = await quoted.download?.();
            await conn.sendMessage(m.chat, {sticker: mediax, mentions: users}, {quoted: m});
        } else if ((isMedia && quoted.mtype === 'documentMessage')) {
            const mediax = await quoted.download?.();
            await conn.sendMessage(m.chat, {document: mediax, mentions: users, mimetype: quoted.mimetype, fileName: quoted.fileName || 'Hidetag_document', caption: htextos}, {quoted: m});
        }
    } else {
        await conn.relayMessage(m.chat, {extendedTextMessage: {text: `${masss}\n${htextos}\n`, ...{contextInfo: {mentionedJid: users, externalAdReply: {thumbnail: imagen1, sourceUrl: 'https://github.com/BrunoSobrino/TheMystic-Bot-MD'}}}}}, {});
    }
};

handler.help = ['hidetag'];
handler.tags = ['group'];
handler.command = /^(hidetag|notificar|notify|tag)$/i;
handler.group = true;
handler.admin = true;
export default handler;
