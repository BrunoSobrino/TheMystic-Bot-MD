import fetch from 'node-fetch';
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';

const handler = async (m, { conn, args, command, usedPrefix, text }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.adult_xvideosdl;

  if (!db.data.chats[m.chat].modohorny && m.isGroup) throw `${tradutor.texto1} #enable modohorny*`;
  if (!args[0]) throw `${tradutor.texto2} ${usedPrefix + command} https://www.xvideos.com/video...*`;

  try {
    await conn.reply(m.chat, `🚀 *Extrayendo video en alta definición (HD)...*`, m);
    
    const res = await xvideosdl(args[0]);
    
    // Enviamos como documento para forzar que WhatsApp no toque la resolución
    await conn.sendMessage(m.chat, { 
      document: { url: res.result.url }, 
      mimetype: 'video/mp4', 
      fileName: `${res.result.title}.mp4`,
      caption: `🔥 *Título:* ${res.result.title}\n✅ *Calidad:* ${res.result.quality}\n\n> 📥 _Si el archivo es HD, pesará más de lo habitual._`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    throw `❌ *Error:* No se pudo obtener la versión HD. Es posible que el video original no tenga esa calidad disponible.`;
  }
};

handler.tags = ['nsfw'];
handler.help = ['xvideosdl'];
handler.command = /^(xvideosdl)$/i;

export default handler;

async function xvideosdl(url) {
  return new Promise(async (resolve, reject) => {
    try {
      // Simulamos un navegador real para que el servidor nos de el archivo HD
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Referer': 'https://www.xvideos.com/'
        }
      });
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const title = $("meta[property='og:title']").attr("content") || "Video";

      // Buscamos específicamente las URLs de alta calidad con Regex mejorado
      const videoHigh = (html.match(/setVideoUrlHigh\(['"](.*?)['"]\)/) || [])[1];
      const videoLow = (html.match(/setVideoUrlLow\(['"](.*?)['"]\)/) || [])[1];

      // Verificamos si encontramos la versión High
      let finalUrl = videoHigh || videoLow;
      let qualityLabel = videoHigh ? "720p/1080p (HD)" : "360p (SD)";

      if (!finalUrl) return reject("No se encontró el enlace.");

      resolve({ 
        status: 200, 
        result: { 
          title, 
          url: finalUrl, 
          quality: qualityLabel 
        } 
      });
    } catch (err) {
      reject(err);
    }
  });
}

