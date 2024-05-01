import { canLevelUp, xpRange } from '../lib/levelling.js';
import { levelup } from '../lib/canvas.js';


const handler = async (m, { conn }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.rpg_levelup

  const name = conn.getName(m.sender);
  const usertag = '@' + m.sender.split('@s.whatsapp.net')[0];
  const user = global.db.data.users[m.sender];
  if (!canLevelUp(user.level, user.exp, global.multiplier)) {
    const { min, xp, max } = xpRange(user.level, global.multiplier);
    const message = `
${tradutor.texto1[0]}
${tradutor.texto1[1]} ${usertag}!*

${tradutor.texto1[2]} ${user.level}
${tradutor.texto1[3]} ${user.role}
${tradutor.texto1[4]} ${user.exp - min}/${xp}

${tradutor.texto1[5]} ${max - user.exp} ${tradutor.texto1[6]}`.trim();
    return conn.sendMessage(m.chat, {text: message, mentions: [m.sender]}, {quoted: m});
  }
  const before = user.level * 1;
  while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++;
  if (before !== user.level) {
    const levelUpMessage = `${tradutor.texto2[0]} ${name}! ${tradutor.texto2[1]} ${user.level}`;
    const levelUpDetails = `
${tradutor.texto3[0]}

${tradutor.texto3[1]}* ${before}
${tradutor.texto3[2]} ${user.level}
${tradutor.texto3[3]} ${user.role}

${tradutor.texto3[4]}`.trim();
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
