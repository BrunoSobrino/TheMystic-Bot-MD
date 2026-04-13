import axios from 'axios';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender]?.language || global.defaultLenguaje;
  
  // Opcional: Si tienes traducciones específicas para Wikipedia en tu archivo .json, puedes llamarlas aquí.
  // Por ahora, he puesto textos predeterminados en español para asegurar que funcione directamente.
  
  if (!text) return m.reply(`*⚠️ Ingresa lo que deseas buscar en Wikipedia.*\nEjemplo: ${usedPrefix + command} Albert Einstein`);

  try {
    // URL y API Key proporcionadas
    const apiKey = 'causa-0e3eacf90ab7be15';
    const apiUrl = `https://rest.apicausas.xyz/api/v1/buscadores/wikipedia?apikey=${apiKey}&q=${encodeURIComponent(text)}&lang=es`;

    const { data } = await axios.get(apiUrl);

    // Adaptabilidad: La mayoría de estas APIs devuelven la info dentro de "result" o "data"
    const result = data.result || data.data || data;

    if (!result || Object.keys(result).length === 0) throw new Error('Sin resultados');

    // Extrayendo los datos (con nombres de propiedades comunes en APIs REST)
    const titulo = result.title || result.titulo || text;
    const extracto = result.extract || result.info || result.description || result.extracto || 'No hay información disponible para esta búsqueda.';
    const url = result.url || result.link || `https://es.wikipedia.org/wiki/${encodeURIComponent(titulo)}`;
    
    // Si la API no devuelve imagen, usamos el logo de Wikipedia como respaldo por defecto
    const imagenUrl = result.image || result.thumbnail || result.imagen || 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png';

    // DISEÑO ACTUALIZADO CON NEGRITAS Y CITA (Idéntico al de Anime)
    let WikiInfo = `🌐 *WIKIPEDIA INFO* 🌐\n\n`
    WikiInfo += `*📌 ❘ Título:* ${titulo}\n`
    WikiInfo += `*🔗 ❘ Enlace:* ${url}\n\n`
    WikiInfo += `*📜 ❘ Resumen:*\n`
    WikiInfo += `> ${extracto}`

    // Enviando la imagen con el texto
    await conn.sendFile(m.chat, imagenUrl, 'wikipedia.jpg', WikiInfo.trim(), m);

  } catch (e) {
    console.error(e);
    m.reply(`*❌ Ocurrió un error o no se encontró el artículo "${text}" en Wikipedia.*`);
  }
};

handler.help = ['wikipedia <texto>', 'wiki <texto>'];
handler.tags = ['buscadores'];
handler.command = /^(wiki|wikipedia)$/i;

export default handler;
      
