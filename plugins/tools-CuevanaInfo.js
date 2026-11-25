// Si robas doname o deja creditos, rata!
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const handler = async (m, { conn, text, prefix: usedPrefix, command }) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.tools_cuevanainfo
  if (!text) return m.reply(`${tradutor.texto1[0]}${usedPrefix + command}${tradutor.texto1[1]}`);
  
  try {
    const url = text;
    const { title, image, info, sinopsis, onlineLink, downloads } = await getInfoCuevana(url);

    let imageUrl = image;
    if (image && image.startsWith('/_next/image')) {
      const match = image.match(/url=(.*?)&/);
      imageUrl = match ? decodeURIComponent(match[1]) : null;
    }

    let infoMsg = `🎬 *${title}*\n\n`;
    infoMsg += `${tradutor.texto2}\n${info}\n\n`;
    infoMsg += `${tradutor.texto3} ${sinopsis || tradutor.texto4}\n\n`;
    infoMsg += `${tradutor.texto5} ${onlineLink}\n\n`;
    
    if (downloads.length > 0) {
      infoMsg += `${tradutor.texto6}\n`;
      downloads.forEach(d => {
        infoMsg += `${tradutor.texto8} ${d.server}\n`;
        infoMsg += `${tradutor.texto9} ${d.language}\n`;
        infoMsg += `${tradutor.texto10} ${d.quality}\n`;
        infoMsg += `🔗 ${d.link}\n\n`;
      });
    } else {
      infoMsg += `${tradutor.texto7}`;
    }

    if (imageUrl) {
      await conn.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: infoMsg
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, { text: infoMsg }, { quoted: m });
    }

  } catch (e) {
    console.error('Error en getInfoCuevana:', e);
    m.reply(tradutor.texto11);
  }
};
handler.tags = ['tools']
handler .help = ['cuevanainfo <link>']
handler.command = ['getinfocuevana', 'cuevanainfo'];
export default handler;

async function getInfoCuevana(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  
  const title = $('h1.Title').text().trim();
  const image = $('.TPost .Image img').attr('src') || $('meta[property="og:image"]').attr('content');
  const sinopsis = $('.Description p').text().trim();
  const onlineLink = url;

  let info = '';
  $('.TPost .InfoList li').each((i, el) => {
    const label = $(el).find('strong').text().trim();
    const value = $(el).text().replace(label, '').trim();
    info += `• *${label}* ${value}\n`;
  });

  const downloads = [];
  const rows = $('.TPTblCn tbody tr').toArray();

  for (const row of rows) {
    const $row = $(row);
    const server = $row.find('td').eq(0).text().trim().replace(/#\d+\s*/, '');
    const language = $row.find('td').eq(1).text().trim();
    const quality = $row.find('td').eq(2).text().trim();
    const link = $row.find('td a').attr('href');
    const resolvedLink = await extraerRedireccionDesdeHTML(link);

    if (resolvedLink) {
      downloads.push({
        server,
        language,
        quality,
        link: resolvedLink 
      });
    }
  }

  const actors = [];
  $('.CastList li').each((i, el) => {
    actors.push($(el).text().trim());
  });
  
  if (actors.length > 0) {
    info += `🎭 *Actores:* ${actors.join(', ')}`;
  }

  return { 
    title,
    image, 
    info, 
    sinopsis, 
    onlineLink, 
    downloads 
  };
}

async function extraerRedireccionDesdeHTML(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      maxRedirects: 0
    }).catch(e => e.response);
    if ([301, 302].includes(response.status)) {
      return response.headers.location;
    }
    const html = response.data;
    const $ = cheerio.load(html);
    const scriptContent = $('script:contains("let url")').text();
    const match = scriptContent.match(/let\s+url\s*=\s*["']([^"']+)["']/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error en extraerRedireccionDesdeHTML:", error.message);
    return null;
  }
}
