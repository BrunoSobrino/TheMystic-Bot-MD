import { Shazam } from 'node-shazam';
import fetch from 'node-fetch';
import fs from 'fs';
import ytSearch from 'yt-search'; 
import path from 'path';
import CryptoJS from 'crypto-js';

const shazam = new Shazam();

const handler = async (m, { conn }) => {
  const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje;
  const traductor = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`)).plugins.herramientas_whatmusic;

  const q = m.quoted || m;
  const mime = (q.msg || q).mimetype || '';
  
  if (/audio|video/.test(mime)) {
    const media = await q.download();
    const ext = mime.split('/')[1];
    const baseFilePath = `./src/tmp/${m.sender}`; 
    const tempPath = await getUniqueFileName(baseFilePath, ext); 
    fs.writeFileSync(tempPath, media);

    let recognisePromise;
    if (/audio/.test(mime)) {
      recognisePromise = shazam.fromFilePath(tempPath, false, 'en');
    } else if (/video/.test(mime)) {
      recognisePromise = shazam.fromVideoFile(tempPath, false, 'en');
    }

    const recognise = await recognisePromise;
    
    if (!recognise || !recognise?.track) {
      fs.unlinkSync(tempPath);
      return m.reply('> *[❗] Error: Audio not found.*')
    }
    
    const { title, subtitle, artists, genres, images } = recognise.track;
    const apiTitle = `${title} - ${subtitle || ''}`.trim();

    let ytUrl = 'https://github.com/BrunoSobrino';
    try {
      const searchResult = await ytSearch(apiTitle);
      if (searchResult && searchResult.videos.length > 0) {
        ytUrl = searchResult.videos[0].url;
      }
    } catch (error) {
      console.log(error)
    }

    const texto = `${traductor.texto3[0]}\n\n${traductor.texto3[1]} ${title || traductor.texto2}\n${traductor.texto3[2]} ${subtitle || traductor.texto2}\n${traductor.texto3[4]} ${genres.primary || traductor.texto2}`;
    
    let imagen;
    try {
      imagen = await (await fetch(images.coverart)).buffer();
    } catch (error) {
      imagen = null;
    }
    
    await conn.sendMessage(m.chat, { text: texto.trim(), contextInfo: { forwardingScore: 9999999, isForwarded: true }}, { quoted: m });

    await fs.unlinkSync(tempPath);

    if (ytUrl !== 'https://github.com/BrunoSobrino') {
      try {
        const downloadResult = await yt.download(ytUrl);
        
        if (downloadResult && downloadResult.url) {
          const audiobuff = await conn.getFile(downloadResult.url);
          await conn.sendMessage(m.chat, { 
            audio: audiobuff.data, 
            fileName: `${title}.mp3`, 
            mimetype: 'audio/mpeg' 
          }, { quoted: m });
        }
      } catch (error) {
        console.log(error)
      }
    }
  } else {
    throw traductor.texto4;
  }
};

handler.command = /^(quemusica|quemusicaes|whatmusic|shazam)$/i;
export default handler;

async function getUniqueFileName(basePath, extension) {
  let fileName = `${basePath}.${extension}`;
  let counter = 1;
  while (fs.existsSync(fileName)) {
    fileName = `${basePath}_${counter}.${extension}`;
    counter++;
  }
  return fileName;
}

/*
    base   : https://mp3dl.to
    fungsi : download audio dari youtube
    update : 3 Juli 2025 - 04:00 WITA
    note   : kamu perlu library crypto-js
    by     : wolep
*/

const yt = {
    generateToken: () => {
        const payload = JSON.stringify({ timestamp: Date.now() });
        const key = "dyhQjAtqAyTIf3PdsKcJ6nMX1suz8ksZ";
        const token = CryptoJS.AES.encrypt(payload, key).toString();
        return token;
    },

    download: async (youtubeUrl) => {
        const headers = {
            "content-type": "application/json",
        };

        const body = JSON.stringify({
            "url": youtubeUrl,
            "quality": 128,
            "trim": false,
            "startT": 0,
            "endT": 0,
            "token": yt.generateToken()
        });
        
        const result = await fetch("https://ds1.ezsrv.net/api/convert", {
            headers,
            body,
            "method": "POST"
        });
        
        const json = await result.json();
        return json;
    }
};
