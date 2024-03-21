import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_restart
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, isROwner, text}) => {
  if (!process.send) throw tradutor.texto1;
    // conn.readMessages([m.key])
    await m.reply(tradutor.texto2);
    process.send('reset');
};
handler.help = ['restart'];
handler.tags = ['owner'];
handler.command = ['restart', 'reiniciar'];
handler.rowner = true;
export default handler;
