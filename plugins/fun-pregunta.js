

const handler = async (m, {command, text}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.fun_pregunta;

  m.reply(`
${tradutor.texto1[0]}
  
${tradutor.texto1[1]} ${text}
${tradutor.texto1[2]} ${[tradutor.texto1[3], tradutor.texto1[4], tradutor.texto1[5], tradutor.texto1[6], tradutor.texto1[7], tradutor.texto1[8]].getRandom()}
`.trim(), null, m.mentionedJid ? {
  mentions: m.mentionedJid,
} : {});
};
handler.help = ['pregunta <texto>?'];
handler.tags = ['kerang'];
handler.command = /^pregunta|preguntas|apakah$/i;
export default handler;
