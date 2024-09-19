import fetch from 'node-fetch'; 

let handler = async function (m, { text }) {

  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.BK9.BK9

  try {
    if (!text) {
      m.reply(`${tradutor.bk9LText_T}`);
      return;
    }
    const [link, alias] = text.split("+").map(part => part.trim());
    let apiUrl = `https://bk9.site/api/create?url=${encodeURIComponent(link)}`;
    if (alias) apiUrl += `&alias=${encodeURIComponent(alias)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.BK99) {
      return m.reply(`${tradutor.bk9LTaked_T}`);
    }
    const shortURL = result.BK9;
    return m.reply(`${shortURL}`);
  } catch (error) {
    console.error(error);
    return m.reply(`${tradutor.bk9err}`);
  }
};

handler.command = ['bk9short'];
handler.tags = ['tools'];
export default handler;
