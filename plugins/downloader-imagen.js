const handler = async (m, { conn, text, usedPrefix, command }) => {
  const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_imagen;

  if (!text) return m.reply(`${tradutor.texto1} ${usedPrefix + command} Minecraft*`);

  /*if (m.text.includes('gore') || m.text.includes('cp') ||
      m.text.includes('porno') || m.text.includes('Gore') ||
      m.text.includes('rule') || m.text.includes('CP') ||
      m.text.includes('Rule34')) {
    return m.reply('[❗] NO PUEDO ENVIAR ESTE CONTENIDO PORQUE ESTA PROHIBIDO BUSCAR CONTENIDO EXPLICITO');
  }*/

  const apiImage = `${global.MyApiRestBaseUrl}/api/googleImage?text=${encodeURIComponent(text)}&apikey=${global.MyApiRestApikey}`;
  const res = await conn.getFile(apiImage);
  const link = await res.data;

  conn.sendFile(m.chat, link, 'error.jpg', `${tradutor.texto2[0]} ${text}\n${tradutor.texto2[1]} ${apiImage}\n${tradutor.texto2[2]}`, m);
};

handler.help = ['gimage <query>', 'imagen <query>'];
handler.tags = ['internet', 'tools'];
handler.command = /^(gimage|image|imagen)$/i;
export default handler;
