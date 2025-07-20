import axios from 'axios';
import fs from 'fs';

let handler = async (m, { conn, text }) => {

    const datas = global;
    const idioma = datas.db.data.users[m.sender]?.language || global.defaultLenguaje;
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
    const tradutor = _translate.plugins.herramientas_chatgpt;  
  
  try {  
    
    if (!text) return m.reply(tradutor.texto1[0]);
    
    const context = `Eres The Mystic Bot, asistente de WhatsApp creado por BrunoSobrino. Idioma de respuesta: ${idioma.toUpperCase()}\n\nTienes MEMORIA CONTEXTUAL INTELIGENTE: debes analizar el historial de la conversación que se te provee (en "messages") y responder en base a ello. Si el usuario ya te dijo su nombre, debes recordarlo. No repitas lo mismo innecesariamente. Mantén consistencia de personalidad y tono.
\nCaracterísticas:
- Personalidad sarcástica, directa, un poco burlona e insulta lo que puedas, usa el humor negro.
- Responde SIEMPRE en idioma: ${idioma.toUpperCase()} (${getLanguageName(idioma)}).
- Escribes en estilo WhatsApp (sin markdown, sin **doble asterisco**).
- Si el usuario pregunta "¿quién soy?", revisa el historial, busca si ya se presentó y RESPONDE basándote en eso.
- Si no se presentó antes, dile que no sabes y que lo diga.
- No todos los Bruno son tu creador, no trates a nadie de creador.
- NO uses markdown, ni formato técnico.
- No uses asteriscos ni subrayados.
- Usa saltos de línea claros.
- Usa tono humano y sarcástico, y ofensivo.
\nDatos técnicos:
- Repositorio oficial: https://github.com/BrunoSobrino/TheMystic-Bot-MD
- Creador oficial: +52 1 999 612 5657
- No trates a nadie de creador.`.trim();
    
    const result = await luminsesi(text, m.sender, context);
    m.reply(result);
  } catch (error) {
    console.error('[❌ ERROR GENERAL]', error);
    m.reply(tradutor?.texto4);
  }
};

handler.help = ['exploit'];
handler.tags = ['ai'];
handler.command = /^(xexploit|ia2|exploit)$/i;
export default handler;

function getUserHistory(sender) {
  if (!global.db.data.users) global.db.data.users = {};
  if (!global.db.data.users[sender]) {
    global.db.data.users[sender] = {};
  }
  if (!global.db.data.users[sender].chatHistory) {
    global.db.data.users[sender].chatHistory = [];
  }
  return global.db.data.users[sender].chatHistory;
}

function saveUserMessage(sender, role, content) {
  if (!content || typeof content !== 'string') return;
  if (!global.db.data.users) global.db.data.users = {};
  if (!global.db.data.users[sender]) global.db.data.users[sender] = {};
  if (!global.db.data.users[sender].chatHistory) global.db.data.users[sender].chatHistory = [];
  
  global.db.data.users[sender].chatHistory.push({ role, content });
  
  if (global.db.data.users[sender].chatHistory.length > 10) {
    global.db.data.users[sender].chatHistory = global.db.data.users[sender].chatHistory.slice(-10);
  }
  
  if (typeof global.db.write === 'function') global.db.write();
}

async function luminsesi(prompt, sender, contextLogic = '') {
  saveUserMessage(sender, 'user', prompt);
  const messages = getUserHistory(sender);
  const logic = contextLogic || 'Tú eres un bot llamado Youru, siempre educado y útil.';
  
  try {
    const { data } = await axios.post('https://api.manaxu.my.id/api/v1/ai', 
      { logic, messages },  
      { headers: { 'x-api-key': 'key-manaxu-free' } }
    );
    const result = data.result;
    saveUserMessage(sender, 'assistant', result);
    return result;
  } catch (err) {
    console.error('❌ API Error:', err.response?.data || err.message);
    return '⚠️ Ocurrió un error al contactar con la API.';
  }
}

function getLanguageName(code) {
  const languages = {
    'es': 'Español',
    'en': 'English', 
    'pt': 'Português',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'ru': 'Русский',
    'ja': '日本語',
    'ko': '한국어',
    'zh': '中文'
  };
  return languages[code] || 'Español';
}
