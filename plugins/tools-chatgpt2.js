import axios from 'axios';
import fs from 'fs';

let handler = async (m, { conn, text, command }) => {

    const datas = global;
    const idioma = datas.db.data.users[m.sender]?.language || global.defaultLenguaje;
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
    const tradutor = _translate.plugins.herramientas_chatgpt;  
  
  try {  

    if (command === 'delmemoryia' || command === 'borrarmemoriaai') {
      if (!global.db.data.users) global.db.data.users = {};
      if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
      global.db.data.users[m.sender].chatHistory = [];
      if (typeof global.db.write === 'function') global.db.write();
      return m.reply('🗑️ Memoria de conversación borrada exitosamente.\n\nYa no recordaré nuestras conversaciones anteriores.');
    }
      
    if (!text) return m.reply(tradutor.texto1[0]);

    const model = await axios.get("https://raw.githubusercontent.com/Skidy89/chat-gpt-jailbreak/refs/heads/main/Text.txt");
    const context = `${model.data}`.trim();
    
    const result = await luminsesi(text, m.sender, context);
    m.reply(result);
  } catch (error) {
    console.error('[❌ ERROR GENERAL]', error);
    m.reply(tradutor?.texto4);
  }
};

handler.help = ['exploit', 'delmemoryia'];
handler.tags = ['ai'];
handler.command = /^(xexploit|ia2|exploit|delmemoryia|borrarmemoriaai)$/i;
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
