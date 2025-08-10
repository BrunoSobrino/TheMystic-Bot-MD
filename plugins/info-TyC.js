
const handler = async (m, {conn}) => {
  const datas = global
   const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
   const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
   const tradutor = _translate.plugins.info_tyc
   
   global.terminos = tradutor.texto1;

  m.reply(global.terminos);
};

handler.help = ['T&C'];
handler.tags = ['info'];
handler.command = /^(terminosycondicionesyprivacidad|terminosycondiciones|tyc|t&c)$/i;
export default handler;


