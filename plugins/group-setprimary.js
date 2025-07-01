const handler = async (m, {args, usedPrefix, isAdmin, command, conn}) => {
    const chat = global.db.data.chats[m.chat] || {};

    const getBotsInGroup = async () => {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat);
            const participants = groupMetadata.participants;
            const allBots = [global.conn.user.jid, ...global.conns.map(bot => bot.user.jid)];
            return participants.filter(p => allBots.includes(p.id));
        } catch {
            return [];
        }
    };

    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? await m?.quoted?.sender : args[0] && args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    if (command === 'setprimary') {
        if (!who) {
            const botsInGroup = await getBotsInGroup();
            let botList = '*🤖 Bots disponibles en este grupo:*\n\n';
            botsInGroup.forEach((bot, index) => {
                const isMainBot = bot.id === global.conn.user.jid;
                const isCurrentPrimary = chat.setPrimaryBot === bot.id;
                const recommendation = isMainBot ? ' (Recomendado - Bot principal)' : isCurrentPrimary ? ' (Actual bot primario)' : '';
                botList += `${index + 1}. +${bot.id.split('@')[0]}${recommendation}\n`;
            });
            botList += `\n*Para establecer uno como primario, usa:*\n${usedPrefix}setprimarybot @bot`;
            
            if (botsInGroup.length === 0) {
                botList = '*[❗] No hay bots disponibles en este grupo.*\n\nAsegúrate de que los bots estén agregados al grupo.';
            }
            
            return conn.sendMessage(m.chat, {text: botList}, {quoted: m});
        }

        if (!who.endsWith('@s.whatsapp.net')) return conn.sendMessage(m.chat, {text: '*[❗] El formato del número es incorrecto.*'}, {quoted: m});
        const botsInGroup = await getBotsInGroup();
        if (!botsInGroup.some(bot => bot.id === who)) {
            return conn.sendMessage(m.chat, {text: '*[❗] El bot mencionado no está en este grupo.*\n\nAgrega el bot al grupo primero.'}, {quoted: m});
        }
        if (!global.conns.some(bot => bot.user.jid === who) && who !== global.conn.user.jid) {
            return conn.sendMessage(m.chat, {text: '*[❗] El bot mencionado no está disponible o no es un bot válido.*'}, {quoted: m});
        }
        chat.setPrimaryBot = who;
        return conn.sendMessage(m.chat, {text: `*✅ Bot primario establecido:*\n+${who.split('@')[0]}\n\n${who === global.conn.user.jid ? '*(Bot principal recomendado)*' : '*(Sub-bot)*'}\n\nAhora solo este bot responderá en este chat.`}, {quoted: m});
    }

    if (command === 'delprimarybot') {        
        if (!chat.setPrimaryBot) return conn.sendMessage(m.chat, {text: '*[❗] No hay un bot primario establecido en este chat.*'}, {quoted: m});
        
        delete chat.setPrimaryBot;
        return conn.sendMessage(m.chat, {text: '*✅ Se eliminó el bot primario, ahora todos los bots pueden responder.*'}, {quoted: m});
    }
};

handler.help = ['setprimary', 'delprimarybot'];
handler.tags = ['group'];
handler.command = ['setprimary', 'delprimarybot'];
handler.group = true;
handler.admin = true;
export default handler;
