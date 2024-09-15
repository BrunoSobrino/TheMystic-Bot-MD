

const handler = async (m, {conn}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.rpg_berburu_casar

  const user = global.db.data.users[m.sender];
  const randomaku1 = `${Math.floor(Math.random() * 5)}`;
  const randomaku2 = `${Math.floor(Math.random() * 5)}`;
  const randomaku4 = `${Math.floor(Math.random() * 5)}`;
  const randomaku3 = `${Math.floor(Math.random() * 5)}`;
  const randomaku5 = `${Math.floor(Math.random() * 5)}`;
  const randomaku6 = `${Math.floor(Math.random() * 5)}`;
  const randomaku7 = `${Math.floor(Math.random() * 5)}`;
  const randomaku8 = `${Math.floor(Math.random() * 5)}`;
  const randomaku9 = `${Math.floor(Math.random() * 5)}`;
  const randomaku10 = `${Math.floor(Math.random() * 5)}`;
  const randomaku11 = `${Math.floor(Math.random() * 5)}`;
  const randomaku12 = `${Math.floor(Math.random() * 5)}`.trim();
  const rbrb1 = (randomaku1 * 1);
  const rbrb2 = (randomaku2 * 1);
  const rbrb3 = (randomaku3 * 1);
  const rbrb4 = (randomaku4 * 1);
  const rbrb5 = (randomaku5 * 1);
  const rbrb6 = (randomaku6 * 1);
  const rbrb7 = (randomaku7 * 1);
  const rbrb8 = (randomaku8 * 1);
  const rbrb9 = (randomaku9 * 1);
  const rbrb10 = (randomaku10 * 1);
  const rbrb11 = (randomaku11 * 1);
  const rbrb12 = (randomaku12 * 1);
  const anti1 = `${rbrb1}`;
  const anti2 = `${rbrb2}`;
  const anti3 = `${rbrb3}`;
  const anti4 = `${rbrb4}`;
  const anti5 = `${rbrb5}`;
  const anti6 = `${rbrb6}`;
  const anti7 = `${rbrb7}`;
  const anti8 = `${rbrb8}`;
  const anti9 = `${rbrb9}`;
  const anti10 = `${rbrb10}`;
  const anti11 = `${rbrb11}`;
  const anti12 = `${rbrb12}`;
  const ar1 = `${['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'].getRandom()}`;
  const ar2 = `${['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'].getRandom()}`;
  const ar3 = `${['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'].getRandom()}`;
  const ar4 = `${['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'].getRandom()}`;
  const ar5 = `${['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'].getRandom()}`;
  const ar6 = `${['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'].getRandom()}`;
  const ar7 = `${['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'].getRandom()}`;
  const ar8 = `${['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'].getRandom()}`;
  const ar9 = `${['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'].getRandom()}`;
  const ar10 = `${['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'].getRandom()}`;
  const ar11 = `${['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'].getRandom()}`;
  const ar12 = `${['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'].getRandom()}`;
  const hsl = `
*✧ Resultados de la caza ${conn.getName(m.sender)} ✧*

 *🐂 ${ar1} ${anti1}*			 *🐃 ${ar7} ${anti7}*
 *🐅 ${ar2} ${anti2}*			 *🐮 ${ar8} ${anti8}*
 *🐘 ${ar3} ${anti3}*			 *🐒 ${ar9} ${anti9}*
 *🐐 ${ar4} ${anti4}*			 *🐗 ${ar10} ${anti10}*
 *🐼 ${ar5} ${anti5}*			 *🐖 ${ar11} ${anti11}*
 *🐊 ${ar6} ${anti6}*		    *🐓 ${ar12} ${anti12}*`.trim();
  global.db.data.users[m.sender].banteng += rbrb1;
  global.db.data.users[m.sender].harimau += rbrb2;
  global.db.data.users[m.sender].gajah += rbrb3;
  global.db.data.users[m.sender].kambing += rbrb4;
  global.db.data.users[m.sender].panda += rbrb5;
  global.db.data.users[m.sender].buaya += rbrb6;
  global.db.data.users[m.sender].kerbau += rbrb7;
  global.db.data.users[m.sender].sapi += rbrb8;
  global.db.data.users[m.sender].monyet += rbrb9;
  global.db.data.users[m.sender].babihutan += rbrb10;
  global.db.data.users[m.sender].babi += rbrb11;
  global.db.data.users[m.sender].ayam += rbrb12;

  const time = global.db.data.users[m.sender].lastberburu + 2700000; // 45 Minutos
  if (new Date - global.db.data.users[m.sender].lastberburu < 2700000) return conn.reply(m.chat, `${tradutor.texto1} ${clockString(time - new Date())}\n${wm}`, m);
  // conn.sendButton(m.chat, `𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝙳𝙴𝚂𝙲𝙰𝙽𝚂𝙰 𝚄𝙽 𝙼𝙾𝙼𝙴𝙽𝚃𝙾 𝙿𝙰𝚁𝙰 𝚂𝙴𝙶𝚄𝙸𝚁 𝙲𝙰𝚉𝙰𝙽𝙳𝙾`, `⫹⫺ 𝚃𝙸𝙴𝙼𝙿𝙾 ${clockString(time - new Date())}\n${wm}`, null, [['🏞️ 𝙰𝙽𝙸𝙼𝙰𝙻𝙴𝚂 𝙲𝙰𝙿𝚃𝚄𝚁𝙰𝙳𝙾𝚂 ', '.kandang'],[`🎒 𝙸𝙽𝚅𝙴𝙽𝚃𝙰𝙴𝚁𝙸𝙾`, `.inventario`]], m)

  setTimeout(() => {
    conn.reply(m.chat, hsl, m);
    // conn.sendButton(m.chat, hsl, wm, null, [['🔗 𝙶𝙸𝚃𝙷𝚄𝙱 🔗', '#script']], null)
    /* conn.sendHydrated(m.chat, hsl, wm, null, md, `𝙶𝙸𝚃𝙷𝚄𝙱`, null, null, [
[null, null]], null)*/
  }, 20000);

  setTimeout(() => {
    conn.reply(m.chat, `@${m.sender.split('@s.whatsapp.net')[0]} *${[tradutor.texto2[0], tradutor.texto2[1], tradutor.texto2[2], tradutor.texto2[3]].getRandom()}*`, null, {mentions: [m.sender]});
  }, 18000);
  // conn.sendHydrated(m.chat, `${conn.getName(m.sender)} *${['OBJETIVO FIJADO`${conn.getName(m.sender)} *${['OBJETIVO FIJADO 🎯','Carnada en Marcha 🍫 🍇 🍖','ANIMALES DETECTADOS!! 🐂 🐅 🐘 🐼','ANIMALES DETECTADOS!! 🐖 🐃 🐮 🐒'].getRandom()}*` 🎯','Carnada en Marcha 🍫 🍇 🍖','ANIMALES DETECTADOS!! 🐂 🐅 🐘 🐼','ANIMALES DETECTADOS!! 🐖 🐃 🐮 🐒'].getRandom()}*`, wm, null, null, null, null, null, [
  // [null, null]], null)}, 18000)

  setTimeout(() => {
    conn.reply(m.chat, `@${m.sender.split('@s.whatsapp.net')[0]} *${[tradutor.texto3[0], tradutor.texto3[1], tradutor.texto3[2], tradutor.texto3[3]].getRandom()}*`, null, {mentions: [m.sender]});
  }, 15000);
  // conn.sendHydrated(m.chat, `${conn.getName(m.sender)} *${['Armas lista para la Caza!!','Probando Armas 🔫 💣 🪓 🏹','CARROS PARA LA CAZA!! 🚗 🏍️ 🚜','TIEMPO BUENO PARA LA CAZA 🧤'].getRandom()}*`, wm, null, null, null, null, null, [
  // [null, null]], null)}, 15000)

  setTimeout(() => {
    conn.reply(m.chat, `@${m.sender.split('@s.whatsapp.net')[0]} *${[tradutor.texto4[0], tradutor.texto4[1], tradutor.texto4[2], tradutor.texto4[3]].getRandom()}*`, m, m.mentionedJid ? {mentions: [m.sender]} : {});
  }, 0);
  // conn.sendHydrated(m.chat, `${conn.getName(m.sender)} *${['Buscando implementos de caza...','Alistando todo para la caza!!','Estableciendo Lugar de la Caza...','PREPARANDO LUGAR DE CAZA!!'].getRandom()}*`, wm, null, null, null, null, null, [
  // [null, null]], null)}, 0)
  user.lastberburu = new Date * 1;
};
handler.help = ['berburu'];
handler.tags = ['rpg'];
handler.command = /^(hunt|berburu|caza(r)?)$/i;
handler.group = true;
export default handler;

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  console.log({ms, h, m, s});
  return [h, m, s].map((v) => v.toString().padStart(2, 0) ).join(':');
}

