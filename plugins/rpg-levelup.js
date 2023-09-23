import { canLevelUp, xpRange } from '../lib/levelling.js';
import { levelup } from '../lib/canvas.js';

const handler = async (m, { conn }) => {
  const name = conn.getName(m.sender);
  const usertag = '@' + m.sender.split('@s.whatsapp.net')[0];
  const user = global.db.data.users[m.sender];
  if (!canLevelUp(user.level, user.exp, global.multiplier)) {
    const { min, xp, max } = xpRange(user.level, global.multiplier);
    const message = `
🏰 *Gremio de Aventureros*
*¡Bienvenido, ${usertag}!*

*◉ Nivel actual:* ${user.level}
*◉ Rango actual:* ${user.role}
*◉ Puntos de Experiencia:* ${user.exp - min}/${xp}

*—◉ Para ascender de nivel necesitas obtener ${max - user.exp} puntos de experiencia más. Sigue interactuando con el Bot!.*`.trim();
    return conn.sendMessage(m.chat, {text: message, mentions: [m.sender]}, {quoted: m});
  }
  const before = user.level * 1;
  while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++;
  if (before !== user.level) {
    const levelUpMessage = `🎉 ¡Felicidades, ${name}! Has subido de nivel a ${user.level}`;
    const levelUpDetails = `
🚀 *Nuevo Nivel Alcanzado*

*◉ Nivel anterior:* ${before}
*◉ Nuevo nivel:* ${user.level}
*◉ Rango actual:* ${user.role}

*—◉ Continúa explorando y realizando misiones para alcanzar nuevas alturas en el Gremio de Aventureros. Sigue interactuando con el Bot!.*`.trim();
    try {
      const levelUpImage = await levelup(levelUpMessage, user.level);
      conn.sendFile(m.chat, levelUpImage, 'levelup.jpg', levelUpDetails, m);
    } catch (e) {
      conn.sendMessage(m.chat, {text: levelUpDetails, mentions: [m.sender]}, {quoted: m});
    }
  }
};
handler.help = ['levelup'];
handler.tags = ['xp'];
handler.command = ['nivel', 'lvl', 'levelup', 'level'];
export default handler;
