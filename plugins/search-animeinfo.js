import axios from 'axios';
import { translate } from '@vitalets/google-translate-api';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db?.data?.users?.[m.sender]?.language || global.defaultLenguaje || 'es';
  
  // Traducción de etiquetas (Fallback si no existe el JSON)
  let tradutor;
  try {
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
    tradutor = _translate.plugins.buscador_animeinfo;
  } catch {
    tradutor = { texto1: 'Ingrese el nombre de un anime.', texto3: 'No se encontró el anime.' };
  }

  if (!text) return m.reply(`*${tradutor.texto1}*`);

  try {
    // Usamos la API de Jikan (MyAnimeList) que es gratuita y no requiere GraphQL
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=1`;
    const response = await axios.get(url);
    const res = response.data.data[0];

    if (!res) throw tradutor.texto3;

    // Función para traducir la sinopsis
    const safeTranslate = async (txt) => {
      try {
        const result = await translate(txt, { to: 'es' });
        return result.text;
      } catch { return txt; }
    };

    const sinopsisTranslate = await safeTranslate(res.synopsis || 'Sin descripción.');
    
    // Formatear géneros y estudios
    const generos = res.genres.map(g => g.name).join(', ') || 'N/A';
    const estudios = res.studios.map(s => s.name).join(', ') || 'N/A';
    
    // Traducción de estado
    const statusMap = {
      'Finished Airing': 'Finalizado',
      'Currently Airing': 'En emisión',
      'Not yet aired': 'Próximamente'
    };
    const estado = statusMap[res.status] || res.status;

    let AnimeInfo = `✨ *ANIME INFO (MAL)* ✨\n\n`
    AnimeInfo += `*㊙️ ❘ Título:* ${res.title}\n`
    AnimeInfo += `*🏦 ❘ Estudio/s:* ${estudios}\n`
    AnimeInfo += `*📆 ❘ Año:* ${res.year || res.aired.prop.from.year || 'N/A'}\n`
    AnimeInfo += `*🗂 ❘ Episodios:* ${res.episodes || 'En emisión'}\n`
    AnimeInfo += `*🌟 ❘ Puntaje:* ${res.score || 'N/A'}\n`
    AnimeInfo += `*🏷 ❘ Género:* ${generos}\n`
    AnimeInfo += `*⏱ ❘ Duración:* ${res.duration}\n`
    AnimeInfo += `*💽 ❘ Formato:* ${res.type}\n`
    AnimeInfo += `*⏳ ❘ Estado:* ${estado}\n\n`
    AnimeInfo += `*📜 ❘ Sinopsis:*\n`
    AnimeInfo += `> ${sinopsisTranslate.replace(/\n/g, ' ')}`

    const imagen = res.images.jpg.large_image_url;

    await conn.sendMessage(m.chat, { image: { url: imagen }, caption: AnimeInfo.trim() }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply(`*${tradutor.texto3}*`);
  }
};

handler.help = ['anime <nombre>'];
handler.tags = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
