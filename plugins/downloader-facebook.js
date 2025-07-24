import fetch from 'node-fetch';
import axios from 'axios';
import fs from 'fs';
let enviando = false;

const handler = async (m, {conn, args, command, usedPrefix}) => {
  const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_facebook;

  if (!args[0]) {
    throw `_*${tradutor.texto1[0]}*_\n\n*${tradutor.texto1[1]}*\n\n*${tradutor.texto1[2]}* _${usedPrefix + command} https://fb.watch/fOTpgn6UFQ/_`;
  }

  if (!enviando) enviando = true;
  try {
    
    const response = await fetch(`${global.MyApiRestBaseUrl}/api/facebook?url=${args[0]}&apikey=${global.MyApiRestApikey}`);
    const data = await response.json();

    if (data?.status === true) {
      const videoBuffer = await getBuffer(data.resultado.data);
      await conn.sendMessage(m.chat, { video: videoBuffer, filename: 'video.mp4', caption: `_*${tradutor.texto4}*_` }, {quoted: m});
      enviando = false;
    } else {
      console.error('Failed to fetch video data from API:', data);
      enviando = false;
    }
  } catch (error) {
    console.error('Error occurred:', error);
    enviando = false;
    throw `_*${tradutor.texto5}*`;
  }
};

handler.command = /^(facebook|fb|facebookdl|fbdl|facebook2|fb2|facebookdl2|fbdl2|facebook3|fb3|facebookdl3|fbdl3|facebook4|fb4|facebookdl4|fbdl4|facebook5|fb5|facebookdl5|fbdl5)$/i;
export default handler;

const getBuffer = async (url, options = {}) => {
  const res = await axios({
    method: 'get', 
    url, 
    headers: {'DNT': 1, 'Upgrade-Insecure-Request': 1},
    ...options, 
    responseType: 'arraybuffer'
  });
  return res.data;
};
