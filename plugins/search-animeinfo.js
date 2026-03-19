import axios from 'axios';
import pkg from '@vitalets/google-translate-api';
const { translate } = pkg;
import fs from 'fs';
import Jimp from 'jimp';

const handler = async (m, { conn, text }) => {
  const datas = global;
  const idioma = datas.db?.data?.users?.[m.sender]?.language || global.defaultLenguaje || 'es';
  
  let tradutor;
  try {
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
    tradutor = _translate.plugins.buscador_animeinfo;
  } catch {
    tradutor = { texto1: 'Ingresa el nombre de un anime.', texto3: '[❗] ERROR' };
  }

  if (!text) return m.reply(`*${tradutor.texto1}*`);

  try {
    const query = `query ($search: String) { Media (search: $search, type: ANIME) { id title { romaji english native } studios(isMain: true) { nodes { name } } seasonYear episodes genres duration format season status description bannerImage coverImage { extraLarge large } averageScore } }`;

    const response = await axios({
      url: 'https://graphql.anilist.co',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      data: { query, variables: { search: text } }
    });

    const result = response.data.data.Media;
    if (!result) return m.reply(`*${tradutor.texto3}*`);

    // --- DICCIONARIOS DE TRADUCCIÓN ---
    const estados = { 'FINISHED': 'Finalizado', 'RELEASING': 'En emisión', 'NOT_YET_RELEASED': 'Próximamente', 'CANCELLED': 'Cancelado', 'HIATUS': 'En pausa' };
    const temporadas = { 'WINTER': 'Invierno', 'SPRING': 'Primavera', 'SUMMER': 'Verano', 'FALL': 'Otoño' };
    const formatos = { 'TV': 'Serie de TV', 'MOVIE': 'Película', 'SPECIAL': 'Especial', 'OVA': 'OVA', 'ONA': 'ONA', 'MUSIC': 'Musical' };
    const generosTraduccion = { 'Action': 'Acción', 'Adventure': 'Aventura', 'Comedy': 'Comedia', 'Drama': 'Drama', 'Ecchi': 'Ecchi', 'Fantasy': 'Fantasía', 'Horror': 'Terror', 'Mystery': 'Misterio', 'Psychological': 'Psicológico', 'Romance': 'Romance', 'Sci-Fi': 'C. Ficción', 'Slice of Life': 'Recuentos', 'Sports': 'Deportes', 'Supernatural': 'Sobrenatural', 'Thriller': 'Suspenso' };

    // --- PROCESO DE TEXTO Y TRADUCCIÓN ---
    const cleanDesc = result.description ? result.description.replace(/<\/?[^>]+(>|$)/g, "").trim() : 'No disponible';
    let sinopsisEsp;
    try {
      const resTrans = await translate(cleanDesc, { to: 'es' });
      sinopsisEsp = resTrans.text;
    } catch {
      sinopsisEsp = cleanDesc;
    }

    const titulo = result.title.romaji || result.title.english || result.title.native;
    const estudio = result.studios.nodes[0]?.name || 'Desconocido';
    const generosEsp = result.genres.map(g => generosTraduccion[g] || g).join(', ');
    const puntaje = result.averageScore ? `${result.averageScore}%` : 'N/A';

    // --- GENERACIÓN DE IMAGEN ESTILO BANNER ---
    const coverUrl = result.coverImage.extraLarge || result.coverImage.large;
    const bannerUrl = result.bannerImage || 'https://i.imgur.com/G5Z5f5y.png';

    const [cover, banner] = await Promise.all([
      Jimp.read(coverUrl).catch(() => Jimp.read('https://i.imgur.com/G5Z5f5y.png')),
      Jimp.read(bannerUrl).catch(() => Jimp.read('https://i.imgur.com/G5Z5f5y.png'))
    ]);

    const finalImg = new Jimp(1000, 450, 0x000000FF);
    banner.resize(Jimp.AUTO, 450);
    finalImg.composite(banner, 0, 0);

    cover.resize(Jimp.AUTO, 450);
    finalImg.composite(cover, 1000 - cover.bitmap.width, 0);

    // Escribir datos básicos en la imagen (Título y Puntaje)
    const fontTitle = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    const fontData = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    finalImg.print(fontTitle, 50, 150, { text: titulo.slice(0, 30), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT }, 600);
    finalImg.print(fontData, 50, 250, `⭐ ${puntaje}`);

    const buffer = await finalImg.getBufferAsync(Jimp.MIME_PNG);

    // --- CONSTRUCCIÓN DEL MENSAJE DE TEXTO ---
    let AnimeInfo = `✨ *INFORMACIÓN DE ANIME* ✨\n\n`
    AnimeInfo += `*㊙️ ❘ Título:* ${titulo}\n`
    AnimeInfo += `*🏦 ❘ Estudio:* ${estudio}\n`
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

    // Enviamos la imagen generada con el texto completo como pie de foto (Caption)
    await conn.sendMessage(m.chat, { image: buffer, caption: AnimeInfo.trim() }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply(`*${tradutor.texto3}*`);
  }
};

handler.help = ['anime <nombre>'];
handler.tags = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
  
