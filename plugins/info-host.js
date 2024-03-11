const handler = async (m, {conn, usedPrefix}) => {
  const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const document = doc[Math.floor(Math.random() * doc.length)];
  const text = `*🚀 -----[ Cafirexos]------- 🚀*
  
 *Hola a todos 👋🏻 ¡Estamos emocionados de anunciar nuestra nueva colaboración con Cafirexos  🤖 Ahora ya pueden tener su propio bot de THE-MYSTIC-BOT-MD en su plataforma en línea, permitiendo  que tus bots estén activos las 24/7. 💻*

_La instalación de estas versiones ha sido aprobada y ya está en pleno funcionamiento. Además, *los servidores son totalmente compatibles, lo que te permite elegir el tipo de inicio del bot según tus necesidades.* ¡Prepárate para una experiencia de usuario ininterrumpida y emocionante!_ 

*Página oficial:*
https://www.cafirexos.com/

*Dashboard:*
https://dash.cafirexos.com

*Panel:*
https://panel.cafirexos.com

*WhatsApp*
https://wa.me/50497150165

*Correo electrónico*
contacto@cafirexos.com

*Canal de WhatsApp*
https://whatsapp.com/channel/0029VaFVSkRCMY0KFmCMDX2q

*¿Dudas? (UNICAMENTE SOBRE EL HOST):*
https://chat.whatsapp.com/FBtyc8Q5w2iJXVl5zGJdFJ
`.trim();
  const buttonMessage= {
    'document': {url: `https://github.com/BrunoSobrino/TheMystic-Bot-MD`},
    'mimetype': `application/${document}`,
    'fileName': `「  𝑯𝒆𝒍𝒍𝒐 𝑾𝒐𝒓𝒍𝒅 」`,
    'fileLength': 99999999999999,
    'pageCount': 200,
    'contextInfo': {
      'forwardingScore': 200,
      'isForwarded': true,
      'externalAdReply': {
        'mediaUrl': 'https://github.com/BrunoSobrino/TheMystic-Bot-MD',
        'mediaType': 2,
        'previewType': 'pdf',
        'title': 'El Mejor Hosting 🚀⁩',
        'body': wm,
        'thumbnail': imagen1,
        'sourceUrl': 'https://whatsapp.com/channel/0029VaFVSkRCMY0KFmCMDX2q'}},
    'caption': text,
    'footer': wm,
    // 'buttons':[
    // {buttonId: `${usedPrefix}menu`, buttonText: {displayText: '𝙼𝙴𝙽𝚄'}, type: 1},
    // {buttonId: `${usedPrefix}donar`, buttonText: {displayText: '𝙳𝙾𝙽𝙰𝚁'}, type: 1}],
    'headerType': 6};
  conn.sendMessage(m.chat, buttonMessage, {quoted: m});
}; 
handler.command = ['host', 'cafirexos'];
export default handler;
