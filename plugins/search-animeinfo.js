import axios from 'axios';
import pkg from '@vitalets/google-translate-api';
const { translate } = pkg;
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db?.data?.users?.[m.sender]?.language || global.defaultLenguaje || 'es';
  
  let tradutor;
  try {
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
    tradutor = _translate.plugins.buscador_animeinfo;
  } catch {
    tradutor = { 
      texto1: 'Ingrese el nombre de un anime para buscar.', 
      texto3: '[❗] ERROR, INTENTELO DE NUEVO' 
    };
  }

  if (!text) return m.reply(`*${tradutor.texto1}*`);

  try {
    // Consulta optimizada para AniList (GraphQL)
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
        coverImage { extraLarge large medium }
      }
    }`;

    const response = await axios({
      url: 'https://graphql.anilist.co',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: {
        query: query,
        variables: { search: text }
      }
    });

    const result = response.data.data.Media;
    if (!result) return m.reply(`*${tradutor.texto3}*`);

    // Limpieza profunda de HTML para evitar texto sucio en WhatsApp
    const cleanDesc = result.description ? result.description.replace(/<\/?[^>]+(>|$)/g, "") : 'No disponible';
    
    // Traducción automática de la Sinopsis
    const safeTranslate = async (txt) => {
      try {
        const res = await translate(txt, { to: 'es' });
        return res.text;
      } catch { return txt; }
    };

    const sinopsisTranslate = await safeTranslate(cleanDesc);
    
    // Formateo de datos
    const titulo = result.title.romaji || result.title.english || result.title.native;
    const estudios = result.studios.nodes.map(s => s.name).join(', ') || 'N/A';
    const generos = result.genres.join(', ') || 'N/A';
    
    const estadosRespaldo = {
      'FINISHED': 'Finalizado',
      'RELEASING': 'En emisión',
      'NOT_YET_RELEASED': 'Próximamente',
      'CANCELLED': 'Cancelado',
      'HIATUS': 'En pausa'
    };

    let AnimeInfo = `✨ *ANIME INFO (AniList)* ✨\n\n`
    AnimeInfo += `*㊙️ ❘ Título:* ${titulo}\n`
    AnimeInfo += `*🏦 ❘ Estudio/s:* ${estudios}\n`
    AnimeInfo += `*📆 ❘ Año:* ${result.seasonYear || 'N/A'}\n`
    AnimeInfo += `*🗂 ❘ Episodios:* ${result.episodes || 'En emisión'}\n`
    AnimeInfo += `*🏷 ❘ Género:* ${generos}\n`
    AnimeInfo += `*⏱ ❘ Duración:* ${result.duration ? result.duration + ' min' : 'N/A'}\n`
    AnimeInfo += `*💽 ❘ Formato:* ${result.format || 'N/A'}\n`
    AnimeInfo += `*⏳ ❘ Estado:* ${estadosRespaldo[result.status] || result.status}\n\n`
    AnimeInfo += `*📜 ❘ Sinopsis:*\n`
    AnimeInfo += `> ${sinopsisTranslate.trim()}`

    // Selección de la mejor imagen disponible
    const imageHD = result.coverImage.extraLarge || result.bannerImage || result.coverImage.large;

    await conn.sendMessage(m.chat, { 
      image: { url: imageHD }, 
      caption: AnimeInfo.trim() 
    }, { quoted: m });

  } catch (e) {
    // Registro detallado en consola si algo falla
    console.log(`\n==== [ANILIST ERROR] ====`);
    if (e.response && e.response.data) {
      console.log(JSON.stringify(e.response.data, null, 2));
    } else {
      console.error(e);
    }
    console.log(`=========================\n`);

    m.reply(`*${tradutor.texto3}*`);
  }
};

handler.help = ['anime <nombre>'];
handler.tags = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
