import _translate from "./_translate.js"
const tradutor = _translate.plugins.fun_love
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, { conn, command, text }) => {
  const lovePercentage = Math.floor(Math.random() * 100);
  const isHighLove = lovePercentage >= 50;
  const loveMessages = tradutor.texto1;
  const notSoHighLoveMessages = tradutor.texto2;
  const loveDescription = isHighLove ? tradutor.texto3[0] : tradutor.texto3[1];
  const getRandomMessage = (messages) => messages[Math.floor(Math.random() * messages.length)];
  const loveMessage = isHighLove ? getRandomMessage(loveMessages) : getRandomMessage(notSoHighLoveMessages);
  const response =
    `━━━━━━━⬣ *LOVE* ⬣━━━━━━━\n` +
    `${tradutor.texto4[0]}, ${text} ${tradutor.texto4[1]} @${m.sender.split('@')[0]} ${loveDescription} ${tradutor.texto4[2]} ${lovePercentage}% ${tradutor.texto4[3]}\n\n` +
    `*❥ ${loveMessage}*\n` +
    `━━━━━━━⬣ *LOVE* ⬣━━━━━━━`    
  
  async function loading() {
var hawemod = [
"《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
"《 ████▒▒▒▒▒▒▒▒》30%",
"《 ███████▒▒▒▒▒》50%",
"《 ██████████▒▒》80%",
"《 ████████████》100%"
]
   let { key } = await conn.sendMessage(m.chat, {text: tradutor.texto5, mentions: conn.parseMention(response)}, {quoted: m})
 for (let i = 0; i < hawemod.length; i++) {
   await new Promise(resolve => setTimeout(resolve, 1000)); 
   await conn.sendMessage(m.chat, {text: hawemod[i], edit: key, mentions: conn.parseMention(response)}, {quoted: m}); 
  }
  await conn.sendMessage(m.chat, {text: response, edit: key, mentions: conn.parseMention(response)}, {quoted: m});         
 }
loading()    
};
handler.help = ['love'];
handler.tags = ['fun'];
handler.command = /^(love|amor)$/i;
export default handler;
