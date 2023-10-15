const handler = async (m, { conn }) => {
  try {
    const pp = 'https://github.com/jenfast.png'; // URL de la imagen
    const img = await (await fetch(pp)).buffer(); // Se descarga la imagen
    const _uptime = process.uptime() * 1000;
    const uptime = clockString(_uptime);
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    const str = `╭────[ *FAST OBB - BOT* ]
│
│ *➤ ʜᴏʟᴀ ${taguser}*
│
│ *=> 🤖 ᴛɪᴇᴍᴘᴏ ᴀᴄᴛɪᴠᴏ:* ${uptime}
│ *=> ✅ 𝖇𝖔𝖙 𝖉𝖊 𝖚𝖘𝖔 𝖕𝖗𝖎𝖛𝖆𝖉𝖔*
│ *=> 👑 𝕮𝖗𝖊𝖆𝖉𝖔𝖗:  𝕵𝖊𝖓 𝖋𝖆$✝️*
╰────────────────`.trim();

    if (m.isGroup) {
      // En un grupo
      conn.sendMessage(m.chat, {
        text: str.trim(),
        mentions: [m.sender], // Mencionamos al remitente
        contextInfo: {
          forwardingScore: 9999999,
          isForwarded: true,
          mentionedJid: [m.sender],
          externalAdReply: {
            "showAdAttribution": true,
            "containsAutoReply": true,
            "renderLargerThumbnail": true,
            "title": global.titulowm,
            "containsAutoReply": true,
            "mediaType": 2, // Cambiamos el tipo de medio a imagen
            "thumbnail": img, // La imagen se establece como miniatura
            "mediaUrl": pp, // URL de la imagen
            "sourceUrl": pp // URL de la imagen
          }
        }
      }, { quoted: m });
    } else {
      // En un chat individual
      conn.sendMessage(m.chat, {
        text: str.trim(),
        mentions: [m.sender],
        contextInfo: {
          forwardingScore: 9999999,
          isForwarded: true,
          mentionedJid: [m.sender],
          externalAdReply: {
            "showAdAttribution": true,
            "containsAutoReply": true,
            "renderLargerThumbnail": true,
            "title": global.titulowm,
            "containsAutoReply": true,
            "mediaType": 2,
            "thumbnail": img,
            "mediaUrl": pp,
            "sourceUrl": pp
          }
        }
      }, { quoted: m });
    }
  } catch (error) {
    console.error(error);
  }
};

// Resto del código (clockString, handler.help, handler.tags, handler.command)

export default handler;
