import db from '../src/libraries/database.js'

let handler = m => m

handler.before = async function (m, { conn }) {

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

    return !0
}

export default handler
