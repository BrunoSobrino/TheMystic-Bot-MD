import moment from 'moment-timezone';

const handler = async (m, {conn}) => {

  const tzAF = moment().tz('Africa/Casablanca').format('DD/MM HH:mm');
  await conn.sendMessage(m.chat, {text: `\`\`\`
الوقت الحالي في المغرب هو :


▢ morocco     : ${tzAF}
  ${String.fromCharCode(8206).repeat(850)}
  ▢ instagram.com/f.b.i_ys._ess._ui_.di_man_6000`}, {quoted: m});
  };
handler.help = ["tz"]
handler.tags = ["infobot"]
handler.command = /^(tz)$/i
  export default handler;
