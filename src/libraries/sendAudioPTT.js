// Envía un audio local como nota de voz (PTT).
// WhatsApp solo reproduce las notas de voz en Opus/OGG: un MP3 con ptt:true
// llega al chat pero al tocarlo da "audio no disponible" (falla el archivo).
// Por eso el MP3 se convierte a Opus con ffmpeg (toPTT, ya en converter.js).
// Si ffmpeg no está disponible o la conversión falla, se envía como audio
// normal: el MP3 sí se reproduce así.
import fs from 'fs';
import { fileURLToPath } from 'url';
import { toPTT } from './converter.js';

export async function sendAudioPTT(conn, chat, filePath, quoted) {
  try {
    // toPTT escribe archivos temporales en src/tmp; asegurarse de que exista.
    fs.mkdirSync(fileURLToPath(new URL('../tmp', import.meta.url)), { recursive: true });
    const opus = await toPTT(fs.readFileSync(filePath), 'mp3');
    try {
      await conn.sendMessage(chat, { audio: opus.data, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted });
    } finally {
      await opus.delete().catch(() => {});
    }
  } catch (e) {
    console.log('❌ No se pudo convertir el audio a Opus, enviando MP3 normal:', e?.message || e);
    await conn.sendMessage(chat, { audio: { url: filePath }, mimetype: 'audio/mpeg' }, { quoted });
  }
}

export default sendAudioPTT;
