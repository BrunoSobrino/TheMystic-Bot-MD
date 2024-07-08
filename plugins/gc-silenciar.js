// Codigo creado por: Bruno Sobrino (https://github.com/BrunoSobrino/
// Recreado del Código por: MoonContentCreator
import fetch from 'node-fetch';

// Función para mapear índices a cadenas codificadas
const getStringFromCode = (index, offset) => {
    const sequence = [
        // Mensajes y strings codificados
        '*[ℹ️]* Solo otro administrador puede desilenciarte', '*[ℹ️]* Solo el propietario del bot no puede ser silenciado', 
        '129PEBBUv', '51289OMfQvC', 'data', '9070eQsjRl', 'users', 'owner', 'user', '*[❗] Tus mensajes serán eliminados*', 
        'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD', 
        'mute', 'muto', 'Halo', '𝚄𝚂𝚄𝙰𝚁𝙸𝙾 SILENCIADO', '3136705kmgDtk', 'mentionedJid', 
        '*[❗] Menciona a la persona que deseas silenciar', '@s.whatsapp.net', 'reply', 'sender', '𝚄𝚂𝚄𝙰𝚁𝙸𝙾 DESILENCIADO', 
        '*[❗]* No puedes silenciar al bot', 'group', '0@s.whatsapp.net', 'unmute', 'desilenciar', '14340DPskXA', 
        '*[❗] Este usuario no ha sido silenciado*', '*[❗] Menciona a la persona que deseas silenciar*', '472398wcTpbo', 
        '848XQksSy', '*[❗] Este usuario ya ha sido silenciado*', 'groupMetadata', '*[❗]* No puedes mutar el propietario de este grupo', 
        '6547128nviniQ', '3051obNcjV', 'chat', 'jid', 'quoted', '*[ ℹ️ ] Este comando solo puede ser usado por administradores del grupo.', 
        '955169UoGRsU'
    ];
    return sequence[index - 0x136];
};

// Handler para procesar comandos de mensajes
const handler = async (message, { conn, command, text, isAdmin }) => {
    if (command === 'mute' || command === 'silenciar') {
        if (!isAdmin) throw '*[ ℹ️ ] Este comando solo puede ser usado por administradores del grupo.*';

        const ownerJid = global['owner'][0][0] + '@s.whatsapp.net';
        if (message['mentionedJid'][0] === ownerJid) throw '*[❗]* No puedes silenciar al propietario del bot.';

        let targetJid = message['mentionedJid'][0] ? message['mentionedJid'][0] : text;
        if (targetJid === conn['user']['jid']) throw '*[❗]* No puedes silenciar al bot.';

        const groupMetadata = await conn['groupMetadata'](message['chat']);
        const groupOwnerJid = groupMetadata['owner'] || message['chat'].split('-')[0] + '@s.whatsapp.net';
        if (message['mentionedJid'][0] === groupOwnerJid) throw '*[❗]* No puedes silenciar al propietario de este grupo.';

        let userData = global['db']['data']['users'][targetJid];
        if (userData['mute'] === true) throw '*[❗] Este usuario ya ha sido silenciado.*';

        conn['reply'](message['chat'], '*[❗] Tus mensajes serán eliminados*', {
            'key': { 'participants': '0@s.whatsapp.net', 'fromMe': false, 'id': 'Halo' },
            'message': {
                'locationMessage': {
                    'name': '𝚄𝚂𝚄𝙰𝚁𝙸𝙾 SILENCIADO',
                    'jpegThumbnail': await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer()
                }
            },
            'participant': '0@s.whatsapp.net'
        });

        global['db']['data']['users'][targetJid]['mute'] = true;
    } else if (command === 'unmute' || command === 'desilenciar') {
        if (!isAdmin) throw '*[ ℹ️ ] Este comando solo puede ser usado por administradores del grupo.*';

        let targetJid = message['mentionedJid'][0] ? message['mentionedJid'][0] : text;
        let userData = global['db']['data']['users'][targetJid];
        if (userData['mute'] === false) throw '*[❗] Este usuario no ha sido silenciado.*';

        global['db']['data']['users'][targetJid]['mute'] = false;
        conn['reply'](message['chat'], '*[❗] Tus mensajes no serán eliminados*', {
            'key': { 'participants': '0@s.whatsapp.net', 'fromMe': false, 'id': 'Halo' },
            'message': {
                'locationMessage': {
                    'name': '𝚄𝚂𝚄𝙰𝚁𝙸𝙾 DESILENCIADO',
                    'jpegThumbnail': await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer()
                }
            },
            'participant': '0@s.whatsapp.net'
        });
    }
};

// Configuración del comando y permisos del handler
handler['command'] = /^(mute|silenciar|unmute|desilenciar)$/i;
handler['admin'] = true;
handler['botAdmin'] = true;

export default handler;
