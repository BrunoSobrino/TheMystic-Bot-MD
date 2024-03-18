import fetch from 'node-fetch';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.ia_character_ai


const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) {
    throw `${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]}`;
  }

  try {
    conn.sendPresenceUpdate('composing', m.chat);

    const API_URL = `https://vihangayt.me/tools/characterai?q=${encodeURIComponent(text)}`;
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.status && data.data) {
      const respuestaAPI = data.data;
      conn.reply(m.chat, respuestaAPI, m);
    } else {
      throw tradutor.texto2;
    }
  } catch (error) {
    throw tradutor.texto3;
  }
};

handler.command = /^aicharacter$/i;

export default handler;
