import fs from 'fs';
const timeout = 60000;
const poin = 10;
const handler = async (m, {conn, usedPrefix}) => {
  conn.tekateki = conn.tekateki ? conn.tekateki : {};
  const id = m.chat;
  if (id in conn.tekateki) {
    conn.reply(m.chat, '', conn.tekateki[id][0]);
    throw false;
  }
  const tekateki = JSON.parse(fs.readFileSync(`./src/game/paises.json`));
  const json = tekateki[Math.floor(Math.random() * tekateki.length)];
  const _clue = json.response;
  const clue = _clue.replace(/[A-Za-z]/g, '_');
  const caption = `
🌎 *\`ADIVINA EL PAIS\`* 🌎
QUE PAIS ES: *${json.question}*

「○」 *TIEMPO:* ${(timeout / 1000).toFixed(2)} SEGUNDO/S
「○」 *PREMIO:* *+${poin}* MYSTIC-COINS`.trim();
  conn.tekateki[id] = [
    await conn.reply(m.chat, caption, m), json,
    poin,
    setTimeout(async () => {
      if (conn.tekateki[id]) await conn.reply(m.chat, `\`\`\`¡¡SE ACABO TU TIEMPO!!\`\`\`\n*RESPUESTA:* ${json.response}`, conn.tekateki[id][0]);
      delete conn.tekateki[id];
    }, timeout)];
};
const id = m.chat;
  if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/^ⷮ/i.test(m.quoted.text)) return !0;
  this.tekateki = this.tekateki ? this.tekateki : {};
  if (!(id in this.tekateki)) return m.reply('Ese acertijo ya ha terminado!');
  if (m.quoted.id == this.tekateki[id][0].id) {
    const json = JSON.parse(JSON.stringify(this.tekateki[id][1]));
    if (m.text.toLowerCase() == json.response.toLowerCase().trim()) {
      global.db.data.users[m.sender].exp += this.tekateki[id][2];
      m.reply(`\`\`\`¡¡RESPUESTA CORRECTA!!\`\`\`\n+${this.tekateki[id][2]} Exp`);
      clearTimeout(this.tekateki[id][3]);
      delete this.tekateki[id];
    } else if (similarity(m.text.toLowerCase(), json.response.toLowerCase().trim()) >= threshold) m.reply(`\`\`\`¡¡ESTAS CERCA!!\`\`\``);
    else m.reply(`\`\`\`¡¡RESPUESTA INCORRECTA!!\`\`\``);
};
handler.help = ['paises'];
handler.tags = ['game'];
handler.command = /^(advpais|paisadv|adivinarpais|advpaises|countryadv|advcountry)$/i;
export default handler;
