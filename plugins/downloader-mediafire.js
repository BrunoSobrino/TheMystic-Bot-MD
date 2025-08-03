import axios from 'axios';
import cheerio from 'cheerio';
import { lookup } from 'mime-types';

const handler = async (m, {conn, args, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.descargas_mediafire

  if (!args[0]) throw `_*< DESCARGAS - MEDIAFIRE />*_\n\n*[ ℹ️ ] Ingrese un enlace de MediaFire.*\n\n*[ 💡 ] Ejemplo:* _${usedPrefix + command} https://www.mediafire.com/file/r0lrc9ir5j3e2fs/DOOM_v13_UNCLONE_`;
  
  try {
    const res = await mediafireDl(args[0]);
    const {name, size, date, mime, link} = res;
    const caption = `${tradutor.texto2[0]}\n
    ${tradutor.texto2[1]} ${name}
    ${tradutor.texto2[2]} ${size}
    ${tradutor.texto2[3]} ${mime}\n\n
    ${tradutor.texto2[4]}`.trim();
    await m.reply(caption);
    await conn.sendFile(m.chat, link, name, '', m, null, {mimetype: mime, asDocument: true});
  } catch (error) {
    console.error('Error en MediaFire:', error);
    await m.reply(tradutor.texto3);
  }
};

handler.command = /^(mediafire|mediafiredl|dlmediafire)$/i;
export default handler;

async function mediafireDl(url) {
  try {
    if (!url.includes('www.mediafire.com')) {
      throw new Error('URL de MediaFire inválida');
    }
    const translateUrl = `https://www-mediafire-com.translate.goog/${url.replace('https://www.mediafire.com/', '')}?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=en&_x_tr_pto=wapp`;
    const res = await axios.get(translateUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(res.data);
    const link = $('#downloadButton').attr('href');
    if (!link) throw new Error('No se pudo encontrar el enlace de descarga');
    const name = $('body > main > div.content > div.center > div > div.dl-btn-cont > div.dl-btn-labelWrap > div.promoDownloadName.notranslate > div').attr('title')?.replaceAll(' ', '')?.replaceAll('\n', '') || $('.dl-btn-label').attr('title') || 'archivo_descargado';
    const date = $('body > main > div.content > div.center > div > div.dl-info > ul > li:nth-child(2) > span').text() || 'Fecha no disponible';
    const size = $('#downloadButton').text().replace('Download', '').replace('(', '').replace(')', '').replace(/\n/g, '').replace(/\s+/g, ' ').trim() || 'Tamaño no disponible';
    let mime = '';
    try {
      const headRes = await axios.head(link, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      mime = headRes.headers['content-type'] || '';
    } catch (headError) {
      const ext = name.split('.').pop();
      mime = lookup(ext?.toLowerCase()) || 'application/octet-stream';
    }
    return { name, size, date, mime, link };
  } catch (error) {
    console.error('Error en mediafireDl:', error.message);
    throw new Error(`Error al procesar MediaFire: ${error.message}`);
  }
}
