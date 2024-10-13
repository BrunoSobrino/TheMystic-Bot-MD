import fetch from 'node-fetch';



const handler = async (m, {conn, usedPrefix, usedPrefix: _p}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.menu_anime

  try {
    const pp = imagen2;
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    const str = `╭═══〘 ✯✯✯✯✯✯✯✯✯ 〙══╮
║    ◉— *𝐓𝐡𝐞 𝐌𝐲𝐬𝐭𝐢𝐜 - 𝐁𝐨𝐭* —◉
║≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡║
║➤ ${tradutor.texto1[1]}, ${taguser}*
╰═══╡✯✯✯✯✯✯✯✯✯╞═══╯

┏━━━━━━━━━━━━━━━━┓
┃ *< ${tradutor.texto1[0]} />*
┃≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡┃
┣ ඬ⃟ 🧿 _${usedPrefix}lolivid_
┣ ඬ⃟ 🧿 _${usedPrefix}loli_
┣ ඬ⃟ 🧿 _${usedPrefix}ppcouple_
┣ ඬ⃟ 🧿 _${usedPrefix}neko_
┣ ඬ⃟ 🧿 _${usedPrefix}waifu_
┣ ඬ⃟ 🧿 _${usedPrefix}akira_
┣ ඬ⃟ 🧿 _${usedPrefix}akiyama_
┣ ඬ⃟ 🧿 _${usedPrefix}anna_
┣ ඬ⃟ 🧿 _${usedPrefix}asuna_
┣ ඬ⃟ 🧿 _${usedPrefix}ayuzawa_
┣ ඬ⃟ 🧿 _${usedPrefix}boruto_
┣ ඬ⃟ 🧿 _${usedPrefix}chiho_
┣ ඬ⃟ 🧿 _${usedPrefix}chitoge_
┣ ඬ⃟ 🧿 _${usedPrefix}deidara_
┣ ඬ⃟ 🧿 _${usedPrefix}erza_
┣ ඬ⃟ 🧿 _${usedPrefix}elaina_
┣ ඬ⃟ 🧿 _${usedPrefix}eba_
┣ ඬ⃟ 🧿 _${usedPrefix}emilia_
┣ ඬ⃟ 🧿 _${usedPrefix}hestia_
┣ ඬ⃟ 🧿 _${usedPrefix}hinata_
┣ ඬ⃟ 🧿 _${usedPrefix}inori_
┣ ඬ⃟ 🧿 _${usedPrefix}isuzu_
┣ ඬ⃟ 🧿 _${usedPrefix}itachi_
┣ ඬ⃟ 🧿 _${usedPrefix}itori_
┣ ඬ⃟ 🧿 _${usedPrefix}kaga_
┣ ඬ⃟ 🧿 _${usedPrefix}kagura_
┣ ඬ⃟ 🧿 _${usedPrefix}kaori_
┣ ඬ⃟ 🧿 _${usedPrefix}keneki_
┣ ඬ⃟ 🧿 _${usedPrefix}kotori_
┣ ඬ⃟ 🧿 _${usedPrefix}kurumi_
┣ ඬ⃟ 🧿 _${usedPrefix}madara_
┣ ඬ⃟ 🧿 _${usedPrefix}mikasa_
┣ ඬ⃟ 🧿 _${usedPrefix}miku_
┣ ඬ⃟ 🧿 _${usedPrefix}minato_
┣ ඬ⃟ 🧿 _${usedPrefix}naruto_
┣ ඬ⃟ 🧿 _${usedPrefix}nezuko_
┣ ඬ⃟ 🧿 _${usedPrefix}sagiri_
┣ ඬ⃟ 🧿 _${usedPrefix}sasuke_
┣ ඬ⃟ 🧿 _${usedPrefix}sakura_
┣ ඬ⃟ 🧿 _${usedPrefix}cosplay_
┗━━━━━━━━━━━━━━━━┛`.trim();
    if (m.isGroup) {
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: global.fkontak});
    } else {
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: global.fkontak});
    }
  } catch {
    conn.reply(m.chat, tradutor.texto1[3], m);
  }
};
handler.command = /^(animes|menuanimes)$/i;
handler.exp = 50;
handler.fail = null;
export default handler;
