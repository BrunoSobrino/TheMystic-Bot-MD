import cp from 'child_process';
import {promisify} from 'util';
const exec = promisify(cp.exec).bind(cp);
const handler = async (m) => {
  await conn.reply(m.chat, global.wait, m);
  let o;
  try {
    o = await exec('python3 speed.py');
  } catch (e) {
    o = e;
  } finally {
    const {stdout, stderr} = o;
    if (stdout.trim()) m.reply(stdout);
    if (stderr.trim()) m.reply(stderr);
  }
};
handler.help = ['speedtest'];
handler.tags = ['info'];
handler.command = /^(speedtest?|test?speed)$/i;

export default handler;
