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
    const query = `query ($search: String) { Media (search: $search, type: ANIME) { id title { romaji english native } studios(isMain: true) { nodes { name } } seasonYear episodes genres duration format season status description bannerImage coverImage { extraLarge large } } }`;

    const response = await axios({
      url: 'https://graphql.anilist.co',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      data: { query, variables: { search: text } }
    });

    const result = response.data.data.Media;
    if (!result) return m.reply(`*${tradutor.texto3}*`);

    // --- DICCIONARIOS ---
    const estados = { 'FINISHED': 'Finalizado', 'RELEASING': 'En emisión', 'NOT_YET_RELEASED': 'Próximamente', 'CANCELLED': 'Cancelado', 'HIATUS': 'En pausa' };
    const temporadas = { 'WINTER': 'Invierno', 'SPRING': 'Primavera', 'SUMMER': 'Verano', 'FALL': 'Otoño' };
    const formatos = { 'TV': 'Serie de TV', 'MOVIE': 'Película', 'SPECIAL': 'Especial', 'OVA': 'OVA', 'ONA': 'ONA', 'MUSIC': 'Musical' };
    const generosTraduccion = { 'Action': 'Acción', 'Adventure': 'Aventura', 'Comedy': 'Comedia', 'Drama': 'Drama', 'Ecchi': 'Ecchi', 'Fantasy': 'Fantasía', 'Horror': 'Terror', 'Mahou Shoujo': 'Magical Girl', 'Mecha': 'Mecha', 'Music': 'Música', 'Mystery': 'Misterio', 'Psychological': 'Psicológico', 'Romance': 'Romance', 'Sci-Fi': 'Ciencia Ficción', 'Slice of Life': 'Recuentos de la vida', 'Sports': 'Deportes', 'Supernatural': 'Sobrenatural', 'Thriller': 'Suspenso' };

    // --- LIMPIEZA Y TRADUCCIÓN ---
    let cleanDesc = result.description ? result.description.replace(/<\/?[^>]+(>|$)/g, "").trim() : 'No disponible';
    
    // Traducción forzada con manejo de error explícito
    let sinopsisEsp = 'Traduciendo...';
    try {
      const resTrans = await translate(cleanDesc, { to: 'es' });
      sinopsisEsp = resTrans.text;
    } catch (err) {
      console.log('Error en traductor primario, intentando secundario...');
      try {
        // Backup: Traductor simple vía MyMemory API (sin necesidad de API Key)
        const backupRes = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanDesc)}&langpair=en|es`);
        sinopsisEsp = backupRes.data.responseData.translatedText;
      } catch {
        sinopsisEsp = cleanDesc; // Si todo falla, queda en inglés
      }
    }
    
    const titulo = result.title.romaji || result.title.english || result.title.native;
    const estudios = result.studios.nodes.map(s => s.name).join(', ') || 'Desconocido';
    const generosEsp = result.genres.map(g => generosTraduccion[g] || g).join(', ');

    let AnimeInfo = `✨ *INFORMACIÓN DE ANIME* ✨\n\n`
    AnimeInfo += `*㊙️ ❘ Título:* ${titulo}\n`
    AnimeInfo += `*🏦 ❘ Estudio:* ${estudios}\n`
    AnimeInfo += `*📆 ❘ Año:* ${result.seasonYear || 'N/A'}\n`
    AnimeInfo += `*🗂 ❘ Episodios:* ${result.episodes || 'En emisión'}\n`
    AnimeInfo += `*🎧 ❘ Audio:* Japonés\n`
    AnimeInfo += `*💬 ❘ Subtítulos:* Español\n`
    AnimeInfo += `*🏷 ❘ Géneros:* ${generosEsp}\n`
    AnimeInfo += `*⏱ ❘ Duración:* ${result.duration ? result.duration + ' min' : 'N/A'}\n`
    AnimeInfo += `*💽 ❘ Formato:* ${formatos[result.format] || result.format}\n`
    AnimeInfo += `*🔅 ❘ Temporada:* ${temporadas[result.season] || 'N/A'}\n`
    AnimeInfo += `*⏳ ❘ Estado:* ${estados[result.status] || result.status}\n\n`
    AnimeInfo += `*📜 ❘ Sinopsis:*\n`
    AnimeInfo += `> ${sinopsisEsp}`

    const imageHD = result.coverImage.extraLarge || result.bannerImage || result.coverImage.large;

    await conn.sendMessage(m.chat, { image: { url: imageHD }, caption: AnimeInfo.trim() }, { quoted: m });

  } catch (e) {
    console.error('Error en comando Anime:', e);
    m.reply(`*${tradutor.texto3}*`);
  }
};

handler.help = ['anime <nombre>'];
handler.tags = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
                                   
