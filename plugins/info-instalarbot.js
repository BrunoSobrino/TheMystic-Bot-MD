const handler = async (m, {conn, usedPrefix}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.info_instalarbot

  const text = `${tradutor.texto1}`.trim();
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
        // La tarjeta decía ser un video (mediaType 2) con vista previa de PDF
        // y una miniatura que es una imagen fija: en el lado del receptor el
        // mensaje no se veía (el bot sí lo veía enviado). Ahora es una vista
        // previa de enlace normal: imagen + título + enlace.
        'mediaType': 1,
        'title': tradutor.texto2,
        'body': wm,
        'thumbnail': imagen1,
        'sourceUrl': 'https://www.youtube.com/channel/UCSTDMKjbm-EmEovkygX-lCA'}}};
  conn.sendMessage(m.chat, buttonMessage, {quoted: m});
};
handler.command = ['instalarbot', 'instalarbot'];
export default handler;
