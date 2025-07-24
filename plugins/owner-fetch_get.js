import fetch from 'node-fetch';
import {format} from 'util';


const handler = async (m, {text}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.owner_fetch_get

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
