

const handler = async (m, {usedPrefix}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.herramientas_chatgpt_del;

  try {
    delete global.chatgpt.data.users[m.sender];
    m.reply(`${tradutor.texto1} ${usedPrefix}chatgpt2 O ${usedPrefix}ia2*`);
  } catch (error1) {
    console.log(error1);
    throw tradutor.texto2;
  }
};
handler.command = ['delchatgpt'];
export default handler;
