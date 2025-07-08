import axios from 'axios';

const handler = async (m, { conn, text }) => {

  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_modapk

  if (!text) {
     throw `${tradutor.texto1}`;
  }

  const query = text.trim();

  try {
    const response = await axios.get(`https://api.stellarwa.xyz/search/apk?query=${query}`);
    const data = response.data.data;

    if (data.name && data.dl) {
      const formattedMessage = `${tradutor.texto2[0]} ${data5.name}\n${tradutor.texto2[1]}* ${data5.package}\n${tradutor.texto2[2]} ${data.lastUpdated}\n${tradutor.texto2[3]} ${data5.size}`.trim();

            await conn.sendMessage(m.chat, {
        image: { url: data.banner },
        caption: formattedMessage
      }, { quoted: m });

      await conn.sendMessage(m.chat, {
        document: { url: data.dl },
        fileName: `${data.name}.apk`,
        mimetype: 'application/vnd.android.package-archive'
      }, { quoted: m });

    } else {
      throw `${tradutor.texto4}`;
    }
  } catch (error) {
    await m.reply(`[ ❗ ] *Fail:* ${error}`);
  }
};

handler.help = ['apk'];
handler.tags = ['search'];
handler.command = /^(apk|apkmod|modapk|dapk2|aptoide|aptoidedl)$/i;

export default handler;