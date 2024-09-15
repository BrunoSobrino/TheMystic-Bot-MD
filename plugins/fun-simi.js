import translate from '@vitalets/google-translate-api';
import chatsimsimi from 'chats-simsimi';
import axios from 'axios';
import fetch from 'node-fetch';

const handler = async (m, {conn, text, command, args, usedPrefix}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.fun_simi
  
  if (!text) throw `${tradutor.texto1} ${usedPrefix + command} Hola Bot*`;
  try {
      const resSimi = await simitalk(text);
      conn.sendMessage(m.chat, { text: resSimi.resultado.simsimi }, { quoted: m });
  } catch {
      throw tradutor.texto2;
  }
};
handler.help = ['simi', 'bot'].map((v) => v + ' <teks>');
handler.tags = ['fun'];
handler.command = /^((sim)?simi|bot|alexa|cortana)$/i;
export default handler;

async function simitalk(ask, apikeyyy = "iJ6FxuA9vxlvz5cKQCt3", language = "es") {
    if (!ask) return { status: false, resultado: { msg: "Debes ingresar un texto para hablar con simsimi." }};
    try {
        const response11 = await chatsimsimi(ask, language, false);
        if (response11.result == 'indefinida' || response11 == '' || !response11.result) response11 = XD // Se usa "XD" para causar error y usar otra opción.  
        return { status: true, resultado: { simsimi: response11.result }};        
    } catch (error1) {  
    try {
        const response1 = await axios.get(`https://deliriusapi-official.vercel.app/tools/simi?text=${encodeURIComponent(ask)}`);
        const trad1 = await translate(`${response1.data.data.message}`, {to: language, autoCorrect: true});
        if (trad1.text == 'indefinida' || response1 == '' || !response1.data) trad1 = XD // Se usa "XD" para causar error y usar otra opción.  
        return { status: true, resultado: { simsimi: trad1.text }};        
    } catch {
        try {
            const response2 = await axios.get(`https://api.anbusec.xyz/api/v1/simitalk?apikey=${apikeyyy}&ask=${ask}&lc=${language}`);
            return { status: true, resultado: { simsimi: response2.data.message }};       
        } catch (error2) {
            return { status: false, resultado: { msg: "Todas las API's fallarón. Inténtalo de nuevo más tarde.", error: error2.message }};
        }
    }
}}
