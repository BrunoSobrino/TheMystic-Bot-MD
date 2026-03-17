import fs from 'fs';
import { exec, spawn } from 'child_process';
import { pipeline } from 'stream/promises';

let handler = async (m, { conn, text, command, args }) => {
    const reply = (texto) => conn.sendMessage(m.chat, { text: texto }, { quoted: m });

    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });

    // Diccionario extendido de banderas
    const flags = {
        'spa': '🇲🇽 (es)', 'es': '🇲🇽 (es)', 
        'eng': '🇺🇸 (en)', 'en': '🇺🇸 (en)', 
        'jpn': '🇯🇵 (ja)', 'ja': '🇯🇵 (ja)',
        'por': '🇧🇷 (pt)', 'pt': '🇧🇷 (pt)', 
        'ara': '🇸🇦 (ar)', 'ar': '🇸🇦 (ar)', 
        'fre': '🇫🇷 (fr)', 'fra': '🇫🇷 (fr)', 'fr': '🇫🇷 (fr)',
        'ger': '🇩🇪 (de)', 'de': '🇩🇪 (de)', 
        'ita': '🇮🇹 (it)', 'it': '🇮🇹 (it)', 
        'rus': '🇷🇺 (ru)', 'ru': '🇷🇺 (ru)',
        'chi': '🇨🇳 (zh)', 'zh': '🇨🇳 (zh)', 
        'kor': '🇰🇷 (ko)', 'ko': '🇰🇷 (ko)', 
        'und': '🏳️ (??)'
    };

    const downloadMediaStream = async (quoted, outputPath) => {
        try {
            const { downloadContentFromMessage } = await import('baileys');
            const message = quoted.fakeObj ? quoted.fakeObj.message : (quoted.vM ? quoted.vM.message : quoted);
            const type = Object.keys(message)[0];
            const media = message[type];
            if (!media || !media.mediaKey) return false;

            const stream = await downloadContentFromMessage(media, type.replace('Message', ''));
            await pipeline(stream, fs.createWriteStream(outputPath));
            return true;
        } catch (e) { return false; }
    };

    // --- COMANDO .dw (ANÁLISIS) ---
    if (command === 'dw') {
        if (!m.quoted) return reply('Responde a un video o documento.');
        
        try {
            const { downloadContentFromMessage } = await import('baileys');
            const message = m.quoted.fakeObj ? m.quoted.fakeObj.message : (m.quoted.vM ? m.quoted.vM.message : m.quoted);
            const type = Object.keys(message)[0];
            const stream = await downloadContentFromMessage(message[type], type.replace('Message', ''));
            
            const ffprobe = spawn('ffprobe', [
                '-v', 'error', '-probesize', '1M', '-analyzeduration', '1M',
                '-show_streams', '-show_format', '-print_format', 'json', '-i', 'pipe:0'
            ]);

            let stdoutData = '';
            ffprobe.stdin.on('error', (err) => { if (err.code !== 'EPIPE') console.error(err); });
            stream.pipe(ffprobe.stdin);
            ffprobe.stdout.on('data', (chunk) => { stdoutData += chunk; });

            ffprobe.on('close', (code) => {
                if (stream) stream.destroy();
                if (code !== 0 || !stdoutData) return reply('Error al analizar el video.');

                try {
                    const data = JSON.parse(stdoutData);
                    const vStream = data.streams.find(s => s.codec_type === 'video');
                    const resolution = vStream ? `${vStream.width}x${vStream.height}` : 'Desconocida';
                    const durationSec = parseFloat(data.format.duration || 0);
                    const duration = new Date(durationSec * 1000).toISOString().substr(11, 8);
                    
                    let responseText = '┏━━〔 *INFO VIDEO* 〕━━┓\n┃\n';
                    responseText += `┃ 📺 *Resolución:* \`${resolution}\` \n`;
                    responseText += `┃ ⏳ *Duración:* \`${duration}\`\n`;
                    responseText += `┃ ⚖️ *Peso:* \`${(data.format.size / 1024 / 1024).toFixed(2)} MB\`\n┃\n`;
                    
                    const audios = data.streams.filter(s => s.codec_type === 'audio');
                    responseText += '┣━━〔 *AUDIOS* 〕\n';
                    audios.forEach((a, i) => {
                        const lang = (a.tags?.language || 'und').toLowerCase();
                        responseText += `┃ ${i + 1}. ${flags[lang] || '🏳️ (' + lang + ')'} - \`${a.codec_name}\`\n`;
                    });
                    
                    const subs = data.streams.filter(s => s.codec_type === 'subtitle');
                    responseText += '┃\n┣━━〔 *SUBTÍTULOS* 〕\n';
                    if (subs.length === 0) responseText += '┃ 🚫 Ninguno\n';
                    else subs.forEach((s, i) => {
                        const lang = (s.tags?.language || 'und').toLowerCase();
                        responseText += `┃ ${i + 1}. ${flags[lang] || '🏳️ (' + lang + ')'} - \`${s.codec_name}\`\n`;
                    });
                    
                    responseText += '┃\n┗━━━━━━━━━━━━━━━┓\n\n*Uso:* \n_.dw2 [res] [calidad]_\n_.dw3 [res] [pista_audio] [pista_sub]_';
                    reply(responseText);
                } catch (e) { reply('Error procesando datos.'); }
            });
        } catch (e) { reply('Error de conexión con el flujo.'); }
    }

    // --- COMANDOS .dw2, .dw3, .dw4 (CONVERSIÓN) ---
    if (/^(dw2|dw3|dw4)$/i.test(command)) {
        if (!m.quoted) return reply('Responde a un video.');
        const isDw4 = command === 'dw4';
        const isDw3 = command === 'dw3';
        const asDocument = args.includes('doc');
        
        const qualityMap = { 'extrema': '18', 'alta': '23', 'media': '28', 'baja': '33' };
        let res = isDw4 ? '360' : (args[0] || '360');
        let crf = '28'; 

        for (let arg of args) {
            if (qualityMap[arg.toLowerCase()]) {
                crf = qualityMap[arg.toLowerCase()];
                break;
            }
        }

        const timestamp = Date.now();
        const input = `./temp/in_${timestamp}${isDw3 ? '.mkv' : ''}`;
        const output = `./temp/out_${timestamp}.mp4`;

        try {
            reply(`⏳ Procesando... \nResolución: \`${res}p\` | Calidad: \`${Object.keys(qualityMap).find(k => qualityMap[k] === crf) || 'media'}\``);
            
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) return reply('Error al descargar el archivo.');

            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate,duration -of default=noprint_wrappers=1:nokey=1 "${input}"`, (err, stdout) => {
                const lines = stdout.split('\n');
                const duration = parseFloat(lines[1]) || 1;

                let ffmpegArgs = ['-i', input];

                if (isDw4) {
                    const targetSizeKbits = 57 * 8192; 
                    let videoBitrate = Math.max(180, Math.min(2500, Math.floor(targetSizeKbits / duration) - 64));
                    ffmpegArgs.push('-vf', 'scale=-2:360', '-c:v', 'libx264', '-b:v', `${videoBitrate}k`, '-preset', 'fast', '-c:a', 'aac', '-b:a', '64k', '-ac', '1');
                } else if (isDw3) {
                    const aIdx = parseInt(args[1]) - 1 || 0;
                    const sIdx = parseInt(args[2]) - 1 || 0;
                    ffmpegArgs.push('-map', '0:v:0', '-map', `0:a:${aIdx}`, '-vf', `scale=-2:${res},subtitles=${input}:si=${sIdx}`, '-c:v', 'libx264', '-crf', crf, '-preset', 'ultrafast', '-c:a', 'aac', '-b:a', '128k');
                } else {
                    ffmpegArgs.push('-vf', `scale=-2:${res}`, '-c:v', 'libx264', '-crf', crf, '-preset', 'ultrafast', '-c:a', 'copy');
                }

                ffmpegArgs.push('-threads', '2', '-y', output);
                const proc = spawn('nice', ['-n', '10', 'ffmpeg', ...ffmpegArgs]);

                proc.on('close', async (code) => {
                    if (code === 0 && fs.existsSync(output)) {
                        const stats = fs.statSync(output);
                        const mediaOptions = asDocument 
                            ? { document: fs.readFileSync(output), fileName: `Video_${res}p.mp4`, mimetype: 'video/mp4' }
                            : { video: fs.readFileSync(output), caption: `✅ *Listo:* \`${(stats.size / 1024 / 1024).toFixed(2)} MB\`` };
                        
                        await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
                    } else { reply('Error en FFmpeg.'); }
                    if (fs.existsSync(input)) fs.unlinkSync(input);
                    if (fs.existsSync(output)) fs.unlinkSync(output);
                });
            });
        } catch (e) { 
            reply('Error fatal.');
            if (fs.existsSync(input)) fs.unlinkSync(input);
        }
    }
};

handler.command = /^(dw|dw2|dw3|dw4)$/i;
export default handler;
                    
