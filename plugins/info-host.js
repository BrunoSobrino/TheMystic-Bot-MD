

const handler = async (m, {conn, usedPrefix}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.info_host

  const text = `${tradutor.texto1[0]}
  
${tradutor.texto1[1]}

${tradutor.texto1[2]}

${tradutor.texto1[3]}
${tradutor.texto1[4]}

${tradutor.texto1[5]}
${tradutor.texto1[6]}

${tradutor.texto1[7]}
${tradutor.texto1[8]}

${tradutor.texto1[9]}
${tradutor.texto1[10]}

${tradutor.texto1[11]}
${tradutor.texto1[12]}

${tradutor.texto1[13]}
${tradutor.texto1[14]}

${tradutor.texto1[15]}
${tradutor.texto1[16]}
`.trim();
  // Antes se mandaba como documento falso (una URL de GitHub como
  // "documento", con mimetype aleatorio y fileLength inventado): en varios
  // dispositivos no se veía nada. Ahora es un mensaje de texto normal con
  // la misma tarjeta de vista previa (externalAdReply), que sí se ve en
  // todos los dispositivos.
  const buttonMessage = {
    'text': text,
    'contextInfo': {
      'forwardingScore': 200,
      'isForwarded': true,
      'externalAdReply': {
        'mediaUrl': 'https://github.com/BrunoSobrino/TheMystic-Bot-MD',
        'mediaType': 2,
        'previewType': 'pdf',
        'title': tradutor.texto2,
        'body': wm,
        'thumbnail': imagen1,
        'sourceUrl': 'https://whatsapp.com/channel/0029VaFVSkRCMY0KFmCMDX2q'}}};
  conn.sendMessage(m.chat, buttonMessage, {quoted: m});
}; 
handler.command = ['host', 'cafirexos'];
export default handler;
