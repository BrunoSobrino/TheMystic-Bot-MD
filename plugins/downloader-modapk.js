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
  
  // Configuración de headers más realista
  const getHeaders = (referer = '') => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': referer ? 'same-origin' : 'none',
    'Cache-Control': 'max-age=0',
    'TE': 'trailers',
    ...(referer && { 'Referer': referer })
  });

  const axiosConfig = {
    timeout: 30000,
    maxRedirects: 5,
    validateStatus: (status) => status < 500
  };

  // Opción 1: Aptoide (con mejor configuración)
  try {
    const searchUrl = `https://en.aptoide.com/search?query=${encodeURIComponent(text)}`;
    
    const { data, status } = await axios.get(searchUrl, {
      ...axiosConfig,
      headers: getHeaders()
    });
    
    if (status === 200) {
      const $ = cheerio.load(data);
      const firstResult = $('.card').first().find('a[href*="/download"]').first();
      
      if (firstResult.length > 0) {
        const appLink = firstResult.attr('href');
        const appName = firstResult.find('.name').text().trim() || 
                       firstResult.closest('.card').find('.name').text().trim() ||
                       firstResult.closest('.card').find('img').attr('alt');
        const appIcon = firstResult.closest('.card').find('img').attr('src') ||
                       firstResult.find('img').attr('src');
        
        if (appLink) {
          const appUrl = appLink.startsWith('http') ? appLink : `https://en.aptoide.com${appLink}`;
          
          const { data: appData } = await axios.get(appUrl, {
            ...axiosConfig,
            headers: getHeaders(searchUrl)
          });
          
          const $app = cheerio.load(appData);
          
          // Buscar link de descarga directa
          let downloadLink = $app('a[href$=".apk"]').first().attr('href');
          
          if (!downloadLink) {
            // Buscar en data attributes
            downloadLink = $app('[data-apk]').attr('data-apk') ||
                          $app('[data-download]').attr('data-download');
          }
          
          if (!downloadLink) {
            // Buscar en JSON embebido
            const scripts = $app('script[type="application/ld+json"]').html();
            if (scripts) {
              try {
                const jsonData = JSON.parse(scripts);
                downloadLink = jsonData.downloadUrl || jsonData.url;
              } catch (e) {}
            }
          }
          
          if (downloadLink) {
            const version = $app('.version').text().trim() || 'Última versión';
            const size = $app('.size').text().trim() || 'Desconocido';
            const packageName = appUrl.split('/').pop().split('?')[0];
            
            let response = `📱 *APK Encontrado (Aptoide)*\n\n*Nombre:* ${appName}\n*Paquete:* ${packageName}\n*Versión:* ${version}\n*Tamaño:* ${size}`;
            
            await conn.sendMessage(m.chat, {
              image: {url: appIcon || 'https://i.imgur.com/s9F2AG5.png'}, 
              caption: response
            }, {quoted: m});
            
            if (size.includes('GB') || (size.includes('MB') && parseInt(size.replace(/[^0-9]/g, '')) > 999)) {
              return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
            }
            
            const finalLink = downloadLink.startsWith('http') ? downloadLink : `https://en.aptoide.com${downloadLink}`;
            
            await conn.sendMessage(m.chat, {
              document: {url: finalLink}, 
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

  // Opción 2: APKCombo (muy confiable)
  try {
    const searchUrl = `https://apkcombo.com/search/${encodeURIComponent(text)}`;
    
    const { data, status } = await axios.get(searchUrl, {
      ...axiosConfig,
      headers: getHeaders()
    });
    
    if (status === 200) {
      const $ = cheerio.load(data);
      const firstResult = $('a.click-item').first();
      
      if (firstResult.length > 0) {
        const appLink = firstResult.attr('href');
        const appName = firstResult.find('.name').text().trim() || 
                       firstResult.find('img').attr('alt');
        const appIcon = firstResult.find('img').attr('data-src') || 
                       firstResult.find('img').attr('src');
        
        if (appLink) {
          const appUrl = appLink.startsWith('http') ? appLink : `https://apkcombo.com${appLink}`;
          
          const { data: appData } = await axios.get(appUrl + '/download/apk', {
            ...axiosConfig,
            headers: getHeaders(searchUrl)
          });
          
          const $app = cheerio.load(appData);
          
          // APKCombo usa un sistema de descarga en dos pasos
          const downloadBtn = $app('.download-btn').attr('href') || 
                            $app('a[href*="download"]').first().attr('href');
          
          if (downloadBtn) {
            const dlUrl = downloadBtn.startsWith('http') ? downloadBtn : `https://apkcombo.com${downloadBtn}`;
            
            const { data: dlData } = await axios.get(dlUrl, {
              ...axiosConfig,
              headers: getHeaders(appUrl)
            });
            
            const $dl = cheerio.load(dlData);
            let finalLink = $dl('#download-link').attr('href') ||
                          $dl('a.button[href*=".apk"]').attr('href') ||
                          $dl('[data-link]').attr('data-link');
            
            if (!finalLink) {
              // Buscar en onclick o data attributes
              const clickLink = $dl('a[onclick*="window.location"]').attr('onclick');
              if (clickLink) {
                const match = clickLink.match(/'([^']+\.apk[^']*)'/);
                if (match) finalLink = match[1];
              }
            }
            
            if (finalLink) {
              const version = $app('.version').text().trim() || 'Última versión';
              const size = $app('.spec-item:contains("Size")').find('span').text().trim() || 'Desconocido';
              const packageName = $app('.spec-item:contains("Package")').find('span').text().trim() || 'Desconocido';
              
              let response = `📱 *APK Encontrado (APKCombo)*\n\n*Nombre:* ${appName}\n*Paquete:* ${packageName}\n*Versión:* ${version}\n*Tamaño:* ${size}`;
              
              await conn.sendMessage(m.chat, {
                image: {url: appIcon || 'https://i.imgur.com/s9F2AG5.png'}, 
                caption: response
              }, {quoted: m});
              
              if (size.includes('GB') || (size.includes('MB') && parseInt(size.replace(/[^0-9]/g, '')) > 999)) {
                return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
              }
              
              const directLink = finalLink.startsWith('http') ? finalLink : `https://apkcombo.com${finalLink}`;
              
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
    }
  } catch (error) {
    console.log('APKCombo falló:', error.message);
  }

  // Opción 3: APKPure (versión alternativa)
  try {
    const searchUrl = `https://apkpure.net/search?q=${encodeURIComponent(text)}`;
    
    const { data, status } = await axios.get(searchUrl, {
      ...axiosConfig,
      headers: getHeaders()
    });
    
    if (status === 200) {
      const $ = cheerio.load(data);
      const firstResult = $('.search-item').first();
      
      if (firstResult.length > 0) {
        const appLink = firstResult.find('a').attr('href');
        const appName = firstResult.find('.p1').text().trim();
        const appIcon = firstResult.find('img').attr('src');
        
        if (appLink) {
          const appUrl = appLink.startsWith('http') ? appLink : `https://apkpure.net${appLink}`;
          
          const { data: appData } = await axios.get(appUrl + '/download', {
            ...axiosConfig,
            headers: getHeaders(searchUrl)
          });
          
          const $app = cheerio.load(appData);
          const downloadLink = $app('.download-btn').attr('href') ||
                              $app('a[href*=".apk"]').first().attr('href') ||
                              $app('[data-dt-url]').attr('data-dt-url');
          
          if (downloadLink) {
            const version = $app('.version').text().trim() || 'Última versión';
            const size = $app('.size').text().trim() || 'Desconocido';
            
            let response = `📱 *APK Encontrado (APKPure)*\n\n*Nombre:* ${appName}\n*Versión:* ${version}\n*Tamaño:* ${size}`;
            
            await conn.sendMessage(m.chat, {
              image: {url: appIcon || 'https://i.imgur.com/s9F2AG5.png'}, 
              caption: response
            }, {quoted: m});
            
            if (size.includes('GB') || (size.includes('MB') && parseInt(size.replace(/[^0-9]/g, '')) > 999)) {
              return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
            }
            
            const finalLink = downloadLink.startsWith('http') ? downloadLink : `https://apkpure.net${downloadLink}`;
            
            await conn.sendMessage(m.chat, {
              document: {url: finalLink}, 
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

  // Opción 4: Uptodown (versión mejorada)
  try {
    const searchUrl = `https://en.uptodown.com/android/search/${encodeURIComponent(text)}`;
    
    const { data, status } = await axios.get(searchUrl, {
      ...axiosConfig,
      headers: getHeaders()
    });
    
    if (status === 200) {
      const $ = cheerio.load(data);
      const firstResult = $('article.item').first();
      
      if (firstResult.length > 0) {
        const appLink = firstResult.find('a.detail').attr('href');
        const appName = firstResult.find('.name').text().trim();
        const appIcon = firstResult.find('img').attr('src');
        
        if (appLink) {
          const appUrl = appLink.startsWith('http') ? appLink : `https://en.uptodown.com${appLink}`;
          
          // Uptodown requiere ir a /download
          const { data: appData } = await axios.get(appUrl + '/download', {
            ...axiosConfig,
            headers: getHeaders(searchUrl)
          });
          
          const $app = cheerio.load(appData);
          let downloadLink = $app('[data-url]').attr('data-url') ||
                            $app('button[data-url]').attr('data-url') ||
                            $app('#detail-download-button').attr('data-url');
          
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
    }
  } catch (error) {
    console.log('Uptodown falló:', error.message);
  }

  // Opción 5: APKFab
  try {
    const searchUrl = `https://apkfab.com/search?q=${encodeURIComponent(text)}`;
    
    const { data, status } = await axios.get(searchUrl, {
      ...axiosConfig,
      headers: getHeaders()
    });
    
    if (status === 200) {
      const $ = cheerio.load(data);
      const firstResult = $('.app-item').first();
      
      if (firstResult.length > 0) {
        const appLink = firstResult.find('a').attr('href');
        const appName = firstResult.find('.title').text().trim();
        const appIcon = firstResult.find('img').attr('src');
        
        if (appLink) {
          const appUrl = appLink.startsWith('http') ? appLink : `https://apkfab.com${appLink}`;
          
          const { data: appData } = await axios.get(appUrl, {
            ...axiosConfig,
            headers: getHeaders(searchUrl)
          });
          
          const $app = cheerio.load(appData);
          const downloadBtn = $app('.download-btn').attr('href') ||
                             $app('a[href*="download"]').first().attr('href');
          
          if (downloadBtn) {
            const dlUrl = downloadBtn.startsWith('http') ? downloadBtn : `https://apkfab.com${downloadBtn}`;
            
            const { data: dlData } = await axios.get(dlUrl, {
              ...axiosConfig,
              headers: getHeaders(appUrl)
            });
            
            const $dl = cheerio.load(dlData);
            const finalLink = $dl('a.btn-download').attr('href') ||
                            $dl('[data-link]').attr('data-link');
            
            if (finalLink) {
              const version = $app('.version').text().trim() || 'Última versión';
              const size = $app('.size').text().trim() || 'Desconocido';
              
              let response = `📱 *APK Encontrado (APKFab)*\n\n*Nombre:* ${appName}\n*Versión:* ${version}\n*Tamaño:* ${size}`;
              
              await conn.sendMessage(m.chat, {
                image: {url: appIcon || 'https://i.imgur.com/s9F2AG5.png'}, 
                caption: response
              }, {quoted: m});
              
              if (size.includes('GB') || (size.includes('MB') && parseInt(size.replace(/[^0-9]/g, '')) > 999)) {
                return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
              }
              
              const directLink = finalLink.startsWith('http') ? finalLink : `https://apkfab.com${finalLink}`;
              
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
    }
  } catch (error) {
    console.log('APKFab falló:', error.message);
  }

  throw `${tradutor.texto4}`;
};

handler.help = ['apk'];
handler.tags = ['search'];
handler.command = /^(apk|apkmod|modapk|dapk2|aptoide|aptoidedl)$/i;

export default handler;
