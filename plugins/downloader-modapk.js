import axios from 'axios';

const handler = async (m, { conn, text }) => {

  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_modapk

 if (!text) throw `${tradutor.texto1}`;

  const query = text.trim();

  try {
    const response = await axios.get(`https://api.stellarwa.xyz/search/apk?query=${query}`);
    const data = response.data.data;

    if (data.name && data.dl) {
      let response = `${tradutor.texto2[0]} ${data.name}\n${tradutor.texto2[1]}* ${data.lastUpdated}\n${tradutor.texto2[2]} ${data.lastup}\n${tradutor.texto2[3]} ${data.size}`
            await conn.sendMessage(m.chat, {
        image: { url: data.banner },
        caption: response
      }, { quoted: m });

      await conn.sendMessage(m.chat, {
        document: { url: data.dl },
        fileName: `${data.name}.apk`,
        mimetype: 'application/vnd.android.package-archive',
        caption: "The Mystic • BrunoSobrino"
      }, { quoted: m });

    } else {
      throw `${tradutor.texto4}`;
    }
  } catch (error) {
    await m.reply(`[ ❗ ] *Fail:* ${error}`);
  }
};

handler.help = ['aptoide', 'apk', 'apkdl'];
handler.tags = ['search'];
handler.command = ['aptoide', 'apk', 'apkdl'];

export default handler;