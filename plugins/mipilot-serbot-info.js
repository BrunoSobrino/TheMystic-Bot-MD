import ws from 'ws';

async function handler(m, { conn: _envio, usedPrefix }) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.mipilot_serbot_info

  const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
  function convertirMsADiasHorasMinutosSegundos(ms) {
  var segundos = Math.floor(ms / 1000);
  var minutos = Math.floor(segundos / 60);
  var horas = Math.floor(minutos / 60);
  var días = Math.floor(horas / 24);

  segundos %= 60;
  minutos %= 60;
  horas %= 24;

  var resultado = "";
  if (días !== 0) {
    resultado += días + tradutor.texto3[0];
  }
  if (horas !== 0) {
    resultado += horas + tradutor.texto3[1];
  }
  if (minutos !== 0) {
    resultado += minutos + tradutor.texto3[2];
  }
  if (segundos !== 0) {
    resultado += segundos + tradutor.texto3[3];
  }

  return resultado;
}

  const message = users.map((v, index) => `*${index + 1}.-* @${v.user.jid.replace(/[^0-9]/g, '')}\n${tradutor.texto4[0]} wa.me/${v.user.jid.replace(/[^0-9]/g, '')}?text=${usedPrefix}estado\n${tradutor.texto4[1]} ${v.user.name || '-'}\n${tradutor.texto4[2]} ${ v.uptime ? convertirMsADiasHorasMinutosSegundos(Date.now() - v.uptime) : "Desconocido"}`).join('\n\n');
  const replyMessage = message.length === 0 ? tradutor.texto1 : message;
  const totalUsers = users.length;
  const responseMessage = `
${tradutor.texto2[0]}

${tradutor.texto2[1]}

${tradutor.texto2[2]}

${tradutor.texto2[3]} ${totalUsers || '0'}

${replyMessage.trim()}`.trim();

  await _envio.sendMessage(m.chat, {text: responseMessage, mentions: _envio.parseMention(responseMessage)}, {quoted: m});
}
handler.command = handler.help = ['listjadibot', 'bots', 'subsbots'];
handler.tags = ['jadibot'];
export default handler;
