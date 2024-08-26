import fetch from 'node-fetch';
import axios from 'axios';
import instagramGetUrl from 'instagram-url-direct';
import { instagram } from '@xct007/frieren-scraper';
import { instagramdl } from '@bochilteam/scraper';
import instagramDl from '@sasmeee/igdl';
import { fileTypeFromBuffer } from 'file-type';

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language;
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_instagram;

  if (!args[0]) throw `${tradutor.texto1} _${usedPrefix + command} https://www.instagram.com/reel/C8sWV3Nx_GZ/?igsh=MWZoeTY2cW01Nzg1bQ==`;
  await m.reply(global.wait);

  try {
    const response = await fetch(`${global.MyApiRestBaseUrl}/api/v1/igdl?url=${encodeURIComponent(args[0])}&apikey=${global.MyApiRestApikey}`);
    const json = await response.json();
    if (json.success && json.data.length > 0) {
      for (const item of json.data) {
        if (item.type === 'video') {
          await conn.sendMessage(m.chat, { video: { url: item.url_download } }, { quoted: m });
        } else if (item.type === 'audio') {
          await conn.sendMessage(m.chat, { audio: { url: item.url_download }, mimetype: 'audio/mp4' }, { quoted: m });
        }
      }
    } else {
      throw new Error('API personalizada falló');
    }
  } catch (err) {
    console.error('Error en API personalizada:', err.message);
    try {
      const img = await instagramDl(args[0]);
      for (let i = 0; i < img.length; i++) {
        const bufferInfo = await getBuffer(img[i].download_link);
        if (!bufferInfo) throw new Error('Archivo no válido');
        
        if (bufferInfo.detectedType.mime.startsWith('image/')) {
          await conn.sendMessage(m.chat, { image: { url: img[i].download_link } }, { quoted: m });
        } else if (bufferInfo.detectedType.mime.startsWith('video/')) {
          await conn.sendMessage(m.chat, { video: { url: img[i].download_link } }, { quoted: m });
        }
      }
    } catch (err) {
      console.error('Error en instagramDl:', err.message);
      try {
        const datTa = await instagram.download(args[0]);
        for (const urRRl of datTa) {
          const shortUrRRl = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
          const tXXxt = `${tradutor.texto2} _${shortUrRRl}_`.trim();
          await conn.sendFile(m.chat, urRRl.url, 'error.mp4', tXXxt, m);
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      } catch (err) {
        console.error('Error en instagram.download:', err.message);
        try {
          const resultss = await instagramGetUrl(args[0]);
          const shortUrl2 = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
          const txt2 = `${tradutor.texto2} _${shortUrl2}_`.trim();
          await conn.sendFile(m.chat, resultss.url_list[0], 'error.mp4', txt2, m);
        } catch (err) {
          console.error('Error en instagramGetUrl:', err.message);
          try {
            const resultssss = await instagramdl(args[0]);
            const shortUrl3 = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
            const txt4 = `${tradutor.texto2} _${shortUrl3}_`.trim();
            for (const { url } of resultssss) await conn.sendFile(m.chat, url, 'error.mp4', txt4, m);
          } catch (err) {
            console.error('Error en instagramdl:', err.message);
            try {
              const human = await fetch(`https://api.lolhuman.xyz/api/instagram?apikey=${lolkeysapi}&url=${args[0]}`);
              const json = await human.json();
              const videoig = json.result;
              const shortUrl1 = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
              const txt1 = `${tradutor.texto2} _${shortUrl1}_`.trim();
              await conn.sendFile(m.chat, videoig, 'error.mp4', txt1, m);
            } catch (err) {
              console.error('Error en lolhuman API:', err.message);
              throw `${tradutor.texto3}`;
            }
          }
        }
      }
    }
  }
};

handler.command = /^(instagramdl|instagram|igdl|ig|instagramdl2|instagram2|igdl2|ig2|instagramdl3|instagram3|igdl3|ig3)$/i;
export default handler;

const getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'get',
      url,
      headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1 },
      ...options,
      responseType: 'arraybuffer'
    });
    const buffer = Buffer.from(res.data, 'binary');
    const detectedType = await fileTypeFromBuffer(buffer);
    if (!detectedType || !['image/jpeg', 'image/png', 'video/mp4'].includes(detectedType.mime)) {
      throw new Error('Tipo de archivo no válido');
    }
    return { buffer, detectedType };
  } catch (error) {
    console.error('Error en getBuffer:', error.message);
    return null;
  }
};
