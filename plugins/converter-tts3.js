import fetch from 'node-fetch';

const handler = async (m, { conn, usedPrefix, command, text }) => {
  // Si no hay texto, enviamos las instrucciones
  if (!text) {
    return m.reply(`*[❗] Formato incorrecto.*\n\n*—◉ Ejemplo:*\n◉ ${usedPrefix + command} es | este es un texto de ejemplo\n\n*—◉ Idiomas comunes:*\n◉ es (Español)\n◉ en (Inglés)\n◉ pt (Portugués)\n◉ ja (Japonés)`);
  }

  let lang = 'es'; // Español por defecto
  let inputText = text;

  // Verificamos si el usuario usó el formato "idioma | texto" (ej: en | hello world)
  const match = text.match(/^([a-zA-Z]{2,3})\s*\|\s*(.+)/i);
  if (match) {
    lang = match[1].toLowerCase();
    inputText = match[2];
  }

  try {
    // Usamos la API pública y gratuita de Google
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(inputText)}&tl=${lang}&client=tw-ob`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('La API de Google rechazó la conexión');
    
    const audioBuffer = await response.buffer();
    
    // Lo enviamos como audio normal (MP3) para que WhatsApp no dé el error de archivo dañado
    await conn.sendMessage(m.chat, { 
      audio: audioBuffer, 
      fileName: `tts_google.mp3`, 
      mimetype: 'audio/mpeg' 
    }, { quoted: m });
    
  } catch (error) {
    console.error('Error al generar el audio de Google:', error);
    m.reply('*[❗] Ocurrió un error al intentar generar la voz.*');
  }
};

handler.help = ['tts'];
handler.tags = ['converter'];
handler.command = ['tts', 'tts3', 'voz'];

export default handler;
