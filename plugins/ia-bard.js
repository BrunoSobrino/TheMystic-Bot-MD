import fetch from 'node-fetch';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.ia_bard
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) {
    throw `${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]}`;
  }

  try {
    conn.sendPresenceUpdate('composing', m.chat);

    const API_URL = `https://vihangayt.me/tools/bard?q=${encodeURIComponent(text)}`;
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.status && data.data) {
      const respuestaAPI = data.data;
      conn.reply(m.chat, respuestaAPI, m);
    } else {
      throw tradutor.texto3;
    }
  } catch (error) {
    throw tradutor.texto4;
  }
};

handler.command = /^bard$/i;

export default handler;
