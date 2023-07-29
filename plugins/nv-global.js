import {sticker} from '../lib/sticker.js';
const handler = (m) => m;
handler.all = async function(m, {conn}) {
  const chat = global.db.data.chats[m.chat];

  if ((m.mtype === 'groupInviteMessage' || m.text.startsWith('https://chat') || m.text.startsWith('Abre este enlace')) && !m.isBaileys && !m.isGroup && !chat.isBanned) {
    const join = `*< 𝚄𝙽𝙴 𝚄𝙽 𝙱𝙾𝚃 𝙰 𝚃𝚄 𝙶𝚁𝚄𝙿𝙾 />*\n\n*𝙷𝙾𝙻𝙰 𝚄𝚂𝚄𝙰𝚁𝙸𝙾/𝙰*\n*𝙿𝙰𝚁𝙰 𝚂𝙾𝙻𝙸𝙲𝙸𝚃𝙰𝚁 𝚄𝙽 𝙱𝙾𝚃 𝙰 𝚃𝚄 𝙶𝚁𝚄𝙿𝙾 𝚄𝚂𝙰 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 #join 𝙼𝙰𝚂 𝙴𝙻 𝙴𝙽𝙻𝙰𝙲𝙴 𝙳𝙴 𝚃𝚄 𝙶𝚁𝚄𝙿𝙾*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*◉ #join* https://chat.whatsapp.com/LjJbmdO0qSDEKgB60qivZj`.trim();
    this.sendMessage(m.chat, {image: global.imagen4, caption: join}, {quoted: m});
  }

  if (/^hola$/i.test(m.text) && chat.audios && !chat.isBanned) {
    const vn = './media/Hola.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(anadieleimporta|a nadie le importa)/gi)) {
    const vn = './media/dylan1.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(araara|ara ara)/gi)) {
    const vn = './media/Ara.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(miarda de bot|mierda de bot|mearda de bot|Miarda de Bot|Mierda de Bot|Mearda de Bot)/gi)) {
    const vn = './media/insultar.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(baÃ±ate|BaÃ±ate)/gi)) {
    const vn = './media/Banate.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(baneado|Baneado)/gi)) {
    const vn = './media/baneado.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(bebito fiu fiu|bff|Bebito Fiu Fiu|Bff)/gi)) {
    const vn = './media/bff.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(buenas noches|Buenas noches|Boanoite|boanoite)/gi)) {
    const vn = './media/boanoite.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(buenas tardes|Buenas tardes|boatarde|Boatarde)/gi)) {
    const vn = './media/boatarde.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(buenos dias|Buenos dias|buenos dÃ­as|Buenos dÃ­as)/gi)) {
    const vn = './media/Buenos-dias-2.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(chica lgante|Chica lgante|Chicalgante|chicalgante|chical gante|Chical gante)/gi)) {
    const vn = './media/chica lgante.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(giagnosticadocongay|diagnosticado con gay|diagnosticado gay|te diagnÃ³stico con gay|diagnÃ³stico gay|te diagnostico con gay|te diagnÃ³stico con gay|te diagnosticÃ³ con gay|te diagnostico con gay)/gi)) {
    const vn = './media/DiagnosticadoConGay.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(es puto|eeesss putoo|es putoo|esputoo)/gi)) {
    const vn = './media/Es putoo.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(feliz cumpleaÃ±os|felizcumpleaÃ±os|happy birthday)/gi)) {
    const vn = './media/Feliz cumple.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(Fiesta del admin|fiesta del admin)/gi)) {
    const vn = './media/admin.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(fiesta del administrador)/gi)) {
    const vn = './media/fiesta.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(fiesta del admin 3|atenciÃ³n grupo|atencion grupo|aviso importante|fiestadeladmin3)/gi)) {
    const vn = './media/Fiesta1.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(gemidos|gemime|gime|gemime|gemi2)/gi)) {
    const vn = './media/gemi2.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(audio hentai|Audio hentai|audiohentai|Audiohentai)/gi)) {
    const vn = './media/hentai.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(sexo|Sexo|Hora de sexo|hora de sexo)/gi)) {
    const vn = './media/maau1.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(laoracion|La biblia|La oraciÃ³n|La biblia|La oraciÃ³n|la biblia|La Biblia)/gi)) {
    const vn = './media/ora.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(Marica tu|cancion1|Marica quien)/gi)) {
    const vn = './media/cancion.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(MuriÃ³ el grupo|Murio el grupo|murio el grupo|muriÃ³ el grupo|Grupo muerto|grupo muerto)/gi)) {
    const vn = './media/Murio.m4a';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(Feliz navidad|feliz navidad|Merry Christmas|merry chritmas)/gi)) {
    const vn = './media/navidad.m4a';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(noche de paz|Noche de paz|Noche de amor|noche de amor|Noche de Paz)/gi)) {
    const vn = './media/Noche.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(Nyapasu|Nyanpasu|nyapasu|Nyapasu|Gambure|Yabure)/gi)) {
    const vn = './media/otaku.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(ho me vengo|oh me vengo|o me vengo|Ho me vengo|Oh me vengo|O me vengo)/gi)) {
    const vn = './media/vengo.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(oni-chan|onichan|o-onichan)/gi)) {
    const vn = './media/Onichan.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(Pasa pack|vendes tu nudes|pasa video hot|pasa tu pack|pasa fotos hot|vendes tu pack|Vendes tu pack|Vendes tu pack?|vendes tu pack|Pasa Pack Bot|pasa pack Bot|pasa tu pack Bot|PÃ¡same tus fotos desnudas|pÃ¡same tu pack|me pasas tu pak|me pasas tu pack|pasa pack)/gi)) {
    const vn = './media/Elmo.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(QuiÃ©n es tu senpai botsito 7u7|Quien es tu senpai botsito 7u7|QuiÃ©n es tu sempai botsito 7u7|Quien es tu sempai botsito 7u7|QuiÃ©n es tu senpai botsito 7w7|Quien es tu senpai botsito 7w7|quiÃ©n es tu senpai botsito 7u7|quien es tu senpai botsito 7u7|QuiÃ©n es tu sempai botsito 7w7|Quien es tu sempai botsito 7w7|QuiÃ©n es tu senpai botsito|Quien es tu senpai botsito|QuiÃ©n es tu sempai botsito|Quien es tu sempai botsito|QuiÃ©n es tu senpai botsito|Quien es tu senpai botsito|quiÃ©n es tu senpai botsito|quien es tu senpai botsito|QuiÃ©n es tu sempai botsito|Quien es tu sempai botsito)/gi)) {
    const vn = './media/Tu.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(rawr|Rawr|RAWR|raawwr|rraawr|rawwr)/gi)) {
    const vn = './media/rawr.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(siu|siiuu|ssiiuu|siuuu|siiuuu|siiiuuuu|siuuuu|siiiiuuuuu|siu|SIIIIUUU)/gi)) {
    const vn = './media/siu.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(te amo|teamo)/gi)) {
    const vn = './media/Te-amo.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(ooo tio|tio que rico)/gi)) {
    const vn = './media/oh_tio.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(un Pato| un pato|un pato que va caminando alegremente|Un pato|Un Pato)/gi)) {
    const vn = './media/pato.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(UwU|uwu|Uwu|uwU|UWU)/gi)) {
    const vn = './media/UwU.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(vetealavrg|vete a la vrg|vete a la verga)/gi)) {
    const vn = './media/vete a la verga.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(fiesta viernes|viernes|Viernes|viernes fiesta)/gi)) {
    const vn = './media/viernes.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(vivan!!|vivan los novios|vivanlosnovios)/gi)) {
    const vn = './media/vivan.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(Yamete|yamete|Yamete kudasai|yamete kudasai)/gi)) {
    const vn = './media/Yamete-kudasai.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(epico|esto va a ser epico)/gi)) {
    const vn = './media/Epico.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  if (!chat.isBanned && chat.audios && m.text.match(/(shitpost)/gi)) {
    const vn = './media/shitpost.mp3';
    this.sendPresenceUpdate('recording', m.chat);
    this.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true}, {quoted: m});
  }

  return !0;
};
export default handler;
