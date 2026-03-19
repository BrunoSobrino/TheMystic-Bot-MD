import axios from 'axios';
import { translate } from '@vitalets/google-translate-api';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db?.data?.users?.[m.sender]?.language || global.defaultLenguaje || 'es';
  
  // Intentar cargar el archivo de idioma para los mensajes
  let tradutor;
  try {
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
    tradutor = _translate.plugins.buscador_animeinfo;
  } catch {
    // Si falla el archivo, usamos un fallback manual
    tradutor = { texto1: 'Ingrese el nombre de un anime.', texto3: '[❗] ERROR, INTENTELO DE NUEVO' };
  }

  if (!text) return m.reply(`*${tradutor.texto1}*`);

  try {
    const query = `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        id
        title { romaji english native }
        studios(isMain: true) { nodes { name } }
        seasonYear
        episodes
        genres
        duration
        format
        season
        status
        description
        bannerImage
        coverImage { extraLarge large }
      }
    }`;

    const { data } = await axios.post('https://graphql.anilist.co', {
      query,
      variables: { search: text }
    }, { timeout: 10000 }); // 10 segundos de límite

    const result = data.data.Media;
    if (!result) throw 'ANIME_NOT_FOUND';

    const cleanDesc = result.description ? result.description.replace(/<\/?[^>]+(>|$)/g, "") : 'No disponible';
    
    const safeTranslate = async (txt) => {
      try {
        const res = await translate(txt, { to: 'es' });
        return res.text;
      } catch { return txt; }
    };

    const sinopsisTranslate = await safeTranslate(cleanDesc);
    const titulo = result.title.romaji || result.title.english;
    const estudios = result.studios.nodes.map(s => s.name).join(', ') || 'N/A';
    const generos = result.genres.join(', ') || 'N/A';
    
    const estadosRespaldo = {
        'FINISHED': 'Finalizado',
        'RELEASING': 'En emisión',
        'NOT_YET_RELEASED': 'Próximamente',
        'CANCELLED': 'Cancelado',
        'HIATUS': 'En pausa'
    };

    let AnimeInfo = `✨ *ANIME INFO* ✨\n\n`
    AnimeInfo += `*㊙️ ❘ Título:* ${titulo}\n`
    AnimeInfo += `*🏦 ❘ Estudio/s:* ${estudios}\n`
    AnimeInfo += `*📆 ❘ Año:* ${result.seasonYear || 'N/A'}\n`
    AnimeInfo += `*🗂 ❘ Episodios:* ${result.episodes || 'En emisión'}\n`
    AnimeInfo += `*🏷 ❘ Género:* ${generos}\n`
    AnimeInfo += `*⏳ ❘ Estado:* ${estadosRespaldo[result.status] || result.status}\n\n`
    AnimeInfo += `*📜 ❘ Sinopsis:*\n`
    AnimeInfo += `> ${sinopsisTranslate}`

    const imageHD = result.coverImage.extraLarge || result.coverImage.large || result.bannerImage;

    await conn.sendMessage(m.chat, { image: { url: imageHD }, caption: AnimeInfo.trim() }, { quoted: m });

  } catch (e) {
    // --- ESTA PARTE MUESTRA EL ERROR EN LA TERMINAL ---
    console.log(`\n--- [ERROR EN COMANDO ANIME] ---`);
    console.error(e); 
    console.log(`---------------------------------\n`);
    
    // --- ESTA PARTE RESPONDE AL USUARIO ---
    m.reply(`*${tradutor.texto3}*`);
  }
};

handler.help = ['anime <nombre>'];
handler.tags = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
