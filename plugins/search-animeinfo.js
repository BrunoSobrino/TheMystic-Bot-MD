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
      texto3: '[❗] OCURRIÓ UN ERROR, INTÉNTALO DE NUEVO',
      texto_procesando: '⏳ Buscando información...'
    };
  }

  if (!text) return m.reply(`*${tradutor.texto1}*`);

  try {
    // ========== PASO 1: BUSCAR INFORMACIÓN DEL ANIME ==========
    const query = `query ($search: String) { 
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
        'Accept': 'application/json' 
      },
      data: { query, variables: { search: text } },
      timeout: 10000
    });

    const result = response.data.data.Media;
    if (!result) return m.reply(`*${tradutor.texto3}*`);

    // ========== DICCIONARIOS DE TRADUCCIÓN ==========
    const TRADUCCIONES = {
      estados: { 
        'FINISHED': 'Finalizado', 
        'RELEASING': 'En emisión', 
        'NOT_YET_RELEASED': 'Próximamente', 
        'CANCELLED': 'Cancelado', 
        'HIATUS': 'En pausa' 
      },
      temporadas: { 
        'WINTER': 'Invierno', 
        'SPRING': 'Primavera', 
        'SUMMER': 'Verano', 
        'FALL': 'Otoño' 
      },
      formatos: { 
        'TV': 'Serie de TV', 
        'MOVIE': 'Película', 
        'SPECIAL': 'Especial', 
        'OVA': 'OVA', 
        'ONA': 'ONA', 
        'MUSIC': 'Musical',
        'TV_SHORT': 'Serie Corta',
        'MANGA': 'Manga',
        'NOVEL': 'Novela',
        'ONE_SHOT': 'One-Shot'
      },
      generos: { 
        'Action': 'Acción', 
        'Adventure': 'Aventura', 
        'Comedy': 'Comedia', 
        'Drama': 'Drama', 
        'Ecchi': 'Ecchi', 
        'Fantasy': 'Fantasía', 
        'Horror': 'Terror', 
        'Mahou Shoujo': 'Chicas Mágicas', 
        'Mecha': 'Mecha', 
        'Music': 'Música', 
        'Mystery': 'Misterio', 
        'Psychological': 'Psicológico', 
        'Romance': 'Romance', 
        'Sci-Fi': 'Ciencia Ficción', 
        'Slice of Life': 'Recuentos de la Vida', 
        'Sports': 'Deportes', 
        'Supernatural': 'Sobrenatural', 
        'Thriller': 'Suspenso',
        'Hentai': 'Hentai',
        'Harem': 'Harem',
        'Isekai': 'Isekai',
        'Josei': 'Josei',
        'Seinen': 'Seinen',
        'Shoujo': 'Shoujo',
        'Shounen': 'Shounen',
        'School': 'Escolar',
        'Military': 'Militar',
        'Historical': 'Histórico',
        'Parody': 'Parodia',
        'Samurai': 'Samurái',
        'Martial Arts': 'Artes Marciales',
        'Super Power': 'Super Poderes',
        'Vampire': 'Vampiros',
        'Demons': 'Demonios',
        'Space': 'Espacial',
        'Game': 'Juegos',
        'Cars': 'Autos',
        'Kids': 'Infantil',
        'Magic': 'Magia',
        'Police': 'Policía'
      }
    };

    // ========== PASO 2: TRADUCIR SINOPSIS ==========
    let cleanDesc = result.description 
      ? result.description.replace(/<\/?[^>]+(>|$)/g, "").trim() 
      : 'No disponible';
    
    let sinopsisEsp = await traducirTexto(cleanDesc);
    
    // Formatear sinopsis con > al inicio de cada línea
    const sinopsisFormateada = sinopsisEsp
      .split('\n')
      .map(linea => linea.trim())
      .filter(linea => linea.length > 0)
      .map(linea => `> ${linea}`)
      .join('\n');
    
    // ========== PASO 3: CONSTRUIR INFORMACIÓN ==========
    const titulo = result.title.romaji || result.title.english || result.title.native;
    const tituloIngles = result.title.english && result.title.english !== result.title.romaji 
      ? `\n🔤 *Título en inglés:* ${result.title.english}` 
      : '';
    const tituloNativo = result.title.native && result.title.native !== result.title.romaji 
      ? ` (${result.title.native})` 
      : '';
    
    const estudios = result.studios.nodes.map(s => s.name).join(', ') || 'Desconocido';
    const generosEsp = result.genres
      .map(g => TRADUCCIONES.generos[g] || g)
      .join(', ');

    const AnimeInfo = `✨ *INFORMACIÓN DEL ANIME* ✨

🈺 *Título:* ${titulo}${tituloIngles}${tituloNativo}
🏦 *Estudio:* ${estudios}
📆 *Año:* ${result.seasonYear || 'N/A'}
🗂 *Episodios:* ${result.episodes || 'En emisión'}
🎧 *Audio:* Japonés
💬 *Subtítulos:* Español
🏷 *Géneros:* ${generosEsp}
⏱ *Duración:* ${result.duration ? result.duration + ' min' : 'N/A'}
💽 *Formato:* ${TRADUCCIONES.formatos[result.format] || result.format}
🔅 *Temporada:* ${TRADUCCIONES.temporadas[result.season] || 'N/A'}
⏳ *Estado:* ${TRADUCCIONES.estados[result.status] || result.status}

📜 *Sinopsis:*
${sinopsisFormateada}`;

    // ========== PASO 4: OBTENER Y MEJORAR IMAGEN ==========
    const imageUrl = result.coverImage.extraLarge || result.bannerImage || result.coverImage.large;
    
    let imageToSend;
    let imageCaption = AnimeInfo.trim();
    
    try {
      const enhancedImage = await upscaleImageWithFallback(imageUrl);
      imageToSend = enhancedImage;
      imageCaption += '\n\n✨ _Imagen mejorada con IA (4x upscale)_';
    } catch (upscaleError) {
      imageToSend = { url: imageUrl };
      imageCaption += '\n\n⚠️ _Imagen original (sin mejora IA)_';
    }

    // ========== PASO 5: ENVIAR RESULTADO ==========
    await conn.sendMessage(m.chat, { 
      image: imageToSend, 
      caption: imageCaption 
    }, { quoted: m });

  } catch (e) {
    let errorMsg = `*${tradutor.texto3}*`;
    
    if (e.message?.includes('timeout')) {
      errorMsg += '\n\n⏱️ _La búsqueda tardó demasiado. Intenta nuevamente._';
    } else if (e.message?.includes('Network')) {
      errorMsg += '\n\n🌐 _Error de conexión. Verifica tu internet._';
    } else {
      errorMsg += `\n\n📝 _Detalles: ${e.message || 'Error desconocido'}_`;
    }
    
    m.reply(errorMsg);
  }
};

// ========== FUNCIÓN DE TRADUCCIÓN ==========
async function traducirTexto(texto) {
  if (texto === 'No disponible') return texto;
  
  const MAX_LENGTH = 1000;
  const fragmentos = [];
  
  for (let i = 0; i < texto.length; i += MAX_LENGTH) {
    fragmentos.push(texto.slice(i, i + MAX_LENGTH));
  }
  
  const traducidos = [];
  
  for (const fragmento of fragmentos) {
    try {
      const res = await translate(fragmento, { to: 'es', from: 'en' });
      traducidos.push(res.text);
    } catch (err1) {
      try {
        const res = await axios.get('https://api.mymemory.translated.net/get', {
          params: { q: fragmento, langpair: 'en|es' },
          timeout: 5000
        });
        
        if (res.data.responseStatus === 200) {
          traducidos.push(res.data.responseData.translatedText);
        } else {
          throw new Error('MyMemory no disponible');
        }
      } catch (err2) {
        traducidos.push(fragmento);
      }
    }
  }
  
  return traducidos.join(' ');
}

// ========== FUNCIÓN DE MEJORA DE IMAGEN CON MÚLTIPLES APIS ==========
async function upscaleImageWithFallback(imageUrl) {
  const apis = [
    {
      name: 'ApiCausas',
      fn: async () => await upscaleWithApiCausas(imageUrl)
    },
    {
      name: 'Vyro.ai',
      fn: async () => await upscaleWithVyro(imageUrl)
    }
  ];

  for (const api of apis) {
    try {
      const result = await api.fn();
      return result;
    } catch (error) {
      continue;
    }
  }

  throw new Error('Todas las APIs de mejora fallaron');
}

// ========== API 1: ApiCausas ==========
async function upscaleWithApiCausas(imageUrl) {
  try {
    const apikey = process.env.APICAUSAS_KEY || "causa-0e3eacf90ab7be15";
    
    const fullUrl = `https://rest.apicausas.xyz/api/v1/utilidades/upscale?apikey=${apikey}&url=${encodeURIComponent(imageUrl)}&type=4`;

    const response = await axios.get(fullUrl, {
      responseType: "arraybuffer",
      timeout: 45000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      maxRedirects: 5
    });

    if (response.status !== 200) {
      throw new Error(`API respondió con código ${response.status}`);
    }

    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('Respuesta no es una imagen');
    }

    return Buffer.from(response.data);

  } catch (err) {
    throw new Error(`ApiCausas: ${err.message}`);
  }
}

// ========== API 2: Vyro.ai (Respaldo) ==========
async function upscaleWithVyro(imageUrl) {
  try {
    const response = await axios.get('https://api.vyro.ai/v1/imagine/api/generations', {
      params: {
        prompt: imageUrl,
        style_id: 122,
        aspect_ratio: '1:1',
        high_res_results: 1
      },
      timeout: 45000,
      headers: {
        'Authorization': 'Bearer vk-v1RLbbKaLfAUCiKL4FlHMHMGz8DVKjQC29hLT0uPFqKXbcJ'
      }
    });

    if (response.data && response.data.data && response.data.data[0]) {
      const imageResultUrl = response.data.data[0].url;
      
      const imageResponse = await axios.get(imageResultUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      return Buffer.from(imageResponse.data);
    }

    throw new Error('Sin resultados');

  } catch (err) {
    throw new Error(`Vyro.ai: ${err.message}`);
  }
}

handler.help = ['anime <nombre>'];
handler.tags = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
      
