/* -------------------------------------------------------*/
/* [❗]                      [❗]                      [❗] */
/*                                                       */
/*       |- [ ⚠ ] - CREDITOS DEL CODIGO - [ ⚠ ] -|      */
/*     —◉ DESAROLLADO POR OTOSAKA:                       */
/*     ◉ Otosaka (https://github.com/6otosaka9)          */
/*     ◉ Número: wa.me/51993966345                       */
/*                                                       */
/*     —◉ FT:                                            */
/*     ◉ BrunoSobrino (https://github.com/BrunoSobrino)  */
/*                                                       */
/* [❗]                      [❗]                      [❗] */
/* -------------------------------------------------------*/
import fetch from 'node-fetch';
import gtts from 'node-gtts';
import {readFileSync, unlinkSync} from 'fs';
import {join} from 'path';
import axios from 'axios';
import translate from '@vitalets/google-translate-api';
import {Configuration, OpenAIApi} from 'openai';

const configuration = new Configuration({organization: global.openai_org_id, apiKey: global.openai_key});
const openaiii = new OpenAIApi(configuration);
const idioma = 'es'
//const sistema1 = await fetch(`https://raw.githubusercontent.com/Skidy89/chat-gpt-jailbreak/main/Text.txt`).then(v => v.text());

const handler = async (m, {conn, text, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas_chatgptvoz

  const sistema1 = tradutor.texto2;

  if (usedPrefix == 'a' || usedPrefix == 'A') return;
  if (!text) throw `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]} ${usedPrefix + command} ${tradutor.texto1[2]}`;
  try {
        conn.sendPresenceUpdate('composing', m.chat);
        async function getOpenAIChatCompletion(texto) {
        const openaiAPIKey = global.openai_key;
        let chgptdb = global.chatgpt.data.users[m.sender];
        chgptdb.push({ role: 'user', content: texto });
        const url = "https://api.openai.com/v1/chat/completions";
        const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${openaiAPIKey}` };
        const data = { "model": "gpt-3.5-turbo", "messages": [{ "role": "system", "content": sistema1 }, ...chgptdb, ]};
        const response = await fetch(url, {method: "POST", headers: headers, body: JSON.stringify(data)});
        const result = await response.json();
        const finalResponse = result.choices[0].message.content;
        return finalResponse;
        };
        let respuesta = await getOpenAIChatCompletion(text);
        if (respuesta == 'error' || respuesta == '' || !respuesta) return XD; // causar error undefined para usar otra api
        const audio1 = await tts(respuesta, idioma);
        await conn.sendMessage(m.chat, {audio: audio1, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});
    } catch {
      try {
        conn.sendPresenceUpdate('composing', m.chat);
        const botIA222 = await openaiii.createCompletion({model: 'text-davinci-003', prompt: text, temperature: 0.3, max_tokens: 4097, stop: ['Ai:', 'Human:'], top_p: 1, frequency_penalty: 0.2, presence_penalty: 0});
        if (botIA222.data.choices[0].text == 'error' || botIA222.data.choices[0].text == '' || !botIA222.data.choices[0].text) return XD; // causar error undefined para usar otra api
        const audio2 = await tts(botIA222.data.choices[0].text, idioma);
        await conn.sendMessage(m.chat, {audio: audio2, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});    
    } catch {
      try {
        conn.sendPresenceUpdate('composing', m.chat);
        const fgapi1 = await fetch(`https://api-fgmods.ddns.net/api/info/openai?text=${text}&symsg=${sistema1}&apikey=XlwAnX8d`);
        const fgjson1 = await fgapi1.json();
        if (fgjson1.result == 'error' || fgjson1.result == '' || !fgjson1.result) return XD; // causar error undefined para lanzar msg de error
        const audio3 = await tts(fgjson1.result, idioma);
        await conn.sendMessage(m.chat, {audio: audio3, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});    
    } catch {
      try {
        conn.sendPresenceUpdate('composing', m.chat);
        const vihangayt1 = await fetch(`https://vihangayt.me/tools/chatgpt?q=${text}`);
        const vihangaytjson1 = await vihangayt1.json();
        if (vihangaytjson1.data == 'error' || vihangaytjson1.data == '' || !vihangaytjson1.data) return XD; // causar error undefined para usar otra api
        const audio4 = await tts(vihangaytjson1.data, idioma);
        await conn.sendMessage(m.chat, {audio: audio4, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});            
    } catch {
      try {
        conn.sendPresenceUpdate('composing', m.chat);
        const vihangayt2 = await fetch(`https://vihangayt.me/tools/chatgpt2?q=${text}`);
        const vihangaytjson2 = await vihangayt2.json();
        if (vihangaytjson2.data == 'error' || vihangaytjson2.data == '' || !vihangaytjson2.data) return XD; // causar error undefined para usar otra api
        const audio5 = await tts(vihangaytjson2.data, idioma);
        await conn.sendMessage(m.chat, {audio: audio5, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});            
    } catch {
      try {
        conn.sendPresenceUpdate('composing', m.chat);
        const vihangayt3 = await fetch(`https://vihangayt.me/tools/chatgpt3?q=${text}`);
        const vihangaytjson3 = await vihangayt3.json();
        if (vihangaytjson3.data == 'error' || vihangaytjson3.data == '' || !vihangaytjson3.data) return XD; // causar error undefined para usar otra api
        const audio6 = await tts(vihangaytjson3.data, idioma);
        await conn.sendMessage(m.chat, {audio: audio6, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});            
    } catch {
      try {
        conn.sendPresenceUpdate('composing', m.chat);
        const tioress22 = await fetch(`https://api.lolhuman.xyz/api/openai?apikey=${lolkeysapi}&text=${text}&user=${m.sender}`);
        const hasill22 = await tioress22.json();
        if (hasill22.result == 'error' || hasill22.result == '' || !hasill22.result) return XD; // causar error undefined para usar otra api
        const hasill22_result = await translate(`${hasill22.result}`, {to: idioma, autoCorrect: true});
        const audio7 = await tts(hasill22_result.text, idioma);
        await conn.sendMessage(m.chat, {audio: audio7, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});            
    } catch {
      try {
        conn.sendPresenceUpdate('composing', m.chat);
        const searchString2 = ' Indonesia ';
        const replacementString2 = ' español ';
        const rres = await fetch(`https://api.ibeng.tech/api/others/chatgpt?q=Hola&apikey=eMlBNRzUXv`);
        const jjson = await rres.json();
        if (jjson.data == 'error' || jjson.data == '' || !jjson.data) return XD; // causar error undefined para usar otra api
        const hahaha = await translate(`${jjson.data}`, {to: idioma, autoCorrect: true});
        const sextS = hahaha.text;
        const replacedText = sextS.replace(searchString2, replacementString2).trim();
        const audio8 = await tts(replacedText, idioma);
        await conn.sendMessage(m.chat, {audio: audio8, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});            
    } catch {
      try {
        conn.sendPresenceUpdate('composing', m.chat);
        const akuariapi2 = await fetch(`https://api.akuari.my.id/ai/gpt?chat=${text}`);
        const akuariapijson2 = await akuariapi2.json();
        if (akuariapijson2.respon == 'error' || akuariapijson2.respon == '' || !akuariapijson2.respon) return XD; // causar error undefined para lanzar msg de error
        const akuariapiresult2 = await translate(`${akuariapijson2.respon}`, {to: 'es', autoCorrect: true});
        const audio9 = await tts(akuariapiresult2.text, idioma);
        await conn.sendMessage(m.chat, {audio: audio9, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});                   
    } catch {
      try {
        conn.sendPresenceUpdate('composing', m.chat);
        const akuariapi1 = await fetch(`https://api.akuari.my.id/ai/gbard?chat=${text}`);
        const akuariapijson1 = await akuariapi1.json();
        if (akuariapijson1.respon == 'error' || akuariapijson1.respon == '' || !akuariapijson1.respon) return XD; // causar error undefined para usar otra api
        const akuariapiresult1 = await translate(`${akuariapijson1.respon}`, {to: 'es', autoCorrect: true});
        const audio10 = await tts(akuariapiresult1.text, idioma);
        await conn.sendMessage(m.chat, {audio: audio10, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});                           
    } catch {
        throw tradutor.texto3;
     }}
    }}
   }}
  }}
 }}
};
handler.command = /^(openaivoz|chatgptvoz|iavoz|robotvoz|openai2voz|chatgpt2voz|ia2voz|robot2voz|Mysticvoz|MysticBotvoz|gptvoz|ai_voz|ai_voce)$/i;
export default handler;

async function tts(text = 'error', lang = 'es') {
  return new Promise((resolve, reject) => {
    try {
      const tts = gtts(lang);
      const filePath = join(global.__dirname(import.meta.url), '../tmp', (1 * new Date) + '.wav');
      tts.save(filePath, text, () => {
        resolve(readFileSync(filePath));
        unlinkSync(filePath);
      });
    } catch (e) {
      reject(e);
    }
  });
}

