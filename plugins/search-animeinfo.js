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

    // --- TRADUCCIONES ---
    const estados = { 'FINISHED': 'Finalizado', 'RELEASING': 'En emisión', 'NOT_YET_RELEASED': 'Próximamente', 'CANCELLED': 'Cancelado', 'HIATUS': 'En pausa' };
    const temporadas = { 'WINTER': 'Invierno', 'SPRING': 'Primavera', 'SUMMER': 'Verano', 'FALL': 'Otoño' };
    const formatos = { 'TV': 'Serie de TV', 'MOVIE': 'Película', 'SPECIAL': 'Especial', 'OVA': 'OVA', 'ONA': 'ONA', 'MUSIC': 'Musical' };
    const generosTrad = { 'Action': 'Acción', 'Adventure': 'Aventura', 'Comedy': 'Comedia', 'Drama': 'Drama', 'Fantasy': 'Fantasía', 'Horror': 'Terror', 'Mystery': 'Misterio', 'Psychological': 'Psicológico', 'Romance': 'Romance', 'Sci-Fi': 'C. Ficción', 'Slice of Life': 'Recuentos', 'Sports': 'Deportes', 'Supernatural': 'Sobrenatural', 'Thriller': 'Suspenso' };

    const cleanDesc = result.description ? result.description.replace(/<\/?[^>]+(>|$)/g, "").trim() : 'No disponible';
    let sinopsisEsp;
    try {
      const resTrans = await translate(cleanDesc, { to: 'es' });
      sinopsisEsp = resTrans.text;
    } catch { sinopsisEsp = cleanDesc; }

    const titulo = result.title.romaji || result.title.english || result.title.native;
    const estudio = result.studios.nodes[0]?.name || 'Desconocido';
    const generosEsp = result.genres.map(g => generosTrad[g] || g).join(', ');
    const puntaje = result.averageScore ? `${result.averageScore}%` : 'N/A';

    // --- DISEÑO DE IMAGEN (CON PROTECCIÓN ANTI-BLOQUEO) ---
    let buffer;
    try {
      const coverUrl = result.coverImage.extraLarge || result.coverImage.large;
      const bannerUrl = result.bannerImage || coverUrl; // Si no hay banner, usamos la misma portada de fondo

      // Cargamos imágenes con timeout para no quedar trabados
      const [cover, banner] = await Promise.all([
        Jimp.read({ url: coverUrl }).catch(() => null),
        Jimp.read({ url: bannerUrl }).catch(() => null)
      ]);

      if (cover) {
        const finalImg = new Jimp(1000, 450, 0x1A1A1AFF); // Fondo gris oscuro sólido (no depende de Imgur)
        
        if (banner) {
          banner.resize(Jimp.AUTO, 450).opacity(0.4);
          finalImg.composite(banner, 0, 0);
        }

        cover.resize(Jimp.AUTO, 450);
        finalImg.composite(cover, 1000 - cover.bitmap.width, 0);

        const font64 = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE).catch(() => null);
        const font32 = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).catch(() => null);

        if (font64) finalImg.print(font64, 40, 150, titulo.slice(0, 25), 600);
        if (font32) finalImg.print(font32, 40, 250, `⭐ Puntaje: ${puntaje}`);

        buffer = await finalImg.getBufferAsync(Jimp.MIME_PNG);
      }
    } catch (imgErr) {
      console.error('Fallo Jimp:', imgErr);
      buffer = result.coverImage.extraLarge || result.coverImage.large; // Fallback a imagen normal
    }

    // --- MENSAJE FINAL ---
    let txt = `✨ *INFORMACIÓN DE ANIME* ✨\n\n`
    txt += `*㊙️ ❘ Título:* ${titulo}\n`
    txt += `*🏦 ❘ Estudio:* ${estudio}\n`
    txt += `*📆 ❘ Año:* ${result.seasonYear || 'N/A'}\n`
    txt += `*🗂 ❘ Episodios:* ${result.episodes || 'En emisión'}\n`
    txt += `*🏷 ❘ Géneros:* ${generosEsp}\n`
    txt += `*💽 ❘ Formato:* ${formatos[result.format] || result.format}\n`
    txt += `*⏳ ❘ Estado:* ${estados[result.status] || result.status}\n\n`
    txt += `*📜 ❘ Sinopsis:*\n> ${sinopsisEsp}`;

    await conn.sendMessage(m.chat, { image: buffer?.constructor === Buffer ? buffer : { url: buffer }, caption: txt.trim() }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply(`*${tradutor.texto3}*`);
  }
};

handler.help = ['anime <nombre>'];
handler.tags = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
      
