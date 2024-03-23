// adartado por Diego (Aka: un ladrón de código)

import axios from 'axios';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_actualizacion
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

let previousCommitSHA = '';
let previousUpdatedAt = '';
let previousCommitUser = ''; 
const owner = 'BrunoSobrino';
const repo = 'TheMystic-Bot-MD';
const handler = async (m, {conn, text, usedPrefix, command}) => {
 conn.sendMessage(m.chat, {text: tradutor.texto1}, {quoted: m});  
try {
  async function checkRepoUpdates() {
    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`);
      const {sha, commit: {message}, html_url, author: { login } } = response.data[0];

      if (sha !== previousCommitSHA || message !== previousUpdatedAt) {
        previousCommitSHA = sha;
        previousUpdatedAt = message;
        previousCommitUser = login
        conn.sendMessage(m.chat, {text: `${tradutor.texto2[0]} ${html_url}\n${tradutor.texto2[1]} ${message}\n${tradutor.texto2[2]} ${login}`}, {quoted: m});
      }
    } catch (error) {
      console.error(error)
      m.reply(tradutor.texto3);
    }
  }
  setInterval(checkRepoUpdates, 6000);
} catch (e) {
m.reply(e)
}
};
handler.command = /^(actualizacion|actualizaciones)/i;
handler.rowner = true;
export default handler;
