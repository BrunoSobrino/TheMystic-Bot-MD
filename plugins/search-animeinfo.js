import axios from 'axios';
import { translate } from '@vitalets/google-translate-api';
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
    // Consulta limpia sin espacios especiales (Evita el Error 400)
    const query = `query($search:String){Media(search:$search,type:ANIME){id title{romaji english native}studios(isMain:true){nodes{name}}seasonYear episodes genres duration format season status description bannerImage coverImage{extraLarge large}}}`;

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
    if (!result) throw 'No se encontraron resultados';

    // Limpieza de etiquetas HTML en la descripción
    const cleanDesc = result.description ? result.description.replace(/<\/?[^>]+(>|$)/g, "") : 'No disponible';
    
    // Traducción segura de la sinopsis
    const safeTranslate = async (txt) => {
      try {
        const res = await translate(txt, { to: 'es' });
        return res.text;
      } catch { return txt; }
    };

    const sinopsisTranslate = await safeTranslate(cleanDesc);
    
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
    const estado = estadosRespaldo[result.status] || result.status;

    let AnimeInfo = `✨ *ANIME INFO* ✨\n\n`
    AnimeInfo += `*㊙️ ❘ Título:* ${titulo}\n`
    AnimeInfo += `*🏦 ❘ Estudio/s:* ${estudios}\n`
    AnimeInfo += `*📆 ❘ Año:* ${result.seasonYear || 'N/A'}\n`
    AnimeInfo += `*🗂 ❘ Episodios:* ${result.episodes || 'En emisión'}\n`
    AnimeInfo += `*🎧 ❘ Audio:* Japonés\n`
    AnimeInfo += `*💬 ❘ Subtitulos:* Español\n`
    AnimeInfo += `*🏷 ❘ Género:* ${generos}\n`
    AnimeInfo += `*⏱ ❘ Duración:* ${result.duration ? result.duration + ' min' : 'N/A'}\n`
    AnimeInfo += `*💽 ❘ Formato:* ${result.format || 'N/A'}\n`
    AnimeInfo += `*🔅 ❘ Temporada:* ${result.season || 'N/A'}\n`
    AnimeInfo += `*⏳ ❘ Estado:* ${estado}\n\n`
    AnimeInfo += `*📜 ❘ Sinopsis:*\n`
    AnimeInfo += `> ${sinopsisTranslate}`

    const imageHD = result.coverImage.extraLarge || result.coverImage.large || result.bannerImage;

    await conn.sendMessage(m.chat, { 
      image: { url: imageHD }, 
      caption: AnimeInfo.trim() 
    }, { quoted: m });

  } catch (e) {
    // Log detallado en la terminal para depuración
    console.log(`\n==== [ERROR ANIME REPORT] ====`);
    if (e.response) {
      console.log('Status:', e.response.status);
      console.log('Data:', JSON.stringify(e.response.data, null, 2));
    } else {
      console.error(e);
    }
    console.log(`==============================\n`);

    m.reply(`*${tradutor.texto3}*`);
  }
};

handler.help = ['anime <nombre>'];
handler.tags = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
      
