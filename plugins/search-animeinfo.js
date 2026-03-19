import axios from 'axios';
import pkg from '@vitalets/google-translate-api';
const { translate } = pkg;
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

const handler = async (m, { conn, text }) => {
  const datas = global;
  const idioma = datas.db?.data?.users?.[m.sender]?.language || global.defaultLenguaje || 'es';
  
  let tradutor;
  try {
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
    tradutor = _translate.plugins.buscador_animeinfo;
  } catch {
    tradutor = { 
      texto1: 'Ingresa el nombre de un anime.', 
      texto3: '[❗] ERROR, INTÉNTALO DE NUEVO' 
    };
  }

  if (!text) return m.reply(`*${tradutor.texto1}*`);

  try {
    const query = `query ($search: String) { Media (search: $search, type: ANIME) { id title { romaji english native } studios(isMain: true) { nodes { name } } seasonYear episodes genres duration format season status description averageScore coverImage { extraLarge large } } }`;

    const response = await axios({
      url: 'https://graphql.anilist.co',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { query, variables: { search: text } }
    });

    const result = response.data.data.Media;
    if (!result) return m.reply(`*${tradutor.texto3}*`);

    // --- TRADUCCIONES Y DATOS ---
    const temporadas = { 'WINTER': 'Winter', 'SPRING': 'Spring', 'SUMMER': 'Summer', 'FALL': 'Fall' };
    const genTrad = { 'Action': 'Acción', 'Adventure': 'Aventura', 'Comedy': 'Comedia', 'Drama': 'Drama', 'Fantasy': 'Fantasía', 'Horror': 'Terror', 'Mystery': 'Misterio', 'Psychological': 'Psicológico', 'Romance': 'Romance', 'Sci-Fi': 'C. Ficción', 'Supernatural': 'Sobrenatural' };

    const titulo = result.title.romaji || result.title.english;
    const estudio = result.studios.nodes[0]?.name || 'Desconocido';
    const score = result.averageScore ? `${result.averageScore}%` : 'N/A';
    const infoHeader = `${temporadas[result.season] || ''} ${result.seasonYear || ''} • ${result.episodes || '?'} ep`.trim();
    const generos = result.genres.slice(0, 3).map(g => genTrad[g] || g);

    // --- DISEÑO DE CANVAS ---
    const canvas = createCanvas(1200, 600);
    const ctx = canvas.getContext('2d');

    // 1. Fondo Degradado
    const grad = ctx.createLinearGradient(0, 0, 1200, 0);
    grad.addColorStop(0, '#0f0f1b');
    grad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 600);

    // 2. Cargar Imagen del Anime
    const imgUrl = result.coverImage.extraLarge || result.coverImage.large;
    const imgBuffer = await axios.get(imgUrl, { responseType: 'arraybuffer' });
    const animeImg = await loadImage(Buffer.from(imgBuffer.data));

    // 3. Dibujar Imagen con Sombra y Borde Redondeado (Derecha)
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 30;
    const imgW = 400;
    const imgH = 550;
    const x = 750;
    const y = 25;
    
    // Recorte redondeado
    ctx.beginPath();
    ctx.roundRect(x, y, imgW, imgH, 20);
    ctx.clip();
    ctx.drawImage(animeImg, x, y, imgW, imgH);
    ctx.restore();

    // 4. Escribir Textos
    ctx.fillStyle = '#ffffff';
    
    // Header (Temporada/Año)
    ctx.font = 'bold 28px sans-serif';
    ctx.globalAlpha = 0.7;
    ctx.fillText(infoHeader, 60, 100);

    // Título (Ajuste automático de tamaño)
    ctx.globalAlpha = 1.0;
    let fSize = 75;
    ctx.font = `bold ${fSize}px sans-serif`;
    while(ctx.measureText(titulo).width > 650 && fSize > 35) {
        fSize -= 5;
        ctx.font = `bold ${fSize}px sans-serif`;
    }
    ctx.fillText(titulo, 60, 190);

    // Estudio (Rosa)
    ctx.fillStyle = '#ff6b9d';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(estudio, 60, 260);

    // Puntuación (Estrella)
    ctx.fillStyle = '#ff6b9d';
    ctx.font = '60px sans-serif';
    ctx.fillText('★', 60, 350);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 65px sans-serif';
    ctx.fillText(` ${score}`, 120, 350);

    // Géneros (Burbujas)
    let gX = 60;
    generos.forEach(g => {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        const tw = ctx.measureText(g).width + 40;
        ctx.beginPath();
        ctx.roundRect(gX, 420, tw, 50, 25);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '22px sans-serif';
        ctx.fillText(g, gX + 20, 452);
        gX += tw + 15;
    });

    // --- ENVIAR ---
    const finalBuffer = canvas.toBuffer('image/png');
    
    // Traducción de sinopsis para el caption
    const cleanDesc = result.description ? result.description.replace(/<\/?[^>]+(>|$)/g, "").trim() : '';
    let sinopsis;
    try {
        const trans = await translate(cleanDesc, { to: 'es' });
        sinopsis = trans.text;
    } catch { sinopsis = cleanDesc; }

    const caption = `✨ *${titulo}*\n` +
                    `🏦 *Estudio:* ${estudio}\n` +
                    `⭐ *Puntaje:* ${score}\n\n` +
                    `📜 *Sinopsis:* ${sinopsis.slice(0, 400)}...`;

    await conn.sendMessage(m.chat, { image: finalBuffer, caption }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply(`*${tradutor.texto3}*`);
  }
};

handler.help = ['anime <nombre>'];
handler.tags = ['buscadores'];
handler.command = /^(anime|animeinfo)$/i;

export default handler;
