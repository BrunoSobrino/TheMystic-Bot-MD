import fetch from 'node-fetch';
import axios from 'axios';
import fs from 'fs';

const handler = async (m, {conn, usedPrefix: prefix, command, text}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_modapk;

  if (!text) throw `${tradutor.texto1}`;
  
  try {    
    // Usar API pública de APK downloader
    const searchApi = `https://api.lolhuman.xyz/api/apkdownloader?apikey=GataDios&query=${encodeURIComponent(text)}`;
    
    const response = await fetch(searchApi);
    const data = await response.json();
    
    if (!data.status || data.status !== 200) {
      throw new Error('No se encontró la aplicación');
    }
    
    const result = data.result;
    
    let responseText = `${tradutor.texto2[0]} ${result.name || result.title}\n${tradutor.texto2[1]} ${result.package || result.package_name}\n${tradutor.texto2[2]} ${result.lastup || result.updated || result.version}\n${tradutor.texto2[3]} ${result.size}`;
    
    await conn.sendMessage(m.chat, {
      image: {url: result.icon || result.thumbnail}, 
      caption: responseText
    }, {quoted: m});
    
    // Verificar tamaño
    if (result.size.includes('GB') || (result.size.includes('MB') && parseInt(result.size.replace(' MB', '')) > 999)) {
      return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
    }
    
    // Enviar APK
    await conn.sendMessage(m.chat, {
      document: {url: result.link || result.dllink || result.download}, 
      mimetype: 'application/vnd.android.package-archive', 
      fileName: (result.name || result.title).replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
      caption: null
    }, {quoted: m});
    
  } catch (error) {
    console.error('Error:', error);
    
    // Alternativa 2: Usar otra API si la primera falla
    try {
      const altApi = `https://api.akuari.my.id/search/apk?query=${encodeURIComponent(text)}`;
      const altResponse = await fetch(altApi);
      const altData = await altResponse.json();
      
      if (!altData.hasil || altData.hasil.length === 0) {
        throw new Error('No encontrado');
      }
      
      const app = altData.hasil[0];
      
      let responseText = `${tradutor.texto2[0]} ${app.name}\n${tradutor.texto2[1]} ${app.package}\n${tradutor.texto2[2]} ${app.version}\n${tradutor.texto2[3]} ${app.size}`;
      
      await conn.sendMessage(m.chat, {
        image: {url: app.icon}, 
        caption: responseText
      }, {quoted: m});
      
      if (app.size.includes('GB') || (app.size.includes('MB') && parseInt(app.size.replace(' MB', '')) > 999)) {
        return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
      }
      
      await conn.sendMessage(m.chat, {
        document: {url: app.download}, 
        mimetype: 'application/vnd.android.package-archive', 
        fileName: app.name.replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
        caption: null
      }, {quoted: m});
      
    } catch (altError) {
      console.error('Error alternativo:', altError);
      throw `${tradutor.texto4}`;
    }
  }
};

handler.help = ['apk'];
handler.tags = ['search'];
handler.command = /^(apk|apkmod|modapk|dapk2|aptoide|aptoidedl)$/i;

export default handler;
