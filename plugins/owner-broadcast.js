// codigo adaptado por: https://github.com/GataNina-Li & https://github.com/elrebelde21



const handler = async (m, {conn, command, participants, usedPrefix, text}) => {
  const datas = global
    const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
    const tradutor = _translate.plugins.owner_broadcast

  if (!text) return tradutor.texto1;
  const cc4 = text ? m : m.quoted ? await m.getQuotedObj() : false || m;
  const teks4 = text ? text : cc4.text;
  const groups2 = Object.keys(await conn.groupFetchAllParticipating());
  const chats2 = Object.keys(global.db.data.users).filter((user) => user.endsWith('@s.whatsapp.net'));
  await conn.reply(m.chat, tradutor.texto2, m);
  const start2 = new Date().getTime();
  const usersTag2 = participants.map((u) => conn.decodeJid(u.id));
  let totalPri2 = 0;
  for (let i = 0; i < groups2.length; i++) {
    const group = groups2[i];
    const delay = i * 4000; // 4 seg
    setTimeout(async () => {
      await conn.reply(group, tradutor.texto3[0] + teks4, {mentions: usersTag2}, {quoted: global.fkontak});
    }, delay);
  }
  for (const user of chats2) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 segundos
    await conn.reply(user, tradutor.texto3[1] + teks4, global.fkontak, null);
    totalPri2++;
    if (totalPri2 >= 500000) {
      break;
    }
  }
  const end2 = new Date().getTime();
  const totalPrivate2 = chats2.length;
  const totalGroups2 = groups2.length;
  const total2 = totalPrivate2 + totalGroups2;
  let time2 = Math.floor((end2 - start2) / 1000);
  if (time2 >= 60) {
    const minutes = Math.floor(time2 / 60);
    const seconds = time2 % 60;
    time2 = `${minutes} minutos y ${seconds} segundos`;
  } else {
    time2 = `${time2} segundos`;
  }
  await m.reply(`${tradutor.texto4[0]}
\`\`\`${tradutor.texto4[1]} ${totalPrivate2}\`\`\`
\`\`\`${tradutor.texto4[2]}   ${totalGroups2}\`\`\`
\`\`\`${tradutor.texto4[3]}   ${total2}\`\`\`\n\n${tradutor.texto4[4]} ${time2}*\n${totalPri2 >= 500000 ? tradutor.texto4[5] : ''}`);
};
handler.help = ['broadcast', 'bc'].map((v) => v + ' <teks>');
handler.tags = ['owner'];
handler.command = /^(comunicar|comunicado|broadcastall|bc)$/i;

handler.owner = true;

export default handler;
