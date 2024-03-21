/* Creditos a https://github.com/unptoadrih15/UPABOT-MD */
import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_autoadmin
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, isAdmin}) => {
  if (m.fromMe) return;
  if (isAdmin) throw tradutor.texto1;
  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
  } catch {
    await m.reply(tradutor.texto2);
  }
};
handler.command = /^autoadmin$/i;
handler.rowner = true;
handler.group = true;
handler.botAdmin = true;
export default handler;
