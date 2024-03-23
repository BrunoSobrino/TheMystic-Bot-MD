import fetch from 'node-fetch';
import {format} from 'util';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_fetch_get
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {text}) => {
  if (!/^https?:\/\//.test(text)) throw tradutor.texto1;
  const _url = new URL(text);
  const url = global.API(_url.origin, _url.pathname, Object.fromEntries(_url.searchParams.entries()), 'APIKEY');
  const res = await fetch(url);
  if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
    // delete res
    throw `Content-Length: ${res.headers.get('content-length')}`;
  }
  if (!/text|json/.test(res.headers.get('content-type'))) return conn.sendFile(m.chat, url, 'file', text, m);
  let txt = await res.buffer();
  try {
    txt = format(JSON.parse(txt + ''));
  } catch (e) {
    txt = txt + '';
  } finally {
    m.reply(txt.slice(0, 65536) + '');
  }
};
handler.help = ['fetch', 'get'].map((v) => v + ' <url>');
handler.tags = ['internet'];
handler.command = /^(fetch|get)$/i;
handler.rowner = true;
export default handler;
