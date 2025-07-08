import axios from 'axios';

const handler = async (m, { conn, args }) => {

  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_modapk

  const query = args[0];

  if (!query) {
     throw `${tradutor.texto1}`;
  }

  try {
    const response = await axios.get(`https://api.stellarwa.xyz/search/apk?query=${query}`);
    const data5 = response.data.data;

    if (data5.name && data5.dl) {
      const formattedMessage = `${tradutor.texto2[0]} ${data5.name}\n${tradutor.texto2[1]}* ${data5.package}\n${tradutor.texto2[2]} ${data5.lastUpdated}\n${tradutor.texto2[3]} ${data5.size}`.trim();

            await conn.sendMessage(m.chat, {
        image: { url: data5.banner },
        caption: formattedMessage
      }, { quoted: m });

      await conn.sendMessage(m.chat, {
        document: { url: data5.dl },
        fileName: `${data5.name}.apk`,
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