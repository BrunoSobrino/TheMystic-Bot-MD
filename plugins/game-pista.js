import fs from 'fs';
const handler = async (m, {conn}) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.game_pista

  conn.tebaklagu = conn.tebaklagu ? conn.tebaklagu : {};
  const id = m.chat;
  if (!(id in conn.tebaklagu)) throw false;
  const json = conn.tebaklagu[id][1];
  const answer = json.jawaban.trim(); 
  const artist = json.artist;
  const hint = createHint(answer);
  const wordCount = answer.split(/\s+/).length;
  const letterCount = answer.replace(/\s/g, '').length;
  
  const hintMessage = `${tradutor.texto1[0]}${hint}${tradutor.texto1[1]}${artist}${tradutor.texto1[2]}${wordCount}${tradutor.texto1[3]}${letterCount}${tradutor.texto1[4]}`.trim();

  await conn.reply(m.chat, hintMessage, m);
};

handler.command = /^(hint|pista)$/i;
export default handler;

function createHint(text) {
  return text.split('').map(char => {
    if (/[aeiouáéíóúüAEIOUÁÉÍÓÚÜ\s'-]/.test(char)) {
      return char;
    } else if (/[a-zA-ZñÑ]/.test(char)) {
      return '◉';
    }
    return char;
  }).join('');
}
