import axios from 'axios';
import fs from 'fs';

const cache = new Map(); // ⚡ cache simple

const handler = async (m, { conn, text }) => {
  const idioma = global.db?.data?.users?.[m.sender]?.language || 'es';

  let tradutor;
  try {
    tradutor = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`)).plugins.buscador_animeinfo;
  } catch {
    tradutor = { 
      texto1: 'Ingresa el nombre de un anime.', 
      texto3: 'Ocurrió un error.' 
    };
  }

  if (!text) return m.reply(`*${tradutor.texto1}*`);

  // ⚡ CACHE
  if (cache.has(text.toLowerCase())) {
    return conn.sendMessage(m.chat, cache.get(text.toLowerCase()), { quoted: m });
  }

  try {
    const query = `query ($search: String) {
      Media (search: $search, type: ANIME) {
        title { romaji english }
        episodes
        duration
        season
        seasonYear
        status
        format
        averageScore
        description
        genres
        coverImage { extraLarge large }
        studios { nodes { name } }
      }
    }`;

    const { data } = await axios.post('https://graphql.anilist.co', {
      query,
      variables: { search: text }
    });

    const result = data.data.Media;
    if (!result) return m.reply(tradutor.texto3);

    // Diccionarios
    const estados = {
      FINISHED: 'Finalizado',
      RELEASING: 'En emisión',
      NOT_YET_RELEASED: 'Próximamente'
    };

    const temporadas = {
      WINTER: 'Invierno',
      SPRING: 'Primavera',
      SUMMER: 'Verano',
      FALL: 'Otoño'
    };

    // ⚡ limpiar descripción y recortar
    let desc = result.description?.replace(/<[^>]+>/g, '') || 'No disponible';
    if (desc.length > 600) desc = desc.slice(0, 600) + '...';

    const titulo = result.title.romaji || result.title.english;
    const estudios = result.studios.nodes.map(s => s.name).join(', ') || 'N/A';

    const textoFinal = `✨ *${titulo}* ✨

⭐ *Puntaje:* ${result.averageScore || 'N/A'}%
🎬 *Episodios:* ${result.episodes || 'En emisión'}
📆 *Año:* ${result.seasonYear || 'N/A'}
🎞 *Formato:* ${result.format}
🏢 *Estudio:* ${estudios}
📡 *Estado:* ${estados[result.status] || result.status}
🌸 *Temporada:* ${temporadas[result.season] || result.season}

🎭 *Géneros:* ${result.genres.join(', ')}

📜 *Sinopsis:*
${desc}`;

    const msg = {
      image: { url: result.coverImage.extraLarge || result.coverImage.large },
      caption: textoFinal
    };

    // ⚡ guardar en cache
    cache.set(text.toLowerCase(), msg);

    await conn.sendMessage(m.chat, msg, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply(tradutor.texto3);
  }
};

handler.command = /^(anime|animeinfo)$/i;
export default handler;
