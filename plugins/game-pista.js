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
  
  const hintMessage = `
🎵 *PISTA ADIVINA LA CANCIÓN* 🎵

${hint}

🎤 *Artista:* ${artist}
📝 *Palabras:* ${wordCount}
📏 *Letras:* ${letterCount}

💡 _Las vocales y números están visibles, adivina las consonantes_
`.trim();

  await conn.reply(m.chat, hintMessage, m);
};

handler.command = /^hint|pista$/i;
export default handler;

function createHint(text) {
  return text.split('').map(char => {
    if (/[aeiouáéíóúüAEIOUÁÉÍÓÚÜ\s0-9¿?¡!.,-]/.test(char)) return char;
    } else if (/[a-zA-ZñÑ]/.test(char)) {
      return '▢';
    } 
    return char;
  }).join('');
}
