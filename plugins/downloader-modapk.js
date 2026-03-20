import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';

const handler = async (m, {conn, usedPrefix: prefix, command, text}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_modapk;

  if (!text) throw `${tradutor.texto1}`;
  
  await conn.sendMessage(m.chat, {text: '🔍 Buscando APK...'}, {quoted: m});
  
  // Opción 1: Aptoide
  try {
    const searchUrl = `https://en.aptoide.com/search?query=${encodeURIComponent(text)}`;
    
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Referer': 'https://en.aptoide.com/',
        'Connection': 'keep-alive'
      }
    });
    
    const $ = cheerio.load(data);
    const firstResult = $('.card-app').first();
    
    if (firstResult.length > 0) {
      const appLink = firstResult.find('a').attr('href');
      const appName = firstResult.find('.name').text().trim() || firstResult.find('.card-title').text().trim();
      const appIcon = firstResult.find('img').attr('src');
      
      if (appLink) {
        const appUrl = appLink.startsWith('http') ? appLink : `https://en.aptoide.com${appLink}`;
        
        const { data: appData } = await axios.get(appUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': searchUrl
          }
        });
        
        const $app = cheerio.load(appData);
        const downloadBtn = $app('.download-button').attr('href') || 
                           $app('a[href*="download"]').first().attr('href') ||
                           $app('.main-download').attr('href');
        
        if (downloadBtn) {
          const dlUrl = downloadBtn.startsWith('http') ? downloadBtn : `https://en.aptoide.com${downloadBtn}`;
          
          // Obtener página de descarga
          const { data: dlData } = await axios.get(dlUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Referer': appUrl
            }
          });
          
          const $dl = cheerio.load(dlData);
          let finalLink = $dl('a[href$=".apk"]').first().attr('href') ||
                         $dl('a.download-link').attr('href') ||
                         $dl('[data-href$=".apk"]').attr('data-href');
          
          // Si no encuentra link directo, buscar en scripts
          if (!finalLink) {
            const scripts = $dl('script').text();
            const match = scripts.match(/https?:\/\/[^"']+\.apk/);
            if (match) finalLink = match[0];
          }
          
          if (finalLink) {
            const version = $app('.version').text().trim() || 
                          $app('[itemprop="softwareVersion"]').text().trim() || 
                          'Última versión';
            const size = $app('.size').text().trim() || 
                        $app('[itemprop="fileSize"]').text().trim() || 
                        'Desconocido';
            const packageName = $app('.package').text().trim() || 
                              $app('[itemprop="applicationCategory"]').text().trim() || 
                              'Desconocido';
            
            let response = `📱 *APK Encontrado (Aptoide)*\n\n*Nombre:* ${appName}\n*Paquete:* ${packageName}\n*Versión:* ${version}\n*Tamaño:* ${size}`;
            
            await conn.sendMessage(m.chat, {
              image: {url: appIcon || 'https://i.imgur.com/s9F2AG5.png'}, 
              caption: response
            }, {quoted: m});
            
            if (size.includes('GB') || (size.includes('MB') && parseInt(size.replace(/[^0-9]/g, '')) > 999)) {
              return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
            }
            
            const directLink = finalLink.startsWith('http') ? finalLink : `https://en.aptoide.com${finalLink}`;
            
            await conn.sendMessage(m.chat, {
              document: {url: directLink}, 
              mimetype: 'application/vnd.android.package-archive', 
              fileName: appName.replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
              caption: null
            }, {quoted: m});
            
            return;
          }
        }
      }
    }
  } catch (error) {
    console.log('Aptoide falló:', error.message);
  }
  
  // Opción 2: APKMirror
  try {
    const searchUrl = `https://www.apkmirror.com/?post_type=app_release&searchtype=apk&s=${encodeURIComponent(text)}`;
    
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Referer': 'https://www.apkmirror.com/',
        'Connection': 'keep-alive'
      }
    });
    
    const $ = cheerio.load(data);
    const firstResult = $('.listWidget .appRow').first();
    
    if (firstResult.length > 0) {
      const appLink = firstResult.find('.appRowTitle a').attr('href');
      const appName = firstResult.find('.appRowTitle').text().trim();
      const appIcon = firstResult.find('img').attr('src');
      
      if (appLink) {
        const appUrl = `https://www.apkmirror.com${appLink}`;
        
        const { data: appData } = await axios.get(appUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': searchUrl
          }
        });
        
        const $app = cheerio.load(appData);
        const downloadLink = $app('.downloadButton').first().attr('href');
        
        if (downloadLink) {
          const dlUrl = `https://www.apkmirror.com${downloadLink}`;
          
          const { data: dlData } = await axios.get(dlUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Referer': appUrl
            }
          });
          
          const $dl = cheerio.load(dlData);
          const finalLink = $dl('a[href*="download.php"]').first().attr('href');
          
          if (finalLink) {
            const version = $app('.apkm-badge').text().trim() || 'Última versión';
            const size = $app('.apkm-badge.success').text().trim() || 'Desconocido';
            
            let response = `📱 *APK Encontrado (APKMirror)*\n\n*Nombre:* ${appName}\n*Versión:* ${version}\n*Tamaño:* ${size}`;
            
            await conn.sendMessage(m.chat, {
              image: {url: appIcon || 'https://i.imgur.com/s9F2AG5.png'}, 
              caption: response
            }, {quoted: m});
            
            if (size.includes('GB') || (size.includes('MB') && parseInt(size.replace(/[^0-9]/g, '')) > 999)) {
              return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
            }
            
            const directLink = `https://www.apkmirror.com${finalLink}`;
            
            await conn.sendMessage(m.chat, {
              document: {url: directLink}, 
              mimetype: 'application/vnd.android.package-archive', 
              fileName: appName.replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
              caption: null
            }, {quoted: m});
            
            return;
          }
        }
      }
    }
  } catch (error) {
    console.log('APKMirror falló:', error.message);
  }
  
  // Opción 3: APKPure (método alternativo)
  try {
    const searchUrl = `https://m.apkpure.com/search?q=${encodeURIComponent(text)}`;
    
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9'
      }
    });
    
    const $ = cheerio.load(data);
    const firstResult = $('.search-item').first();
    
    if (firstResult.length > 0) {
      const appLink = firstResult.find('a').attr('href');
      const appName = firstResult.find('.p1').text().trim();
      const appIcon = firstResult.find('img').attr('src');
      
      if (appLink) {
        const appUrl = appLink.startsWith('http') ? appLink : `https://m.apkpure.com${appLink}`;
        
        const { data: appData } = await axios.get(appUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
            'Referer': searchUrl
          }
        });
        
        const $app = cheerio.load(appData);
        const downloadBtn = $app('.download-btn').attr('href') || $app('a[href*="/download"]').first().attr('href');
        
        if (downloadBtn) {
          const dlUrl = downloadBtn.startsWith('http') ? downloadBtn : `https://m.apkpure.com${downloadBtn}`;
          
          const { data: dlData } = await axios.get(dlUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
              'Referer': appUrl
            }
          });
          
          const $dl = cheerio.load(dlData);
          const finalLink = $dl('#download_link').attr('href') || $dl('a.da').attr('href');
          
          if (finalLink) {
            const version = $app('.details-sdk span').first().text().trim() || 'Última versión';
            const size = $app('span:contains("Size")').parent().text().replace('Size', '').trim() || 'Desconocido';
            const packageName = $app('p:contains("Package Name")').text().replace('Package Name', '').trim() || 'Desconocido';
            
            let response = `📱 *APK Encontrado (APKPure)*\n\n*Nombre:* ${appName}\n*Paquete:* ${packageName}\n*Versión:* ${version}\n*Tamaño:* ${size}`;
            
            await conn.sendMessage(m.chat, {
              image: {url: appIcon || 'https://i.imgur.com/s9F2AG5.png'}, 
              caption: response
            }, {quoted: m});
            
            if (size.includes('GB') || (size.includes('MB') && parseInt(size.replace(/[^0-9]/g, '')) > 999)) {
              return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
            }
            
            const directLink = finalLink.startsWith('http') ? finalLink : `https://m.apkpure.com${finalLink}`;
            
            await conn.sendMessage(m.chat, {
              document: {url: directLink}, 
              mimetype: 'application/vnd.android.package-archive', 
              fileName: appName.replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
              caption: null
            }, {quoted: m});
            
            return;
          }
        }
      }
    }
  } catch (error) {
    console.log('APKPure falló:', error.message);
  }
  
  // Opción 4: APKMonk
  try {
    const searchUrl = `https://www.apkmonk.com/search/?q=${encodeURIComponent(text)}`;
    
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    const $ = cheerio.load(data);
    const firstResult = $('.app-list-item').first();
    
    if (firstResult.length > 0) {
      const appLink = firstResult.find('a').attr('href');
      const appName = firstResult.find('.app-name').text().trim();
      const appIcon = firstResult.find('img').attr('src');
      
      if (appLink) {
        const appUrl = appLink.startsWith('http') ? appLink : `https://www.apkmonk.com${appLink}`;
        
        const { data: appData } = await axios.get(appUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': searchUrl
          }
        });
        
        const $app = cheerio.load(appData);
        const downloadLink = $app('.button-download').attr('href') || $app('a[href*="download"]').first().attr('href');
        
        if (downloadLink) {
          const version = $app('.version').text().trim() || 'Última versión';
          const size = $app('.size').text().trim() || 'Desconocido';
          
          let response = `📱 *APK Encontrado (APKMonk)*\n\n*Nombre:* ${appName}\n*Versión:* ${version}\n*Tamaño:* ${size}`;
          
          await conn.sendMessage(m.chat, {
            image: {url: appIcon || 'https://i.imgur.com/s9F2AG5.png'}, 
            caption: response
          }, {quoted: m});
          
          if (size.includes('GB') || (size.includes('MB') && parseInt(size.replace(/[^0-9]/g, '')) > 999)) {
            return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
          }
          
          const directLink = downloadLink.startsWith('http') ? downloadLink : `https://www.apkmonk.com${downloadLink}`;
          
          await conn.sendMessage(m.chat, {
            document: {url: directLink}, 
            mimetype: 'application/vnd.android.package-archive', 
            fileName: appName.replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
            caption: null
          }, {quoted: m});
          
          return;
        }
      }
    }
  } catch (error) {
    console.log('APKMonk falló:', error.message);
  }
  
  // Opción 5: Uptodown
  try {
    const searchUrl = `https://en.uptodown.com/android/search/${encodeURIComponent(text)}`;
    
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    const $ = cheerio.load(data);
    const firstResult = $('#search-results article').first();
    
    if (firstResult.length > 0) {
      const appLink = firstResult.find('a').attr('href');
      const appName = firstResult.find('.name').text().trim();
      const appIcon = firstResult.find('img').attr('src');
      
      if (appLink) {
        const appUrl = appLink.startsWith('http') ? appLink : `https://en.uptodown.com${appLink}`;
        
        const { data: appData } = await axios.get(appUrl + '/download', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': searchUrl
          }
        });
        
        const $app = cheerio.load(appData);
        const downloadLink = $app('[data-url]').attr('data-url') || $app('button[data-url]').attr('data-url');
        
        if (downloadLink) {
          const version = $app('.version').text().trim() || 'Última versión';
          const size = $app('.size').text().trim() || 'Desconocido';
          
          let response = `📱 *APK Encontrado (Uptodown)*\n\n*Nombre:* ${appName}\n*Versión:* ${version}\n*Tamaño:* ${size}`;
          
          await conn.sendMessage(m.chat, {
            image: {url: appIcon || 'https://i.imgur.com/s9F2AG5.png'}, 
            caption: response
          }, {quoted: m});
          
          if (size.includes('GB') || (size.includes('MB') && parseInt(size.replace(/[^0-9]/g, '')) > 999)) {
            return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
          }
          
          await conn.sendMessage(m.chat, {
            document: {url: downloadLink}, 
            mimetype: 'application/vnd.android.package-archive', 
            fileName: appName.replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
            caption: null
          }, {quoted: m});
          
          return;
        }
      }
    }
  } catch (error) {
    console.log('Uptodown falló:', error.message);
  }
  
  throw `${tradutor.texto4}`;
};

handler.help = ['apk'];
handler.tags = ['search'];
handler.command = /^(apk|apkmod|modapk|dapk2|aptoide|aptoidedl)$/i;

export default handler;
                                        
