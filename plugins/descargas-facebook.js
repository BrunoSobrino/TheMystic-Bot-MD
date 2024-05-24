import fetch from 'node-fetch';
let enviando = false;
const handler = async (m, {conn, args, command, usedPrefix}) => {
  const idioma = global.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.descargas_facebook
  if (!args[0]) throw `_*${tradutor.texto1[0]}*_\n\n*${tradutor.texto1[1]}*\n\n*${tradutor.texto1[2]}* _${usedPrefix + command} https://fb.watch/fOTpgn6UFQ/_`;
  const linkface = await isValidFacebookLink(args[0])  
  if (!linkface) throw `_*${tradutor.texto2[0]}*_\n\n*${tradutor.texto2[1]}*\n\n*${tradutor.texto2[2]}* _${usedPrefix + command} https://fb.watch/fOTpgn6UFQ/_`;
  if (!enviando) enviando = true
  try {
    await m.reply(`_*${tradutor.texto3}*`);
    const d2ata = await fetch(`${global.MyApiRestBaseUrl}/api/facebook?url=${args[0]}&apikey=${global.MyApiRestApikey}`);
    const r2es = await d2ata.json();
    let linkdl = '';  
    if (r2es?.status === true) {
      linkdl = `${r2es.resultado.data}`;
    } else {
      linkdl = XD  
      enviando = false
    }
    conn.sendMessage(m.chat, {video: {url: linkdl}, filename: 'error.mp4', caption: `_*${tradutor.texto4}*_`}, {quoted: m});
    enviando = false
  } catch (err1) {
      enviando = false
      console.log('Error: ' + err1.message)
      throw `_*${tradutor.texto5}*`;
  }
};
handler.command = /^(facebook|fb|facebookdl|fbdl|facebook2|fb2|facebookdl2|fbdl2|facebook3|fb3|facebookdl3|fbdl3|facebook4|fb4|facebookdl4|fbdl4|facebook5|fb5|facebookdl5|fbdl5)$/i;
export default handler;

async function isValidFacebookLink(link) {
    const validPatterns = [/facebook\.com\/[^/]+\/videos\//i, /fb\.watch\//i, /fb\.com\/watch\//i, /fb\.me\//i, /fb\.com\/video\.php\?v=/i, /facebook\.com\/share\/v\//i, /facebook\.com\/share\/r\//i, /fb\.com\/share\/v\//i, /fb\.com\/share\/r\//i, /facebook\.com\/[^/]+\/posts\/[^/]+\//i, /facebook\.com\/reel\/[^/]+\//i];
    return validPatterns.some(pattern => pattern.test(link));
}
