

const handler = async (m, {conn, text, args, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas_encuesta

  let name = await conn.getName(m.sender);
  if (name == 'undefined') name = 'Indefinido';
  const b = text.split('|');
  if (!b[1]) throw `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]}`;
  if (b[12]) throw `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]}`;
  const caption = `${tradutor.texto2[0]}\n${name}\n${tradutor.texto2[1]}\n${text.split('|')[0]}`.trim();
  const options = text.split("|").slice(1).map(option => ({ optionName: option.trim() }));  
  const sendPollMessage = {
    messageContextInfo: {
        messageSecret: "bT3tfZngfSMWK2zOEL8pSclPG+xldidYDX+ybB8vdEw="
    },
    pollCreationMessage: {
        name: caption,
        options: options,
        selectableOptionsCount: 1,
    }
  };
conn.relayMessage(m.chat, sendPollMessage, {quoted: m});
};
handler.help = ['encuesta question|option|option'];
handler.tags = ['group'];
handler.command = ['poll', 'encuesta'];
export default handler;
