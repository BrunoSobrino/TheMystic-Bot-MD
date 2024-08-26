

const handler = async (m, {conn, text, command, usedPrefix, args}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.game_ppt

// let pp = 'https://www.bighero6challenge.com/images/thumbs/Piedra,-papel-o-tijera-0003318_1584.jpeg'
  const pp = 'https://telegra.ph/file/c7924bf0e0d839290cc51.jpg';

  // 60000 = 1 minuto // 30000 = 30 segundos // 15000 = 15 segundos // 10000 = 10 segundos
  const time = global.db.data.users[m.sender].wait + 10000;
  if (new Date - global.db.data.users[m.sender].wait < 10000) throw `${tradutor.texto1} ${Math.floor((time - new Date()) / 1000)} ${tradutor.texto2}`;

  if (!args[0]) return conn.reply(m.chat, `${tradutor.texto3[0]} ${usedPrefix + command} piedra*\n*◉ ${usedPrefix + command} papel*\n*◉ ${usedPrefix + command} tijera*`, m);
  // conn.sendButton(m.chat, `*𝐏𝐢𝐞𝐝𝐫𝐚 🗿, 𝐏𝐚𝐩𝐞𝐥 📄 𝐨 𝐓𝐢𝐣𝐞𝐫𝐚 ✂️*\n\n*—◉  𝙿𝚎𝚍𝚎𝚜 𝚞𝚜𝚊𝚛 𝚕𝚘𝚜 𝚋𝚘𝚝𝚘𝚗𝚎𝚜 𝚙𝚊𝚛𝚊 𝚓𝚞𝚐𝚊𝚛 𝚘 𝚝𝚊𝚖𝚋𝚒𝚎𝚗 𝚙𝚞𝚎𝚍𝚎𝚜 𝚞𝚜𝚊𝚛 𝚎𝚜𝚝𝚘𝚜 𝚌𝚘𝚖𝚊𝚗𝚍𝚘𝚜:*\n*◉ ${usedPrefix + command} piedra*\n*◉ ${usedPrefix + command} papel*\n*◉ ${usedPrefix + command} tijera*`, wm, pp, [['Piedra 🗿', `${usedPrefix + command} piedra`], ['Papel 📄', `${usedPrefix + command} papel`], ['Tijera ✂️', `${usedPrefix + command} tijera`]], m)
  let astro = Math.random();
  if (astro < 0.34) {
    astro = 'piedra';
  } else if (astro > 0.34 && astro < 0.67) {
    astro = 'tijera';
  } else {
    astro = 'papel';
  }
  const textm = text.toLowerCase();
  if (textm == astro) {
    global.db.data.users[m.sender].exp += 500;
    m.reply(`${tradutor.texto4[0]} ${textm}*\n${tradutor.texto4[1]} ${astro}*\n${tradutor.texto4[2]}`);
  } else if (text == 'papel') {
    if (astro == 'piedra') {
      global.db.data.users[m.sender].exp += 1000;
      m.reply(`${tradutor.texto5[0]} ${textm}*\n${tradutor.texto5[1]} ${astro}*\n${tradutor.texto5[2]}`);
    } else {
      global.db.data.users[m.sender].exp -= 300;
      m.reply(`${tradutor.texto6[0]} ${textm}*\n${tradutor.texto6[1]}  ${astro}*\n${tradutor.texto6[2]} `);
    }
  } else if (text == 'tijera') {
    if (astro == 'papel') {
      global.db.data.users[m.sender].exp += 1000;
      m.reply(`${tradutor.texto7[0]} ${textm}*\n${tradutor.texto7[1]} ${astro}*\n${tradutor.texto7[2]}`);
    } else {
      global.db.data.users[m.sender].exp -= 300;
      m.reply(`${tradutor.texto8[0]} ${textm}*\n${tradutor.texto8[1]} ${astro}*\n${tradutor.texto8[2]}`);
    }
  } else if (textm == 'tijera') {
    if (astro == 'papel') {
      global.db.data.users[m.sender].exp += 1000;
      m.reply(`${tradutor.texto9[0]} ${textm}*\n${tradutor.texto9[1]} ${astro}*\n${tradutor.texto9[2]}`);
    } else {
      global.db.data.users[m.sender].exp -= 300;
      m.reply(`${tradutor.texto10[0]} ${textm}*\n${tradutor.texto10[1]} ${astro}*\n${tradutor.texto10[2]}`);
    }
  } else if (textm == 'papel') {
    if (astro == 'piedra') {
      global.db.data.users[m.sender].exp += 1000;
      m.reply(`${tradutor.texto11[0]} ${textm}*\n${tradutor.texto11[1]} ${astro}*\n${tradutor.texto11[2]}`);
    } else {
      global.db.data.users[m.sender].exp -= 300;
      m.reply(`${tradutor.texto12[0]} ${textm}*\n${tradutor.texto12[1]} ${astro}*\n${tradutor.texto12[2]}`);
    }
  } else if (textm == 'piedra') {
    if (astro == 'tijera') {
      global.db.data.users[m.sender].exp += 1000;
      m.reply(`${tradutor.texto13[0]} ${textm}*\n${tradutor.texto13[1]} ${astro}*\n${tradutor.texto13[2]}`);
    } else {
      global.db.data.users[m.sender].exp -= 300;
      m.reply(`${tradutor.texto14[0]} ${textm}*\n${tradutor.texto14[1]} ${astro}*\n${tradutor.texto14[2]}`);
    }
  }
  global.db.data.users[m.sender].wait = new Date * 1;
};
handler.help = ['ppt'];
handler.tags = ['games'];
handler.command = /^(ppt)$/i;
export default handler;
