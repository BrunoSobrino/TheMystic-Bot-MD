import similarity from 'similarity';
import fs from 'fs';

const threshold = 0.72;
const handler = {
  
  async before(m) {
    const datas = global
    const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
    const tradutor = _translate.plugins.game__cancion

    const id = m.chat;
    
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/ADIVINA EL TITULO DE LA CANCION/i.test(m.quoted.text)) return !0;
    
    this.tebaklagu = this.tebaklagu ? this.tebaklagu : {};
    if (!(id in this.tebaklagu)) return m.reply(tradutor.texto1 || "No hay juego activo en este chat.");
    
    if (m.quoted.id == this.tebaklagu[id][0].id) {
      const json = JSON.parse(JSON.stringify(this.tebaklagu[id][1]));
      
      const normalizeText = (text) => {
        return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim();
      };
      
      const userAnswer = normalizeText(m.text);
      const correctAnswer = normalizeText(json.jawaban);
      
      if (userAnswer === correctAnswer) {
        global.db.data.users[m.sender].exp += this.tebaklagu[id][2];
        m.reply(`🎉 ¡Correcto!\n\n🎵 *${json.jawaban}* de *${json.artist}*\n💰 +${this.tebaklagu[id][2]} XP`);
        clearTimeout(this.tebaklagu[id][3]);
        delete this.tebaklagu[id];
      } else if (similarity(userAnswer, correctAnswer) >= threshold) {
        // Respuesta muy similar
        m.reply(`🎯 ¡Casi! Estás muy cerca...`);
      } else {
        // Respuesta incorrecta
        m.reply(tradutor.texto2 || "❌ Incorrecto. ¡Sigue intentando!");
      }
    }
    return !0;
  },
  exp: 0,
};

export default handler;
