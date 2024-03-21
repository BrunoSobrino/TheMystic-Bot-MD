import fetch from 'node-fetch';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.downloader_tiktokstalk
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.


const handler = async (m, {conn, text}) => {
  if (!text) return conn.reply(m.chat, tradutor.texto1, m);
  try {
    const res = await fetch(`https://api.lolhuman.xyz/api/stalktiktok/${text}?apikey=${lolkeysapi}`);
    const res2 = `https://api.lolhuman.xyz/api/pptiktok/${text}?apikey=${lolkeysapi}`;
    const json = await res.json();
    if (res.status !== 200) throw await res.text();
    if (!json.status) throw json;
    const thumb = await (await fetch(json.result.user_picture)).buffer();
    const Mystic = `
${tradutor.texto2[0]} ${json.result.username}
${tradutor.texto2[1]}  ${json.result.nickname}
${tradutor.texto2[2]}  ${json.result.followers}
${tradutor.texto2[3]}  ${json.result.followings}
${tradutor.texto2[4]}  ${json.result.likes}
${tradutor.texto2[5]}  ${json.result.video}
${tradutor.texto2[6]}  ${json.result.bio}
`.trim();
    conn.sendFile(m.chat, res2, 'error.jpg', Mystic, m, false);
  } catch (e) {
    throw tradutor.texto3;
  }
};
handler.help = ['tiktokstalk'].map((v) => v + ' <username>');
handler.tags = ['stalk'];
handler.command = /^(tiktokstalk|ttstalk)$/i;
export default handler;
