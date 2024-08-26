import {search, download} from 'aptoide-scraper';

const handler = async (m, {conn, usedPrefix: prefix, command, text}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_modapk


 if (!text) throw `${tradutor.texto1}`;
  try {    
    const searchA = await search(text);
    const data5 = await download(searchA[0].id);
    let response = `${tradutor.texto2[0]} ${data5.name}\n${tradutor.texto2[1]}* ${data5.package}\n${tradutor.texto2[2]} ${data5.lastup}\n${tradutor.texto2[3]} ${data5.size}`
    await conn.sendMessage(m.chat, {image: {url: data5.icon}, caption: response}, {quoted: m});
 if (data5.size.includes('GB') || data5.size.replace(' MB', '') > 999) {
      return await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m});
    }
    await conn.sendMessage(m.chat, {document: {url: data5.dllink}, mimetype: 'application/vnd.android.package-archive', fileName: data5.name + '.apk', caption: null}, {quoted: m});
  } catch {
    throw `${tradutor.texto4}`;
  }    
};
handler.command = /^(apkmod|modapk|dapk2|aptoide|aptoidedl)$/i;
export default handler;
