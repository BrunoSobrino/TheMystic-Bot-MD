
const handler = async (m, {conn}) => {
  const datas = global
   const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
   const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
   const tradutor = _translate.plugins.info_tyc
   
   global.terminos = tradutor.texto1;

  m.reply(global.terminos);
};
handler.customPrefix = /términos y condiciones y privacidad|terminosycondicionesyprivacidad|terminosycondiciones|terminos y condiciones y privacidad|terminos y condiciones|terminos y condiciones|terminos de uso|Terminos de uso|Terminó se uso|términos de uso|Términos de uso|Términos y condiciones/i;
handler.command = new RegExp;
export default handler;


