import fetch from 'node-fetch';


const handler = async (m, {conn, usedPrefix, usedPrefix: _p, __dirname, text, isPrems}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.menu_anime

  try {
    const pp = imagen2;
    // let vn = './media/menu.mp3'
    const d = new Date(new Date + 3600000);
    const locale = 'es';
    const week = d.toLocaleDateString(locale, {weekday: 'long'});
    const date = d.toLocaleDateString(locale, {day: 'numeric', month: 'long', year: 'numeric'});
    const _uptime = process.uptime() * 1000;
    const uptime = clockString(_uptime);
    const user = global.db.data.users[m.sender];
    const {money, joincount} = global.db.data.users[m.sender];
    const {exp, limit, level, role} = global.db.data.users[m.sender];
    const rtotalreg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
    const more = String.fromCharCode(8206);
    const readMore = more.repeat(850);
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const document = doc[Math.floor(Math.random() * doc.length)];
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
      // await conn.sendFile(m.chat, vn, 'menu.mp3', null, m, true, { type: 'audioMessage', ptt: true})
      const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: fkontak2});
    } else {
      // await conn.sendFile(m.chat, vn, 'menu.mp3', null, m, true, { type: 'audioMessage', ptt: true})
      const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: fkontak2});
    }
  } catch {
    conn.reply(m.chat, tradutor.texto1[3], m);
  }
};
handler.command = /^(animes|menuanimes)$/i;
handler.exp = 50;
handler.fail = null;
export default handler;
function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(':');
}
