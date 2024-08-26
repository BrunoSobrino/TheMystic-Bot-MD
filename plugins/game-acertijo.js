import fs from 'fs';


const timeout = 60000;
const poin = 500;
const handler = async (m, {conn, usedPrefix}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.game_acertijo


  conn.tekateki = conn.tekateki ? conn.tekateki : {};
  const id = m.chat;
  if (id in conn.tekateki) {
    conn.reply(m.chat, tradutor.texto1, conn.tekateki[id][0]);
    throw false;
  }
  const tekateki = tradutor.texto4;
  /*Para agregar más preguntas vaya a la carpeta de language en el archivo json de su 
  idioma preferido, busque "acertijo" justo después del texto4 puede agregar sus preguntas*/
  
  const json = tekateki[Math.floor(Math.random() * tekateki.length)];
  const _clue = json.response;
  const clue = _clue.replace(/[A-Za-z]/g, '_');
  const caption = `
ⷮ *${json.question}*
${tradutor.texto2[0]} ${(timeout / 1000).toFixed(2)} segundos
${tradutor.texto2[1]} +${poin} Exp
`.trim();
  conn.tekateki[id] = [
    await conn.reply(m.chat, caption, m), json,
    poin,
    setTimeout(async () => {
      if (conn.tekateki[id]) await conn.reply(m.chat, `${tradutor.texto3} ${json.response}`, conn.tekateki[id][0]);
      delete conn.tekateki[id];
    }, timeout)];
};
handler.help = ['acertijo'];
handler.tags = ['game'];
handler.command = /^(acertijo|acert|pregunta|adivinanza|tekateki)$/i;
export default handler;
