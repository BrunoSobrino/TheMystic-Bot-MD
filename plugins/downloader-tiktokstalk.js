import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_tiktokstalk

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
