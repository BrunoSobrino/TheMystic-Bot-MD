import axios from 'axios';

const owner = 'BrunoSobrino';
const repo = 'TheMystic-Bot-MD';
const handler = async (m, {conn, text, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.owner_actualizacion

  conn.sendMessage(m.chat, {text: tradutor.texto1}, {quoted: m});
  // Una sola consulta por cada uso del comando: antes se creaba un
  // setInterval de 6 s en cada invocación (sin limpiar nunca) que
  // consultaba GitHub sin token hasta agotar el rate limit y enviaba
  // el error una y otra vez.
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`);
    const latest = response.data?.[0];
    if (!latest) return m.reply(tradutor.texto3);
    const {sha, commit: {message}, html_url, author} = latest;
    const login = author?.login || 'desconocido';
    conn.sendMessage(m.chat, {text: `${tradutor.texto2[0]} ${html_url}\n${tradutor.texto2[1]} ${message}\n${tradutor.texto2[2]} ${login}`}, {quoted: m});
  } catch (error) {
    console.error(error);
    m.reply(tradutor.texto3);
  }
};
handler.command = /^(actualizacion|actualizaciones)/i;
handler.rowner = true;
export default handler;
