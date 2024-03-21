import _translate from "./_translate.js"
const tradutor = _translate.plugins.fun_pregunta
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {command, text}) => m.reply(`
${tradutor.texto1[0]}
  
${tradutor.texto1[1]} ${text}
${tradutor.texto1[2]} ${[tradutor.texto1[3], tradutor.texto1[4], tradutor.texto1[5], tradutor.texto1[6], tradutor.texto1[7], tradutor.texto1[8]].getRandom()}
`.trim(), null, m.mentionedJid ? {
  mentions: m.mentionedJid,
} : {});
handler.help = ['pregunta <texto>?'];
handler.tags = ['kerang'];
handler.command = /^pregunta|preguntas|apakah$/i;
export default handler;
