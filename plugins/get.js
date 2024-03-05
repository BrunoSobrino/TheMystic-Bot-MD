import got from 'got';
import fetch from 'node-fetch';
import axios from 'axios';
import { format } from 'util';

const MAX_CONTENT_SIZE = 100 * 1024 * 1024 * 1024; // 100GB

let handler = async (m, { text }) => {
  if (!text) throw '*Masukkan Link*\n*Ex:* s.id';

  text = addHttpsIfNeeded(text);
  let { href: url, origin } = new URL(text);
  let response, txt;

  try {
    response = await got(url, { headers: { 'referer': origin } });
    txt = response.body;
  } catch {
    try {
      response = await fetch(url, { headers: { 'referer': origin } });
      txt = await response.text();
    } catch {
      try {
        response = await axios.get(url, { headers: { 'referer': origin } });
        txt = response.data;
      } catch {
        throw "Gagal mengambil data dari semua sumber";
      }
    }
  }

  const contentLength = response.headers['content-length'];
  if (contentLength > MAX_CONTENT_SIZE) {
    return m.reply(`File terlalu besar. Ukuran maksimum adalah ${formatSize(MAX_CONTENT_SIZE)}`);
  }

  if (!/text|json/.test(response.headers['content-type'])) {
    return conn.sendFile(m.chat, url,  author, m);
  }

  try {
    txt = format(JSON.parse(txt + ''));
  } catch {
    txt = txt + '';
  } finally {
    m.reply(txt.slice(0, 65536) + '');
  }
};

function addHttpsIfNeeded(link) {
  if (!/^https?:\/\//i.test(link)) {
    link = "https://" + link;
  }
  return link;
}

function formatSize(size) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (size >= 1024 && i < 4) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

handler.help = ['fetch'];
handler.tags = ['tools'];
handler.alias = ['get', 'fetch'];
handler.command = /^(fetch|get)$/i;

export default handler;
