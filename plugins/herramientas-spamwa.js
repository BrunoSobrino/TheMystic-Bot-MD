

const handler = async (m, {conn, text}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas_spamwa


  const [nomor, pesan, jumlah] = text.split('|');
  if (!nomor) throw tradutor.texto1;
  if (!pesan) throw tradutor.texto2;
  if (jumlah && isNaN(jumlah)) throw tradutor.texto3;

  const fixedNumber = nomor.replace(/[-+<>@]/g, '').replace(/ +/g, '').replace(/^[0]/g, '62') + '@s.whatsapp.net';
  const fixedJumlah = jumlah ? jumlah * 1 : 10;
  if (fixedJumlah > 50) throw tradutor.texto4;
  await m.reply(`${tradutor.texto5[0]} ${nomor} ${tradutor.texto5[1]}  ${fixedJumlah} ${tradutor.texto5[2]}`);
  for (let i = fixedJumlah; i > 1; i--) {
    if (i !== 0) conn.reply(fixedNumber, pesan.trim(), m);
  }
};
handler.help = ['spamwa <number>|<mesage>|<no of messages>'];
handler.tags = ['General'];
handler.command = /^spam(wa)?$/i;
handler.group = false;
handler.premium = true;
// handler.private = true
// handler.limit = true
export default handler;
