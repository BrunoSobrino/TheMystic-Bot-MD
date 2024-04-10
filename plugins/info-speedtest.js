import cp from 'child_process';
import { promisify } from 'util';
const exec = promisify(cp.exec).bind(cp);

const handler = async (m) => {
  const quotedMsg = m.quoted ? m.quoted : m;
  await conn.reply(quotedMsg.chat, global.wait, quotedMsg);
  let o;
  try {
    o = await exec('python3 speedtest.py --secure --share');
    const { stdout, stderr } = o;
    if (stdout.trim()) {
      const result = stdout.trim();
      const match = result.match(/https?:\/\/\S+/);
      if (match) {
        const imageLink = match[0];
        await conn.sendFile(quotedMsg.chat, imageLink, 'speedtest.png', `${result}`, quotedMsg.id);
      } else {
        await conn.reply(quotedMsg.chat, result, quotedMsg.id);
      }
    }
    if (stderr.trim()) {
      await conn.reply(quotedMsg.chat, stderr, quotedMsg.id);
    }
  } catch (e) {
    await conn.reply(quotedMsg.chat, e.message, quotedMsg.id);
  }
};

handler.help = ['speedtest'];
handler.tags = ['info'];
handler.command = /^(speedtest)$/i;

export default handler;
