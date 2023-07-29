import fetch from 'node-fetch';
const handler = async (m, {
  conn,
  args,
  usedPrefix,
  command,
}) => {
  fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/kpop/blackpink.txt').then((res) => res.text()).then((body) => {
    const randomkpop = body.split('\n');
    const randomkpopx = randomkpop[Math.floor(Math.random() * randomkpop.length)];
    conn.sendMessage(m.chat, {
      image: {
        url: randomkpopx,
      },
    }, {
      quoted: m,
    });
    // conn.sendButton(m.chat, `_${command}_`, author, randomkpopx, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], m)
  });
};
handler.help = ['blackpink'];
handler.tags = ['internet'];
handler.command = /^(blackpink)$/i;
export default handler;
