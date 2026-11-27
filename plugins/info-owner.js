const handler = async (m, {conn, usedPrefix}) => {
 const datas = global
 const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
 const tradutor = _translate.plugins.info_creador

 const text = `${tradutor.texto1[0]}\n\n${tradutor.texto1[1]}\n\n${tradutor.texto1[2]}\n\n${tradutor.texto1[3]}\n\n${tradutor.texto1[4]}\n\n${tradutor.texto1[5]}\n\n${tradutor.texto1[6]}\n\n${tradutor.texto1[7]}\n\n${tradutor.texto1[8]}\n\n${tradutor.texto1[9]}\n\n${tradutor.texto1[10]}\n\n${tradutor.texto1[11]}\n\n${tradutor.texto1[12]}\n\n${tradutor.texto1[13]}`.trim();
 // Antes se mandaba como documento falso (una URL de GitHub como
 // "documento", con mimetype aleatorio y fileLength inventado): en varios
 // dispositivos no se veía nada. Ahora es un mensaje de texto normal con
 // la misma tarjeta de vista previa (externalAdReply).
 const buttonMessage = {
    'text': text,
    'contextInfo': {
      'forwardingScore': 200,
      'isForwarded': true,
      'externalAdReply': {
        'mediaUrl': 'https://github.com/BrunoSobrino/TheMystic-Bot-MD',
        'mediaType': 2,
        'previewType': 'pdf',
        'title': tradutor.texto2[1],
        'body': wm,
        'thumbnail': imagen1,
        'sourceUrl': 'https://www.youtube.com/channel/UCSTDMKjbm-EmEovkygX-lCA'}},
 };
 conn.sendMessage(m.chat, buttonMessage, {quoted: m});
};

handler.help = ['owner'];
handler.tags = ['info'];
handler.command = /^(owner|creator|creador|propietario)$/i;

export default handler;
