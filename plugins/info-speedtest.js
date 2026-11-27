import cp from 'child_process';
import { promisify } from 'util';
const exec = promisify(cp.exec).bind(cp);

const handler = async (m, {conn}) => {
    let o;
    try {
        // Sin timeout el exec podía colgarse para siempre si el
        // script de speedtest no terminaba.
        o = await exec('python3 ./src/libraries/ookla-speedtest.py --secure --share', {timeout: 120000});
        const {stdout, stderr} = o;
        if (stdout.trim()) {
            const match = stdout.match(/http[^"]+\.png/);
            const urlImagen = match ? match[0] : null;
            // Antes se enviaba {image: {url: null}} cuando no había
            // enlace de imagen en la salida y eso reventaba.
            if (urlImagen) await conn.sendMessage(m.chat, {image: {url: urlImagen}, caption: stdout.trim()}, {quoted: m});
            else await conn.sendMessage(m.chat, {text: stdout.trim()}, {quoted: m});
        }
        if (stderr.trim()) { 
            const match2 = stderr.match(/http[^"]+\.png/);
            const urlImagen2 = match2 ? match2[0] : null;    
            if (urlImagen2) await conn.sendMessage(m.chat, {image: {url: urlImagen2}, caption: stderr.trim()}, {quoted: m});
            else await conn.sendMessage(m.chat, {text: stderr.trim()}, {quoted: m});
        }
        if (!stdout.trim() && !stderr.trim()) m.reply('No se obtuvo resultado del speedtest.');
    } catch (e) {
        o = e.message;
        return m.reply(o)
    }
};
handler.help = ['speedtest'];
handler.tags = ['info'];
handler.command = /^(speedtest|testspeed)$/i;
export default handler;
