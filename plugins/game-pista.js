const handler = async (m, {conn}) => {
  conn.tebaklagu = conn.tebaklagu ? conn.tebaklagu : {};
  const id = m.chat;
  if (!(id in conn.tebaklagu)) throw false;
  const json = conn.tebaklagu[id][1];
  const answer = json.jawaban;
  const artist = json.artist;
  const hint = createHint(answer);
  const wordCount = answer.split(' ').length;
  const letterCount = answer.replace(/\s/g, '').length;
  const hintMessage = `🎵 *PISTA:*\n\n\`${hint}\`\n\n🎤 *Artista:* ${artist}\n📝 *Palabras:* ${wordCount}\n📏 *Letras:* ${letterCount}\n\n💡 _Las vocales están visibles, adivina las consonantes_`;
  m.reply(hintMessage);
};

handler.command = /^hint|pista$/i;
export default handler;

function createHint(text) {
  return text.split('').map(char => {
    if (/[aeiouAEIOU\s0-9]/.test(char)) {
      return char;
    }
    else if (/[a-zA-ZñÑ]/.test(char)) {
      return '_';
    } else {
      return char;
    }}).join('');
}
