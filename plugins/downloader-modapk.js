import fs from 'fs';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;

  let tradutor;
  try {
    const rawData = fs.readFileSync(`./src/languages/${idioma}.json`, 'utf-8');
    const traducciones = JSON.parse(rawData);
    tradutor = traducciones.plugins.downloader_modapk;
  } catch (e) {
    return m.reply('[ ❗ ] Error al cargar las traducciones.');
  }

  if (!text) throw tradutor.texto1;

  const query = text.trim();

  try {
    const response = await fetch(`https://api.stellarwa.xyz/search/apk?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    
    const json = await response.json();
    const data = json.data;

    if (data?.name && data?.dl) {
      const mensaje = `${tradutor.texto2[0]} ${data.name}\n${tradutor.texto2[1]} ${data.lastUpdated}\n${tradutor.texto2[2]} ${data.lastup}\n${tradutor.texto2[3]} ${data.size}`;

      await conn.sendMessage(m.chat, {
        image: { url: data.banner },
        caption: mensaje
      }, { quoted: m });

      await conn.sendMessage(m.chat, {
        document: { url: data.dl },
        fileName: `${data.name}.apk`,
        mimetype: 'application/vnd.android.package-archive',
        caption: 'The Mystic • BrunoSobrino'
      }, { quoted: m });
    } else {
      throw tradutor.texto4;
    }
  } catch (error) {
    await m.reply(`[ ❗ ] *Fail:* ${error.message || error}`);
  }
};

handler.help = ['aptoide', 'apk', 'apkdl'];
handler.tags = ['search'];
handler.command = ['aptoide', 'apk', 'apkdl'];

export default handler;