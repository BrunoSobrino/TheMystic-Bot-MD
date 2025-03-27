const handler = async (m, { conn, text, usedPrefix, command }) => {
const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje;
const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));const tradutor = _translate.plugins.downloader_imagen;

if (!text) return m.reply(`${tradutor.texto1} ${usedPrefix + command} Minecraft*`);

const api = await axios.get(`${global.BASE_API_DELIRIUS}/search/gimage?query=${text}`);
const data = api.data.data;
const random = Math.floor(Math.random() * data.length);
const image = data[random];

conn.sendFile(m.chat, image.url, 'error.jpg', `${tradutor.texto2[0]} ${text}\n${tradutor.texto2[1]} ${image.origin.website.url}\n${tradutor.texto2[2]}`, m);
};

handler.help = ['gimage <query>', 'imagen <query>'];
handler.tags = ['internet', 'tools'];
handler.command = /^(gimage|image|imagen)$/i;

export default handler;
