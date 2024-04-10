import cp from 'child_process';
import { promisify } from 'util';
const exec = promisify(cp.exec).bind(cp);

const handler = async (m) => {
  await conn.reply(m.chat, global.wait, m);
  let o;
  try {
    o = await exec('python3 speedtest.py --secure --share');
    const { stdout, stderr } = o;
    if (stdout.trim()) {
      const result = stdout.trim();

      const match = result.match(/https?:\/\/\S+/);
      if (match) {
        const imageLink = match[0];

        await conn.sendFile(m.chat, imageLink, 'speedtest.png', 'Resultado del speedtest:');
        await conn.reply(m.chat, result.replace(imageLink, ''), m);
      } else {
        await conn.reply(m.chat, result, m);
      }
    }
    if (stderr.trim()) {
      await conn.reply(m.chat, stderr, m);
    }
  } catch (e) {
    await conn.reply(m.chat, e.message, m);
  }
};

handler.help = ['speedtest'];
handler.tags = ['info'];
handler.command = /^(speedtest?|test?speed)$/i;

export default handler;
