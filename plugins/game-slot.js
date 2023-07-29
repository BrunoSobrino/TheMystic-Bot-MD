/* CREDITOS A https://github.com/FG98F */

const handler = async (m, {args, usedPrefix, command}) => {
  const fa = `
*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙰 𝙻𝙰 𝙲𝙰𝙽𝚃𝙸𝙳𝙰𝙳 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙰 𝙰𝙿𝙾𝚂𝚃𝙰𝚁* 

*📌 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*
*${usedPrefix + command} 100*`.trim();
  if (!args[0]) throw fa;
  if (isNaN(args[0])) throw fa;
  const apuesta = parseInt(args[0]);
  const users = global.db.data.users[m.sender];
  const time = users.lastslot + 10000;
  if (new Date - users.lastslot < 10000) throw `*⏳ 𝙴𝚂𝙿𝙴𝚁𝙴 ${msToTime(time - new Date())} 𝙿𝙰𝚁𝙰 𝚅𝙾𝙻𝚅𝙴𝚁 𝙰 𝙰𝙿𝙾𝚂𝚃𝙰𝚁*`;
  if (apuesta < 100) throw '*[❗] 𝙴𝙻 𝙼𝙸𝙽𝙸𝙼𝙾 𝙿𝙰𝚁𝙰 𝙰𝙿𝙾𝚂𝚃𝙰𝚁 𝙴𝚂 𝙳𝙴 𝟷00 𝚇𝙿*';
  if (users.exp < apuesta) {
    throw `*[❗] 𝚃𝚄 𝚇𝙿 𝙽𝙾 𝙴𝚂 𝚂𝚄𝙵𝙸𝙲𝙸𝙴𝙽𝚃𝙴 𝙿𝙰𝚁𝙰 𝙰𝙿𝙾𝚂𝚃𝙰𝚁 𝙴𝚂𝙰 𝙲𝙰𝙽𝚃𝙸𝙳𝙰𝙳, 𝙹𝚄𝙴𝙶𝙰 𝙾𝚃𝚁𝙾𝚂 𝙹𝚄𝙴𝙶𝙾𝚂 𝙾 𝙸𝙽𝚃𝙴𝚁𝙰𝙲𝚃𝚄𝙰 𝙲𝙾𝙽 𝙴𝙻 𝙱𝙾𝚃 𝙿𝙰𝚁𝙰 𝙶𝙰𝙽𝙰𝚁 𝙼𝙰𝚂 𝚇𝙿*`;
  }
  const emojis = ['🐋', '🐉', '🕊️'];
  let a = Math.floor(Math.random() * emojis.length);
  let b = Math.floor(Math.random() * emojis.length);
  let c = Math.floor(Math.random() * emojis.length);
  const x = [];
  const y = [];
  const z = [];
  for (let i = 0; i < 3; i++) {
    x[i] = emojis[a];
    a++;
    if (a == emojis.length) a = 0;
  }
  for (let i = 0; i < 3; i++) {
    y[i] = emojis[b];
    b++;
    if (b == emojis.length) b = 0;
  }
  for (let i = 0; i < 3; i++) {
    z[i] = emojis[c];
    c++;
    if (c == emojis.length) c = 0;
  }
  let end;
  if (a == b && b == c) {
    end = `*𝙶𝙰𝙽𝙰𝚂𝚃𝙴! 🎁 +${apuesta + apuesta} 𝚇𝙿*`;
    users.exp += apuesta;
  } else if (a == b || a == c || b == c) {
    end = `*🔮 𝙲𝙰𝚂𝙸 𝙻𝙾 𝙻𝙾𝙶𝚁𝙰𝚂!, 𝚂𝙸𝙶𝚄𝙴 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝙽𝙳𝙾*\n*𝚃𝙾𝙼𝙰 +10 XP*`;
    users.exp += 10;
  } else {
    end = `*❌ 𝙿𝙴𝚁𝙳𝙸𝚂𝚃𝙴 -${apuesta} 𝚇𝙿*`;
    users.exp -= apuesta;
  }
  users.lastslot = new Date * 1;
  return await m.reply(
      `
🎰 | *SLOTS* 
────────
${x[0]} : ${y[0]} : ${z[0]}
${x[1]} : ${y[1]} : ${z[1]}
${x[2]} : ${y[2]} : ${z[2]}
────────
🎰 | ${end}`);
};
handler.help = ['slot <apuesta>'];
handler.tags = ['game'];
handler.command = ['slot'];
export default handler;

function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return minutes + ' m ' + seconds + ' s ';
}

