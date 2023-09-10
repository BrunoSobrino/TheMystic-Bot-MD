import fetch from 'node-fetch';
import {JSDOM} from 'jsdom';
const handler = async (m, {conn, text}) => {
  conn.reply(m.chat, Object.entries(await stylizeText(text ? text : m.quoted && m.quoted.text ? m.quoted.text : m.text)).map(([name, value]) => `*${name}*\n${value}`).join`\n\n`, m);
};
handler.help = ['style'].map((v) => v + ' <text>');
handler.tags = ['tools'];
handler.command = /^(style(text)?)$/i;
handler.exp = 0;
export default handler;

async function stylizeText(text) {
  const res = await fetch('http://qaz.wtf/u/convert.cgi?text=' + encodeURIComponent(text));
  const html = await res.text();
  const dom = new JSDOM(html);
  const table = dom.window.document.querySelector('table').children[0].children;
  const obj = {};
  for (const tr of table) {
    const name = tr.querySelector('.aname').innerHTML;
    const content = tr.children[1].textContent.replace(/^\n/, '').replace(/\n$/, '');
    obj[name + (obj[name] ? ' Reversed' : '')] = content;
  }
  return obj;
}
