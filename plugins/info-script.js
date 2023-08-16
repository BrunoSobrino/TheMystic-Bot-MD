import moment from 'moment-timezone';
import fetch from 'node-fetch';
const handler = async (m, { conn, args }) => {
   let res = await fetch('https://api.github.com/repos/BrunoSobrino/TheMystic-Bot-MD');
   let json = await res.json();
   let txt = `           *乂  B O T  -  S C R I P T  乂 *\n\n`;
      txt += `◦  *Nombre:* ${json.name}\n`;
      txt += `◦  *Visitantes: ${json.watchers_count}\n`;
      txt += `◦  *Tamaño:* ${(json.size / 1024).toFixed(2)} MB\n`;
      txt += `◦  *Actualización:* ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
      txt += `◦  *Url:* ${json.html_url}\n\n`;
      txt += `	   ${json.forks_count} Forks · ${json.stargazers_count} Stars · ${json.open_issues_count} Issues\n\n`;
      txt += global.titulowm;
   await conn.reply(m.chat,txt)
}
handler.help = ['scbot'];
handler.tags = ['info'];
handler.command = /^(sc|scbot|scrip|script)$/i;
export default handler;
