import axios from 'axios';
import translate from '@vitalets/google-translate-api';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import path from 'path';

/**
 * Descarga un buffer de imagen desde una URL.
 * Prueba múltiples fuentes en orden de calidad.
 */
const fetchImageBuffer = async (urls = []) => {
  for (const url of urls.filter(Boolean)) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10_000,
        headers: {
          // Algunos CDNs devuelven mayor resolución con este header
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      return Buffer.from(response.data);
    } catch {
      continue; // Intentar con la siguiente URL
    }
  }
  return null;
};

/**
 * Optimiza el buffer de imagen para máxima calidad HD:
 * - Convierte a JPEG con calidad 100
 * - Escala a mínimo 1920px de ancho si la imagen es pequeña
 * - Mantiene el ratio original sin distorsión
 */
const optimizeToHD = async (buffer) => {
  if (!buffer) return null;
  try {
    const image = sharp(buffer);
    const meta = await image.metadata();

    const targetWidth = Math.max(meta.width || 0, 1920);

    return await image
      .resize({
        width: targetWidth,
        withoutEnlargement: false, // Permite upscale para garantizar HD
        kernel: sharp.kernel.lanczos3 // Algoritmo de alta calidad
      })
      .jpeg({
        quality: 100,       // Calidad máxima
        chromaSubsampling: '4:4:4', // Sin pérdida de color
        force: true
      })
      .toBuffer();
  } catch {
    return buffer; // Si falla la optimización, devolver el original
  }
};

// ─────────────────────────────────────────────
const handler = async (m, { conn, text }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.buscador_animeinfo;

  if (!text) return m.reply(`*${tradutor.texto1}*`);

  try {
    // ── 1. Consulta GraphQL a AniList ──────────────────────────────────────
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
        coverImage {
          extraLarge  # ~500px – mayor resolución disponible en AniList
          large       # ~230px – respaldo
          color
        }
      }
    }`;

    const { data } = await axios.post('https://graphql.anilist.co', {
      query,
      variables: { search: text }
    }, { timeout: 15_000 });

    const result = data.data.Media;
    if (!result) throw new Error(tradutor.texto3);

    // ── 2. Traducción de sinopsis ──────────────────────────────────────────
    const cleanDesc = result.description
      ? result.description.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
      : 'No disponible';

    const safeTranslate = async (txt) => {
      try {
        const res = await translate(txt, { to: 'es', autoCorrect: true });
        return res.text;
      } catch {
        return txt;
      }
    };

    const sinopsisTranslate = await safeTranslate(cleanDesc);

    // ── 3. Formato del mensaje ─────────────────────────────────────────────
    const titulo   = result.title.romaji || result.title.english || result.title.native;
    const estudios = result.studios.nodes.map(s => s.name).join(', ') || 'N/A';
    const generos  = result.genres.join(', ') || 'N/A';

    const estadosMap = {
      FINISHED:        'Finalizado',
      RELEASING:       'En emisión',
      NOT_YET_RELEASED:'Próximamente',
      CANCELLED:       'Cancelado',
      HIATUS:          'En pausa'
    };
    const estado = estadosMap[result.status] || result.status;

    let AnimeInfo = `✨ *ANIME INFO* ✨\n\n`
    AnimeInfo += `*㊙️ ❘ Título:* ${titulo}\n`
    AnimeInfo += `*🏦 ❘ Estudio/s:* ${estudios}\n`
    AnimeInfo += `*📆 ❘ Año:* ${result.seasonYear || 'N/A'}\n`
    AnimeInfo += `*🗂 ❘ Episodios:* ${result.episodes || 'En emisión'}\n`
    AnimeInfo += `*🎧 ❘ Audio:* Japonés\n`
    AnimeInfo += `*💬 ❘ Subtítulos:* Español\n`
    AnimeInfo += `*🏷 ❘ Género:* *${generos}*\n`
    AnimeInfo += `*⏱ ❘ Duración:* ${result.duration ? result.duration + ' min' : 'N/A'}\n`
    AnimeInfo += `*💽 ❘ Formato:* ${result.format || 'N/A'}\n`
    AnimeInfo += `*🔅 ❘ Temporada:* ${result.season || 'N/A'}\n`
    AnimeInfo += `*⏳ ❘ Estado:* ${estado}\n\n`
    AnimeInfo += `*📜 ❘ Sinopsis:*\n`
    AnimeInfo += `> ${sinopsisTranslate}`

    // ── 4. Imagen en HD ───────────────────────────────────────────────────
    // Prioridad: extraLarge > bannerImage > large
    // bannerImage suele ser una imagen panorámica de mayor resolución (1900x400)
    // extraLarge es la portada más grande disponible (~500px)
    const imageUrls = [
      result.coverImage?.extraLarge,
      result.bannerImage,
      result.coverImage?.large
    ];

    let finalBuffer = await fetchImageBuffer(imageUrls);
    finalBuffer = await optimizeToHD(finalBuffer);

    if (finalBuffer) {
      // Guardar en tmp para enviar como archivo local (evita re-compresión de WhatsApp)
      const tmpPath = path.join(tmpdir(), `anime_${result.id}_hd.jpg`);
      fs.writeFileSync(tmpPath, finalBuffer);

      await conn.sendFile(m.chat, tmpPath, 'anime_hd.jpg', AnimeInfo.trim(), m);

      // Limpiar archivo temporal
      fs.unlink(tmpPath, () => {});
    } else {
      // Fallback: enviar por URL si no se pudo descargar el buffer
      const fallbackUrl = imageUrls.find(Boolean);
      await conn.sendFile(m.chat, fallbackUrl, 'anime_hd.jpg', AnimeInfo.trim(), m);
    }

  } catch (e) {
    console.error('[animeinfo]', e);
    m.reply(`*${tradutor.texto3}*`);
  }
};

handler.help    = ['anime <nombre>'];
handler.tags    = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
      
