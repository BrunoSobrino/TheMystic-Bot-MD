import axios from 'axios';

const handler = async (m, { conn, text }) => {

  if (!text) {
    return conn.reply(m.chat, `✧ Ingresa el nombre de la aplicación que quieras descargar.`, m);
  }

  const query = text.trim();

  try {
    const response = await axios.get(`https://api.stellarwa.xyz/search/apk?query=${query}`);
    const data = response.data.data;

    if (data.name && data.dl) {
      const formattedMessage = `
❀ *Descargando ›* ${data.name}

➭ *Package ›* ${data.package}
> ✩ *Última actualización ›* ${data.lastUpdated}
> ✩ *Peso ›* ${data.size}`.trim();

            await conn.sendMessage(m.chat, {
        image: { url: data.banner },
        caption: formattedMessage
      }, { quoted: m });

      await conn.sendMessage(m.chat, {
        document: { url: data.dl },
        fileName: `${data.name}.apk`,
        mimetype: 'application/vnd.android.package-archive',
        caption: ""
      }, { quoted: m });

    } else {
      await conn.reply(m.chat, `✎ No se encontró la aplicación solicitada.`, m);
    }
  } catch (error) {
    await m.reply(`${error}`);
  }
};

handler.help = ['aptoide', 'apk', 'apkdl'];
handler.tags = ['search'];
handler.command = ['aptoide', 'apk', 'apkdl'];

export default handler;