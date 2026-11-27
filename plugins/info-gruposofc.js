const handler = async (m, {conn, usedPrefix}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.info_groupsofc

  const text = `${tradutor.texto1[0]}

${tradutor.texto1[1]}
1.- https://chat.whatsapp.com/LjJbmdO0qSDEKgB60qivZj

2.- https://chat.whatsapp.com/DbXBmsydWBE1ZN3EoY0hRs

3.- https://chat.whatsapp.com/BW0P22xx7EGBTdH5IM851F

4.- https://chat.whatsapp.com/CjexkGVr37J6GuSdDVAHzC

> Sunlight Team  :

1.- https://whatsapp.com/channel/0029Vam7yUg77qVaz3sIAp0z

2.- https://chat.whatsapp.com/Fy74b6fgE9SJJpHVi6CKJY`.trim();
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
        'title': `${tradutor.texto3}`,
        'body': wm,
        'thumbnail': imagen1,
        'sourceUrl': 'https://www.youtube.com/channel/UCSTDMKjbm-EmEovkygX-lCA'}}};
  conn.sendMessage(m.chat, buttonMessage, {quoted: m});
};
handler.command = ['linkgc', 'grupos'];
export default handler;
