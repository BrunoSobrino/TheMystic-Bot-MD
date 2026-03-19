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
      texto_procesando: '⏳ Buscando información y mejorando imagen...'
    };
  }

  if (!text) return m.reply(`*${tradutor.texto1}*`);

  // Mensaje de carga
  const loadingMsg = await m.reply(`${tradutor.texto_procesando || '⏳ Procesando...'}`);

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
        'Mahou Shoujo': 'Magical Girl', 
        'Mecha': 'Mecha', 
        'Music': 'Música', 
        'Mystery': 'Misterio', 
        'Psychological': 'Psicológico', 
        'Romance': 'Romance', 
        'Sci-Fi': 'Ciencia Ficción', 
        'Slice of Life': 'Recuentos de la vida', 
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
        'Game': 'Juegos'
      }
    };

    // ========== PASO 2: TRADUCIR SINOPSIS ==========
    let cleanDesc = result.description 
      ? result.description.replace(/<\/?[^>]+(>|$)/g, "").trim() 
      : 'No disponible';
    
    let sinopsisEsp = await traducirTexto(cleanDesc);
    
    // ========== PASO 3: CONSTRUIR INFORMACIÓN ==========
    const titulo = result.title.romaji || result.title.english || result.title.native;
    const tituloIngles = result.title.english && result.title.english !== result.title.romaji 
      ? `\n🔤 | *Título inglés:* ${result.title.english}` 
      : '';
    const tituloNativo = result.title.native && result.title.native !== result.title.romaji 
      ? ` (${result.title.native})` 
      : '';
    
    const estudios = result.studios.nodes.map(s => s.name).join(', ') || 'Desconocido';
    const generosEsp = result.genres
      .map(g => TRADUCCIONES.generos[g] || g)
      .join(', ');

    const AnimeInfo = `✨ *INFORMACIÓN DE ANIME* ✨

🈺 | *Título:* ${titulo}${tituloIngles}${tituloNativo}
🏦 | *Estudio:* ${estudios}
📆 | *Año:* ${result.seasonYear || 'N/A'}
🗂 | *Episodios:* ${result.episodes || 'En emisión'}
🎧 | *Audio:* Japonés
💬 | *Subtítulos:* Español
🏷 | *Géneros:* ${generosEsp}
⏱ | *Duración:* ${result.duration ? result.duration + ' min' : 'N/A'}
💽 | *Formato:* ${TRADUCCIONES.formatos[result.format] || result.format}
🔅 | *Temporada:* ${TRADUCCIONES.temporadas[result.season] || 'N/A'}
⏳ | *Estado:* ${TRADUCCIONES.estados[result.status] || result.status}

📜 | *Sinopsis:*
${sinopsisEsp}

🎨 | _Imagen mejorada con IA_`;

    // ========== PASO 4: OBTENER Y MEJORAR IMAGEN ==========
    const imageUrl = result.coverImage.extraLarge || result.bannerImage || result.coverImage.large;
    
    let imageToSend;
    let imageCaption = AnimeInfo.trim();
    
    try {
      // Intentar mejorar la imagen con la API
      console.log('🎨 Mejorando imagen con IA...');
      const enhancedImage = await upscaleImage(imageUrl);
      imageToSend = enhancedImage;
      console.log('✅ Imagen mejorada exitosamente');
    } catch (upscaleError) {
      // Si falla el upscale, usar imagen original
      console.log('⚠️ No se pudo mejorar la imagen, usando original:', upscaleError.message);
      imageToSend = { url: imageUrl };
      imageCaption += '\n\n_⚠️ Imagen original (no se pudo mejorar)_';
    }

    // ========== PASO 5: ENVIAR RESULTADO ==========
    await conn.sendMessage(m.chat, { 
      image: imageToSend, 
      caption: imageCaption 
    }, { quoted: m });

  } catch (e) {
    console.error('❌ Error en comando Anime:', e);
    
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
      // Intento 1: Google Translate
      const res = await translate(fragmento, { to: 'es', from: 'en' });
      traducidos.push(res.text);
    } catch (err1) {
      try {
        // Intento 2: MyMemory API
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
        // Si fallan ambos, mantener original
        traducidos.push(fragmento);
      }
    }
  }
  
  return traducidos.join(' ');
}

// ========== FUNCIÓN DE MEJORA DE IMAGEN ==========
async function upscaleImage(imageUrl) {
  try {
    // Obtener API key desde variable de entorno o usar la por defecto
    const apikey = process.env.APICAUSAS_KEY || "causa-0e3eacf90ab7be15";
    const endpoint = 'https://rest.apicausas.xyz/api/v1/utilidades/upscale';

    const response = await axios.get(endpoint, {
      params: {
        apikey: apikey,
        url: imageUrl,
        type: '4' // 4x upscale para máxima calidad
      },
      responseType: "arraybuffer",
      timeout: 30000, // 30 segundos
      headers: {
        'User-Agent': 'WhatsApp-Bot/1.0'
      }
    });

    // Validar respuesta
    if (response.status !== 200) {
      throw new Error(`API respondió con código ${response.status}`);
    }

    // Validar que la respuesta sea una imagen válida
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('La respuesta no es una imagen válida');
    }

    return Buffer.from(response.data);

  } catch (err) {
    if (err.response) {
      throw new Error(`Error de API: ${err.response.status} - ${err.response.statusText}`);
    } else if (err.request) {
      throw new Error("La API no respondió");
    } else {
      throw new Error(`Error al procesar: ${err.message}`);
    }
  }
}

handler.help = ['anime <nombre>'];
handler.tags = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
  
