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
      texto1: 'Por favor, ingresa el nombre de un anime.', 
      texto3: '[❗] OCURRIÓ UN ERROR, INTÉNTALO DE NUEVO' 
    };
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

    // Traducciones de términos técnicos de AniList
    const estados = {
      'FINISHED': 'Finalizado',
      'RELEASING': 'En emisión',
      'NOT_YET_RELEASED': 'Próximamente',
      'CANCELLED': 'Cancelado',
      'HIATUS': 'En pausa'
    };

    const temporadas = {
      'WINTER': 'Invierno',
      'SPRING': 'Primavera',
      'SUMMER': 'Verano',
      'FALL': 'Otoño'
    };

    const formatos = {
      'TV': 'Serie de TV',
      'TV_SHORT': 'Corto de TV',
      'MOVIE': 'Película',
      'SPECIAL': 'Especial',
      'OVA': 'OVA',
      'ONA': 'ONA',
      'MUSIC': 'Musical'
    };

    // Limpieza y Traducción de la Sinopsis
    const cleanDesc = result.description ? result.description.replace(/<\/?[^>]+(>|$)/g, "") : 'No disponible';
    const safeTranslate = async (txt) => {
      try {
        const res = await translate(txt, { to: 'es' });
        return res.text;
      } catch { return txt; }
    };

    const sinopsisTranslate = await safeTranslate(cleanDesc);
    
    // Preparación de datos
    const titulo = result.title.romaji || result.title.english || result.title.native;
    const estudios = result.studios.nodes.map(s => s.name).join(', ') || 'Desconocido';
    const generos = result.genres.join(', ') || 'N/A';
    const estadoEsp = estados[result.status] || result.status;
    const temporadaEsp = temporadas[result.season] || 'N/A';
    const formatoEsp = formatos[result.format] || result.format;

    // Diseño final totalmente en español
    let AnimeInfo = `✨ *INFORMACIÓN DE ANIME* ✨\n\n`
    AnimeInfo += `*㊙️ ❘ Título:* ${titulo}\n`
    AnimeInfo += `*🏦 ❘ Estudio:* ${estudios}\n`
    AnimeInfo += `*📆 ❘ Año:* ${result.seasonYear || 'N/A'}\n`
    AnimeInfo += `*🗂 ❘ Episodios:* ${result.episodes || 'En emisión'}\n`
    AnimeInfo += `*🎧 ❘ Audio:* Japonés\n`
    AnimeInfo += `*💬 ❘ Subtítulos:* Español\n`
    AnimeInfo += `*🏷 ❘ Géneros:* ${generos}\n`
    AnimeInfo += `*⏱ ❘ Duración:* ${result.duration ? result.duration + ' min' : 'N/A'}\n`
    AnimeInfo += `*💽 ❘ Formato:* ${formatoEsp}\n`
    AnimeInfo += `*🔅 ❘ Temporada:* ${temporadaEsp}\n`
    AnimeInfo += `*⏳ ❘ Estado:* ${estadoEsp}\n\n`
    AnimeInfo += `*📜 ❘ Sinopsis:*\n`
    AnimeInfo += `> ${sinopsisTranslate.trim()}`

    const imageHD = result.coverImage.extraLarge || result.bannerImage || result.coverImage.large;

    await conn.sendMessage(m.chat, { 
      image: { url: imageHD }, 
      caption: AnimeInfo.trim() 
    }, { quoted: m });

  } catch (e) {
    console.log(`\n==== [ERROR EN ANIME] ====`);
    console.error(e);
    console.log(`==========================\n`);
    m.reply(`*${tradutor.texto3}*`);
  }
};

handler.help = ['anime <nombre>'];
handler.tags = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
      
