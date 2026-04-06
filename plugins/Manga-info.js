import axios from 'axios';
import translate from '@vitalets/google-translate-api';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  // Si tienes un apartado específico en tu JSON para manga, cámbialo aquí. 
  // De lo contrario, puedes seguir usando el de anime si los textos de error son genéricos.
  const tradutor = _translate.plugins.buscador_animeinfo; 

  if (!text) return m.reply(`*${tradutor.texto1}*\nEjemplo: ${usedPrefix + command} Solo Leveling`);

  try {
    // Cambiamos type: ANIME a type: MANGA
    // Reemplazamos episodes, seasonYear, duration por chapters y volumes
    const query = `
    query ($search: String) {
      Media (search: $search, type: MANGA) {
        id
        title { romaji english native }
        chapters
        volumes
        genres
        format
        status
        description
        bannerImage
        coverImage { 
          extraLarge
          large
        }
      }
    }`;

    const { data } = await axios.post('https://graphql.anilist.co', {
      query,
      variables: { search: text }
    });

    const result = data.data.Media;
    if (!result) throw tradutor.texto3;

    const cleanDesc = result.description ? result.description.replace(/<br>|<i>|<\/i>|<b>|<\/b>/g, '') : 'No disponible';
    const safeTranslate = async (txt) => {
      try {
        const res = await translate(txt, { to: 'es', autoCorrect: true });
        return res.text;
      } catch { return txt; }
    };

    const sinopsisTranslate = await safeTranslate(cleanDesc);
    
    const titulo = result.title.romaji || result.title.english || result.title.native;
    const generos = result.genres.join(', ') || 'N/A';
    
    const estadosRespaldo = {
        'FINISHED': 'Finalizado',
        'RELEASING': 'En publicación',
        'NOT_YET_RELEASED': 'Próximamente',
        'CANCELLED': 'Cancelado',
        'HIATUS': 'En pausa'
    };
    const estado = estadosRespaldo[result.status] || result.status;

    // DISEÑO ACTUALIZADO PARA LECTURA
    let MangaInfo = `✨ *INFO DE LECTURA* ✨\n\n`
    MangaInfo += `*㊙️ ❘ Título:* ${titulo}\n`
    MangaInfo += `*📚 ❘ Capítulos:* ${result.chapters || 'En publicación'}\n`
    MangaInfo += `*📓 ❘ Volúmenes:* ${result.volumes || 'N/A'}\n`
    MangaInfo += `*🏷 ❘ Género:* *${generos}*\n`
    MangaInfo += `*💽 ❘ Formato:* ${result.format || 'N/A'}\n`
    MangaInfo += `*⏳ ❘ Estado:* ${estado}\n\n`
    MangaInfo += `*📜 ❘ Sinopsis:*\n`
    MangaInfo += `> ${sinopsisTranslate}`

    const imageHD = result.coverImage.extraLarge || result.bannerImage || result.coverImage.large;

    await conn.sendFile(m.chat, imageHD, 'manga_hd.jpg', MangaInfo.trim(), m);

  } catch (e) {
    console.error(e);
    m.reply(`*${tradutor.texto3}*`);
  }
};

handler.help = ['manga <nombre>'];
handler.tags = ['buscadores'];
// Cambiamos el comando para que reaccione a manga, manhwa, novela
handler.command = /^(manga|mangainfo|manhwa|novela)$/i;

export default handler;
  
