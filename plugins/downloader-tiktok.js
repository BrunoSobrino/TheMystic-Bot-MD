import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_tiktok;

  if (!text) throw `*${tradutor.texto1}*\n_${usedPrefix + command} https://vt.tiktok.com/ZS12345/ _`;
  if (!/(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi.test(text)) throw `*${tradutor.texto2}*`;

  await m.reply(`*[⏳] ${tradutor.texto3}*`);

  try {
    // INTENTO 1: Scraping instatiktok.com
    let videoUrl = null;
    const links = await fetchDownloadLinks(args[0], 'tiktok');
    
    // Priorizamos explícitamente enlaces que contengan 'hdplay'
    if (links && links.length > 0) {
      videoUrl = links.find(link => /hdplay/i.test(link)) || links.find(link => /download/i.test(link)) || links[0];
    }

    // INTENTO 2: Fallback con APIs estables (Forzando calidad HD)
    if (!videoUrl) {
      const encoded = encodeURIComponent(args[0]);
      const apis = [
        `https://www.tikwm.com/api/?url=${encoded}&hd=1`, // Añadido &hd=1
        `https://api.vreden.my.id/api/tiktok?url=${encoded}`,
        `https://luminai.my.id/api/download/tiktok?url=${encoded}`
      ];

      for (const api of apis) {
        try {
          const { data: json } = await axios.get(api);
          
          // Priorizamos json.data.hdplay antes que json.data.play
          videoUrl = json.data?.hdplay || json.data?.play || json.data?.url || json.result?.url || (Array.isArray(json.data) ? json.data[0].url : null);
          
          if (videoUrl) break;
        } catch (err) { 
          console.log(`[API Fallback Error] ${api}:`, err.message);
          continue; 
        }
      }
    }

    if (!videoUrl) throw new Error('No se pudo obtener el enlace HD del video.');

    const cap = `✅ *TikTok descargado en alta calidad*\n${tradutor.texto8[0]} _${usedPrefix}tomp3_ ${tradutor.texto8[1]}`;
    await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: cap }, { quoted: m });

  } catch (e) {
    console.error(e);
    throw `*${tradutor.texto9}*`;
  }
};

handler.help = ['tiktok'];
handler.tags = ['downloader'];
handler.command = /^(tiktok|ttdl|tiktokdl|tiktoknowm|tt|ttnowm|tiktokaudio)$/i;

export default handler;

// --- FUNCIONES DE APOYO ---

async function fetchDownloadLinks(text, platform) {
  try {
    const SITE_URL = 'https://instatiktok.com/';
    const form = new URLSearchParams();
    form.append('url', text);
    form.append('platform', platform);

    const res = await axios.post(`${SITE_URL}api`, form.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': SITE_URL,
        'Referer': SITE_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const html = res?.data?.html;
    if (!html || res?.data?.status !== 'success') return null;

    const $ = cheerio.load(html);
    const links = [];
    $('a.btn[href^="http"]').each((_, el) => {
      const link = $(el).attr('href');
      if (link && !links.includes(link)) links.push(link);
    });
    return links;
  } catch {
    return null;
  }
  }
