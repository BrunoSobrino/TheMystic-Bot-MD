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

    // --- DICCIONARIOS AMPLIADOS ---
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
      'MOVIE': 'Película', 
      'SPECIAL': 'Especial', 
      'OVA': 'OVA', 
      'ONA': 'ONA', 
      'MUSIC': 'Musical',
      'TV_SHORT': 'Serie Corta',
      'MANGA': 'Manga',
      'NOVEL': 'Novela',
      'ONE_SHOT': 'One-Shot'
    };
    
    const generosTraduccion = { 
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
    };

    // --- LIMPIEZA Y TRADUCCIÓN MEJORADA ---
    let cleanDesc = result.description ? result.description.replace(/<\/?[^>]+(>|$)/g, "").trim() : 'No disponible';
    
    // Sistema de traducción con 3 niveles de respaldo
    let sinopsisEsp = cleanDesc;
    
    if (cleanDesc !== 'No disponible') {
      try {
        // Intento 1: Google Translate (vitalets)
        const resTrans = await translate(cleanDesc, { to: 'es', from: 'en' });
        sinopsisEsp = resTrans.text;
      } catch (err1) {
        console.log('⚠️ Traductor primario falló, probando alternativa...');
        try {
          // Intento 2: MyMemory API (gratuita, sin API key)
          const backupRes = await axios.get(`https://api.mymemory.translated.net/get`, {
            params: {
              q: cleanDesc.substring(0, 500), // Limitar a 500 caracteres
              langpair: 'en|es'
            },
            timeout: 5000
          });
          
          if (backupRes.data.responseStatus === 200) {
            sinopsisEsp = backupRes.data.responseData.translatedText;
          } else {
            throw new Error('MyMemory API no disponible');
          }
        } catch (err2) {
          console.log('⚠️ Traductor secundario falló, probando tercera opción...');
          try {
            // Intento 3: LibreTranslate (alternativa libre)
            const libreRes = await axios.post('https://libretranslate.de/translate', {
              q: cleanDesc.substring(0, 500),
              source: 'en',
              target: 'es',
              format: 'text'
            }, {
              timeout: 5000
            });
            
            sinopsisEsp = libreRes.data.translatedText;
          } catch (err3) {
            console.log('❌ Todos los traductores fallaron, manteniendo texto original');
            sinopsisEsp = cleanDesc + '\n\n_[Traducción no disponible]_';
          }
        }
      }
    }
    
    // --- CONSTRUCCIÓN DEL MENSAJE CON FORMATO MEJORADO ---
    const titulo = result.title.romaji || result.title.english || result.title.native;
    const tituloIngles = result.title.english && result.title.english !== result.title.romaji 
      ? `${result.title.english}` 
      : '';
    const tituloNativo = result.title.native && result.title.native !== result.title.romaji 
      ? ` (${result.title.native})` 
      : '';
    
    const estudios = result.studios.nodes.map(s => s.name).join(', ') || 'Desconocido';
    const generosEsp = result.genres.map(g => generosTraduccion[g] || g).join(', ');

    let AnimeInfo = `✨ *INFORMACIÓN DE ANIME* ✨\n\n`;
    AnimeInfo += `🈺 | *Título:* ${titulo}`;
    if (tituloIngles) AnimeInfo += `\n🔤 | *Título inglés:* ${tituloIngles}`;
    if (tituloNativo) AnimeInfo += `${tituloNativo}`;
    AnimeInfo += `\n🏦 | *Estudio:* ${estudios}`;
    AnimeInfo += `\n📆 | *Año:* ${result.seasonYear || 'N/A'}`;
    AnimeInfo += `\n🗂 | *Episodios:* ${result.episodes || 'En emisión'}`;
    AnimeInfo += `\n🎧 | *Audio:* Japonés`;
    AnimeInfo += `\n💬 | *Subtítulos:* Español`;
    AnimeInfo += `\n🏷 | *Géneros:* ${generosEsp}`;
    AnimeInfo += `\n⏱ | *Duración:* ${result.duration ? result.duration + ' min' : 'N/A'}`;
    AnimeInfo += `\n💽 | *Formato:* ${formatos[result.format] || result.format}`;
    AnimeInfo += `\n🔅 | *Temporada:* ${temporadas[result.season] || 'N/A'}`;
    AnimeInfo += `\n⏳ | *Estado:* ${estados[result.status] || result.status}`;
    AnimeInfo += `\n\n📜 | *Sinopsis:*\n${sinopsisEsp}`;

    const imageHD = result.coverImage.extraLarge || result.bannerImage || result.coverImage.large;

    await conn.sendMessage(m.chat, { 
      image: { url: imageHD }, 
      caption: AnimeInfo.trim() 
    }, { quoted: m });

  } catch (e) {
    console.error('❌ Error en comando Anime:', e.message || e);
    m.reply(`*${tradutor.texto3}*\n\n_Detalles: ${e.message || 'Error desconocido'}_`);
  }
};

handler.help = ['anime <nombre>'];
handler.tags = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
      
