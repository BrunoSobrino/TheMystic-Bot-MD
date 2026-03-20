import fetch from 'node-fetch';
import axios from 'axios';
import fs from 'fs';

const handler = async (m, {conn, usedPrefix: prefix, command, text}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_modapk;

  if (!text) throw `${tradutor.texto1}`;
  
  await conn.sendMessage(m.chat, {text: '🔍 Buscando APK...'}, {quoted: m});
  
  // API 1: BK9 API
  try {
    const api1 = `https://api.bk9.site/api/apk/download?id=${encodeURIComponent(text)}`;
    const res1 = await fetch(api1);
    const contentType = res1.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data1 = await res1.json();
      
      if (data1.BK9 && data1.BK9.dllink) {
        const result = data1.BK9;
        
        let response = `${tradutor.texto2[0]} ${result.name}\n${tradutor.texto2[1]} ${result.package}\n${tradutor.texto2[2]} ${result.lastup}\n${tradutor.texto2[3]} ${result.size}`;
        
        await conn.sendMessage(m.chat, {
          image: {url: result.icon}, 
          caption: response
        }, {quoted: m});
        
        if (result.size.includes('GB') || (result.size.includes('MB') && parseInt(result.size.replace(' MB', '')) > 999)) {
          return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
        }
        
        return await conn.sendMessage(m.chat, {
          document: {url: result.dllink}, 
          mimetype: 'application/vnd.android.package-archive', 
          fileName: result.name.replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
          caption: null
        }, {quoted: m});
      }
    }
  } catch (e) {
    console.log('API 1 falló:', e.message);
  }
  
  // API 2: itzpire API
  try {
    const api2 = `https://api.itzpire.com/download/apk?query=${encodeURIComponent(text)}`;
    const res2 = await fetch(api2);
    const contentType = res2.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data2 = await res2.json();
      
      if (data2.status === 'success' && data2.data) {
        const result = data2.data;
        
        let response = `${tradutor.texto2[0]} ${result.name}\n${tradutor.texto2[1]} ${result.package}\n${tradutor.texto2[2]} ${result.version}\n${tradutor.texto2[3]} ${result.size}`;
        
        await conn.sendMessage(m.chat, {
          image: {url: result.icon}, 
          caption: response
        }, {quoted: m});
        
        if (result.size.includes('GB') || (result.size.includes('MB') && parseInt(result.size.replace(' MB', '')) > 999)) {
          return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
        }
        
        return await conn.sendMessage(m.chat, {
          document: {url: result.dllink}, 
          mimetype: 'application/vnd.android.package-archive', 
          fileName: result.name.replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
          caption: null
        }, {quoted: m});
      }
    }
  } catch (e) {
    console.log('API 2 falló:', e.message);
  }
  
  // API 3: Vihangayt API
  try {
    const api3 = `https://vihangayt.me/download/apk?id=${encodeURIComponent(text)}`;
    const res3 = await fetch(api3);
    const contentType = res3.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data3 = await res3.json();
      
      if (data3.status && data3.data) {
        const result = data3.data;
        
        let response = `${tradutor.texto2[0]} ${result.name}\n${tradutor.texto2[1]} ${result.package}\n${tradutor.texto2[2]} ${result.lastup || result.version}\n${tradutor.texto2[3]} ${result.size}`;
        
        await conn.sendMessage(m.chat, {
          image: {url: result.icon}, 
          caption: response
        }, {quoted: m});
        
        if (result.size.includes('GB') || (result.size.includes('MB') && parseInt(result.size.replace(' MB', '')) > 999)) {
          return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
        }
        
        return await conn.sendMessage(m.chat, {
          document: {url: result.dllink || result.download}, 
          mimetype: 'application/vnd.android.package-archive', 
          fileName: result.name.replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
          caption: null
        }, {quoted: m});
      }
    }
  } catch (e) {
    console.log('API 3 falló:', e.message);
  }
  
  // API 4: Widipe API
  try {
    const api4 = `https://widipe.com/download/apk?text=${encodeURIComponent(text)}`;
    const res4 = await fetch(api4);
    const contentType = res4.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data4 = await res4.json();
      
      if (data4.result) {
        const result = data4.result;
        
        let response = `${tradutor.texto2[0]} ${result.name}\n${tradutor.texto2[1]} ${result.package}\n${tradutor.texto2[2]} ${result.lastup || result.version}\n${tradutor.texto2[3]} ${result.size}`;
        
        await conn.sendMessage(m.chat, {
          image: {url: result.icon}, 
          caption: response
        }, {quoted: m});
        
        if (result.size.includes('GB') || (result.size.includes('MB') && parseInt(result.size.replace(' MB', '')) > 999)) {
          return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
        }
        
        return await conn.sendMessage(m.chat, {
          document: {url: result.dllink || result.link}, 
          mimetype: 'application/vnd.android.package-archive', 
          fileName: result.name.replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
          caption: null
        }, {quoted: m});
      }
    }
  } catch (e) {
    console.log('API 4 falló:', e.message);
  }
  
  // API 5: REST API Final
  try {
    const api5 = `https://rest-api.akuari.my.id/downloader/apk?query=${encodeURIComponent(text)}`;
    const res5 = await fetch(api5, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const contentType = res5.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data5 = await res5.json();
      
      if (data5.respon) {
        const result = data5.respon;
        
        let response = `${tradutor.texto2[0]} ${result.name}\n${tradutor.texto2[1]} ${result.package}\n${tradutor.texto2[2]} ${result.lastup}\n${tradutor.texto2[3]} ${result.size}`;
        
        await conn.sendMessage(m.chat, {
          image: {url: result.icon}, 
          caption: response
        }, {quoted: m});
        
        if (result.size.includes('GB') || (result.size.includes('MB') && parseInt(result.size.replace(' MB', '')) > 999)) {
          return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
        }
        
        return await conn.sendMessage(m.chat, {
          document: {url: result.dllink}, 
          mimetype: 'application/vnd.android.package-archive', 
          fileName: result.name.replace(/[^a-zA-Z0-9]/g, '_') + '.apk', 
          caption: null
        }, {quoted: m});
      }
    }
  } catch (e) {
    console.log('API 5 falló:', e.message);
  }
  
  // Si todas las APIs fallan
  throw `${tradutor.texto4}`;
};

handler.help = ['apk'];
handler.tags = ['search'];
handler.command = /^(apk|apkmod|modapk|dapk2|aptoide|aptoidedl)$/i;

export default handler;
                          
