import { Shazam } from 'node-shazam';
import fetch from 'node-fetch';
import fs from 'fs';
import ytSearch from 'yt-search'; 
import path from 'path';

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
        
        if (downloadResult && downloadResult.download) {
          const audiobuff = await conn.getFile(downloadResult.download);
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
  base   : https://ytmp3.fi/JSan/
  fungsi : download audio dari youtube
  node   : v24.2.0
  note   : only support audio 60 menit
           audio support untuk wa,
           baypass captcha
  update : 3 juli 2025 - 13:00
  by     : wolep
*/

const yt = {
  download: async (youtubeUrl) => {
    const id = youtubeUrl?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2];
    if (!id) throw Error(`No se pudo obtener el ID del video de YouTube`);

    const delay = (ms) => new Promise(re => setTimeout(re, ms));
    const MAX_FETCH_ATTEMPT = 8;
    const NEXT_FETCH_WAITING_TIME = 3000;
    let fetchCount = 0;

    const headers = {
      "Referer": "https://ytmp3.fi/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    };

    const handleCapcay = async (id) => {
      try {
        const randomCode = (Math.random() + "").substring(2, 6);

        const captchaHeaders = {
          "Origin": "https://cf.hn",
          "Content-Type": "application/x-www-form-urlencoded",
          "Referer": `https://cf.hn/captcha.php?id=${id}&page=ytmp3.fi`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        };

        const body = new URLSearchParams({
          "userCaptcha": randomCode,
          "generatedCaptcha": randomCode,
          id,
          "page": "ytmp3.fi"
        }).toString();

        await fetch("https://cf.hn/captcha_check.php", {
          headers: captchaHeaders,
          body,
          method: "POST"
        });
      } catch (error) {
        console.log("Error handling captcha:", error.message);
      }
    };

    let json;
    do {
      try {
        console.log(`Intento ${fetchCount + 1} de ${MAX_FETCH_ATTEMPT}`);

        const r = await fetch(`https://cf.hn/z.php?id=${id}&t=${Date.now()}`, { 
          headers,
          timeout: 10000
        });
        
        if (!r.ok) {
          throw Error(`Error HTTP ${r.status}: ${r.statusText}`);
        }
        
        const responseText = await r.text();
        
        try {
          json = JSON.parse(responseText);
        } catch (parseError) {
          throw Error(`Respuesta no válida del servidor: ${responseText.substring(0, 100)}`);
        }

        if (json?.status == 0 || json?.status === "0") {
          const errorMsg = json?.message || json?.error || "Error desconocido del servidor";
          throw Error(`Error de la API: ${errorMsg}`);
        } else if (json?.status == "captcha") {
          console.log("Resolviendo captcha...");
          await delay(2000);
          await handleCapcay(id);
          await delay(3000);
        } else if (json?.status == 1 || json?.status === "1") {
          if (json?.download) {
            return json;
          } else {
            throw Error("No se encontró enlace de descarga en la respuesta");
          }
        }

        await delay(NEXT_FETCH_WAITING_TIME);
        fetchCount++;
        
      } catch (error) {
        if (fetchCount >= MAX_FETCH_ATTEMPT - 1) {
          throw error;
        }
        console.log(`Error en intento ${fetchCount + 1}: ${error.message}`);
        await delay(NEXT_FETCH_WAITING_TIME);
        fetchCount++;
      }
    } while (fetchCount < MAX_FETCH_ATTEMPT);
    
    throw Error(`Se agotaron los intentos de descarga. Último estado: ${json?.status || 'desconocido'}`);
  }
};
