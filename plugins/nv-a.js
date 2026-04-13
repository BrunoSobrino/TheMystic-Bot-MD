import fs from 'fs';
import { toPTT } from '../src/libraries/converter.js';

const handler = async (m, { conn }) => {
  // Comprobaciones de seguridad de los chats
  if (!db.data.chats[m.chat].audios) return;
  if (!db.data.settings[conn.user.jid].audios_bot && !m.isGroup) return;
  
  const vn = './src/assets/audio/01J672JMF3RCG7BPJW4X2P94N2.mp3';
  
  try {
    // Simulamos que el bot está grabando un audio
    await conn.sendPresenceUpdate('recording', m.chat);
    
    // Leemos el archivo MP3
    const audioBuffer = fs.readFileSync(vn);
    
    // Lo convertimos al formato estricto de Nota de Voz
    const pttConvertido = await toPTT(audioBuffer, 'mp3');
    
    // Lo enviamos a WhatsApp de forma segura
    await conn.sendMessage(m.chat, { 
      audio: pttConvertido.data, 
      mimetype: 'audio/ogg; codecs=opus', 
      ptt: true 
    }, { quoted: m });
    
  } catch (e) {
    console.error("❌ Error al enviar el audio de 'A':", e);
  }
};

handler.customPrefix = /ª|a|A/;
handler.command = /^(a|ª|A?$)/;

export default handler;
