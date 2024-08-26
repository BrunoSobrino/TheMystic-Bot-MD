/* ---------------------------------------------------------------------------------------
  🍀 • By https://github.com/ALBERTO9883
  🍀 • ⚘Alberto Y Ashly⚘
-----------------------------------------------------------------------------------------*/


const handler = async (m, {conn, text, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas_nowa

  const regex = /x/g;
  if (!text) throw tradutor.texto1;
  if (!text.match(regex)) throw `${tradutor.texto2} ${usedPrefix + command} 521999340434x*`;
  const random = text.match(regex).length; const total = Math.pow(10, random); const array = [];
  for (let i = 0; i < total; i++) {
    const list = [...i.toString().padStart(random, '0')];
    const result = text.replace(regex, () => list.shift()) + '@s.whatsapp.net';
    if (await conn.onWhatsApp(result).then((v) => (v[0] || {}).exists)) {
      const info = await conn.fetchStatus(result).catch((_) => {});
      array.push({exists: true, jid: result, ...info});
    } else {
      array.push({exists: false, jid: result});
    }
  }
  const txt = tradutor.texto3[0] + array.filter((v) => v.exists).map((v) => `${tradutor.texto3[1]} wa.me/${v.jid.split('@')[0]}\n${tradutor.texto3[2]} ${v.status || tradutor.texto3[3]}\n${tradutor.texto3[4]} ${formatDate(v.setAt)}`).join('\n\n') + tradutor.texto3[5] + array.filter((v) => !v.exists).map((v) => v.jid.split('@')[0]).join('\n');
  m.reply(txt);
};
handler.command = /^nowa$/i;
export default handler;
function formatDate(n, locale = 'id') {
  const d = new Date(n);
  return d.toLocaleDateString(locale, {timeZone: 'Asia/Jakarta'});
}
