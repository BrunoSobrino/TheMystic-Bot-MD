import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';

const handler = async (m, {conn, usedPrefix: prefix, command, text}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_modapk;

  if (!text) throw `${tradutor.texto1}`;
  
  try {    
    // Usar APKPure como fuente alternativa
    const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(text)}`;
    const searchRes = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(searchRes.data);
    
    // Obtener el primer resultado
    const firstResult = $('.first');
    const appUrl = 'https://apkpure.com' + firstResult.find('a').attr('href');
    const appName = firstResult.find('.p1').text().trim();
    
    if (!appUrl || appUrl === 'https://apkpure.com') {
      throw new Error('No se encontró la aplicación');
    }
    
    // Obtener detalles de la app
    const appRes = await axios.get(appUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $app = cheerio.load(appRes.data);
    
    const icon = $app('.icon img').attr('src');
    const packageName = $app('.fz-13').first().text().trim();
    const size = $app('.fz-13:contains("Size")').parent().find('.fz-13').last().text().trim() || 'Desconocido';
    const version = $app('.details-sdk span').first().text().trim() || 'Última versión';
    const downloadPageUrl = $app('.download-btn').attr('href');
    
    if (!downloadPageUrl) {
      throw new Error('No se encontró el enlace de descarga');
    }
    
    // Obtener link de descarga directo
    const dlRes = await axios.get('https://apkpure.com' + downloadPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $dl = cheerio.load(dlRes.data);
    const directLink = $dl('#download_link').attr('href') || $dl('.download-btn').attr('href');
    
    if (!directLink) {
      throw new Error('No se pudo obtener el enlace de descarga directo');
    }
    
    let response = `${tradutor.texto2[0]} ${appName}\n${tradutor.texto2[1]} ${packageName}\n${tradutor.texto2[2]} ${version}\n${tradutor.texto2[3]} ${size}`;
    
    await conn.sendMessage(m.chat, {image: {url: icon}, caption: response}, {quoted: m});
    
    // Verificar si el archivo es muy grande
    if (size.includes('GB') || (size.includes('MB') && parseInt(size.replace(' MB', '')) > 999)) {
      return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
    }
    
    // Enviar el APK
    await conn.sendMessage(m.chat, {
      document: {url: directLink}, 
      mimetype: 'application/vnd.android.package-archive', 
      fileName: appName.replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
      caption: null
    }, {quoted: m});
    
  } catch (error) {
    console.error('Error en descarga de APK:', error);
    throw `${tradutor.texto4}`;
  }
};

handler.help = ['apk'];
handler.tags = ['search'];
handler.command = /^(apk|apkmod|modapk|dapk2|aptoide|aptoidedl)$/i;

export default handler;
   
