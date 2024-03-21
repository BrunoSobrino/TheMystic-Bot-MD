import fetch from 'node-fetch';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.random_kpop
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, args, usedPrefix}) => {
  if (args.length == 0) return conn.reply(m.chat, `${tradutor.texto1[0]} ${usedPrefix}kpop\n${tradutor.texto1[1]} ${usedPrefix}kpop ${tradutor.texto1[2]} ${usedPrefix}kpop ${tradutor.texto1[3]}`, m);
  if (args[0] == 'blackpink' || args[0] == 'exo' || args[0] == 'bts') {
    fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/kpop/' + args[0] + '.txt')
        .then((res) => res.text())
        .then((body) => {
          const randomkpop = body.split('\n');
          const randomkpopx = randomkpop[Math.floor(Math.random() * randomkpop.length)];
          conn.sendFile(m.chat, randomkpopx, '', 'Dasar Kpopers', m);
        })
        .catch(() => {
          conn.reply(m.chat, tradutor.texto2, m);
        });
  } else {
    conn.reply(m.chat, `${tradutor.texto3[0]} ${usedPrefix}kpop ${tradutor.texto3[1]}`, m);
  }
};
handler.help = ['kpop'].map((v) => v + ' <query>');
handler.tags = ['image'];
handler.command = /^(kpop)$/i;
export default handler;
