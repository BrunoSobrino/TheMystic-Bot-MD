import fs from 'fs';
import path from 'path';
import { exec, spawn, execSync } from 'child_process';
import { pipeline } from 'stream/promises';

let handler = async (m, { conn, text, command, args }) => {
    const reply = (texto) => conn.sendMessage(m.chat, { text: texto }, { quoted: m });

    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });

    const flags = {
        'spa': '🇲🇽', 'es': '🇲🇽', 'eng': '🇺🇸', 'en': '🇺🇸', 'jpn': '🇯🇵', 'ja': '🇯🇵',
        'por': '🇧🇷', 'pt': '🇧🇷', 'ara': '🇸🇦', 'ar': '🇸🇦', 'fre': '🇫🇷', 'fra': '🇫🇷', 'fr': '🇫🇷',
        'ger': '🇩🇪', 'de': '🇩🇪', 'ita': '🇮🇹', 'it': '🇮🇹', 'rus': '🇷🇺', 'ru': '🇷🇺',
        'chi': '🇨🇳', 'zh': '🇨🇳', 'kor': '🇰🇷', 'ko': '🇰🇷', 'und': '🏳️'
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

    const colors = {
        reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m',
        blue: '\x1b[34m', magenta: '\x1b[35m', red: '\x1b[31m'
    };

    const logFFmpegProgress = (label, data, totalFrames = 0) => {
        const line = data.toString();
        if (!line.includes('frame=')) return;
        const frameMatch = line.match(/frame=\s*(\d+)/);
        const fpsMatch = line.match(/fps=\s*([\d.]+)/);
        const timeMatch = line.match(/time=\s*([\d:.]+)/);
        const speedMatch = line.match(/speed=\s*([\d.x]+)/);
        if (!frameMatch) return;

        const frame = parseInt(frameMatch[1]);
        const fps = fpsMatch ? parseFloat(fpsMatch[1]) : 0;
        const time = timeMatch ? timeMatch[1] : '00:00:00';
        const speed = speedMatch ? speedMatch[1] : '0x';

        let percentage = '000';
        if (totalFrames > 0) {
            const pct = (frame / totalFrames) * 100;
            percentage = pct.toFixed(0).padStart(3, '0');
        }
        const output = `\r${colors.cyan}[[${label}]]${colors.reset} Progreso ${colors.green}${percentage}%${colors.reset} | Frame: ${colors.yellow}${frame}${colors.reset} | FPS: ${colors.blue}${Math.round(fps)}${colors.reset} | Time: ${colors.magenta}${time}${colors.reset} | Speed: ${colors.red}${speed}${colors.reset}`;
        process.stdout.write(output);
    };

    const calcVideoBitrate = (durationSec, targetMB, audioBitrateK = 128) => {
        if (!durationSec || durationSec <= 0) return 1000;
        const videoBits = targetMB * 8 * 1024 * 1024 - audioBitrateK * 1000 * durationSec;
        return Math.max(100, Math.floor(videoBits / durationSec / 1000));
    };

    // Marca de agua configurada según tu solicitud previa
    const WM = `drawtext=fontfile='/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans-Oblique.ttf':text='By\\:CID':fontcolor=white:fontsize=w*0.04:x=20:y=20:borderw=2:bordercolor=black:alpha='if(lt(t,4),1,if(lt(t,5),5-t,0))'`;
    const withWM = (vf) => `${vf},${WM}`;

    if (command === 'dw') {
        if (!m.quoted) return reply('Responde a un video o documento.');
        try {
            const { downloadContentFromMessage } = await import('baileys');
            const quoted  = m.quoted;
            const message = quoted.fakeObj ? quoted.fakeObj.message : (quoted.vM ? quoted.vM.message : quoted);
            const type    = Object.keys(message)[0];
            const media   = message[type];
            if (!media || !media.mediaKey) return reply('Error: No se encontró el medio.');
            const stream  = await downloadContentFromMessage(media, type.replace('Message', ''));
            const ffprobe = spawn('ffprobe', ['-v', 'error', '-probesize', '1M', '-analyzeduration', '1M', '-show_streams', '-show_format', '-print_format', 'json', '-i', 'pipe:0']);
            let stdoutData = '';
            ffprobe.stdin.on('error', (err) => { if (err.code !== 'EPIPE') console.error('[FFPROBE ERROR]', err); });
            stream.pipe(ffprobe.stdin);
            ffprobe.stdout.on('data', (chunk) => { stdoutData += chunk; });
            ffprobe.on('close', async (code) => {
                if (stream) stream.destroy();
                if (code !== 0 || !stdoutData) return reply('Error al analizar en tiempo real.');
                const data        = JSON.parse(stdoutData);
                const vStream     = data.streams.find(s => s.codec_type === 'video');
                const resolution  = vStream ? `${vStream.width}x${vStream.height}` : 'Desconocida';
                const durationSec = parseFloat(data.format.duration || 0);
                const duration    = new Date(durationSec * 1000).toISOString().substr(11, 8);
                const formatName  = data.format.format_long_name ? data.format.format_long_name.split(' / ')[0] : 'Desconocido';

                let r = '> *Información del video*\n\n';
                r += `> Formato: \`${formatName}\`\n`;
                r += `> Resolución: \`${resolution}\`\n`;
                r += `> Duración: \`${duration}\`\n`;
                r += `> Peso: \`${(data.format.size / 1024 / 1024).toFixed(2)} MB\`\n\n`;
                const audios = data.streams.filter(s => s.codec_type === 'audio');
                r += '> *Audios disponibles*\n';
                audios.forEach((a, i) => {
                    const lang = (a.tags?.language || 'und').toLowerCase();
                    r += `- Pista ${i + 1}: \`${a.codec_name}\` ${flags[lang] || '🏳️'} (\`${lang}\`)\n`;
                });
                const subs = data.streams.filter(s => s.codec_type === 'subtitle');
                r += '\n> *Subtítulos disponibles*\n';
                if (subs.length === 0) r += '- `Ninguno`\n';
                else subs.forEach((s, i) => {
                    const lang = (s.tags?.language || 'und').toLowerCase();
                    r += `- Pista ${i + 1}: \`${s.codec_name}\` ${flags[lang] || '🏳️'} (\`${lang}\`)\n`;
                });
                r += '\n_*.dw2 [res] (doc)*_\n_*.dw3 [res] [audio] [sub] (doc)*_\n_*.dw4 (doc)*_\n_*.mi [res] [pesoMB] (doc)*_';
                reply(r);
            });
        } catch (e) {
            console.error('[DW] Error crítico:', e);
            reply('Error crítico en el análisis de flujo.');
        }
    }

    if (command === 'mi') {
        if (!m.quoted) return reply('Responde a un video.\nUso: *.mi [resolución] [pesoMB]*\nEjemplo: `.mi 720 200mb`');
        const asDocument = args[args.length - 1]?.toLowerCase() === 'doc';
        const res        = parseInt(args[0]);
        const targetMB   = args[1] ? parseFloat(args[1].replace(/mb/i, '')) : NaN;
        if (!res || isNaN(res))           return reply('❌ Especifica la resolución. Ej: `.mi 720 200mb`');
        if (!targetMB || isNaN(targetMB)) return reply('❌ Especifica el peso objetivo. Ej: `.mi 720 200mb`');

        const timestamp = Date.now();
        const input     = `./temp/mi_in_${timestamp}`;
        const output    = `./temp/mi_out_${timestamp}.mp4`;
        const logPrefix = `./temp/ffmpeg2pass_${timestamp}`;
        const label     = `MI ${res}p → ${targetMB}MB`;

        try {
            reply(`⚙️ *Comprimiendo video*\n> Resolución: \`${res}p\`\n> Peso objetivo: \`${targetMB} MB\`\n\nProcesando...`);
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());

            // CORRECCIÓN: Uso de execSync (ES Modules) para evitar "require is not defined"
            const totalFrames = parseInt(execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "${input}"`, { encoding: 'utf8' }).trim()) || 0;
            
            const AUDIO_KBPS = 96;
            const videoBitrateK = calcVideoBitrate(totalFrames / 30, targetMB, AUDIO_KBPS);

            // PASS 1 - Optimizado para Termux
            await new Promise((resolve, reject) => {
                const p1 = spawn('ffmpeg', [
                    '-i', input, '-vf', `scale=-2:${res}:flags=fast_bilinear`,
                    '-c:v', 'libx264', '-b:v', `${videoBitrateK}k`, '-pass', '1', '-passlogfile', logPrefix, 
                    '-preset', 'ultrafast', '-threads', '2', '-f', 'null', '-y', '/dev/null'
                ]);
                p1.stderr.on('data', (d) => logFFmpegProgress(`${label} - PASS 1/2`, d, totalFrames));
                p1.on('close', (code) => code === 0 ? resolve() : reject(new Error(`pass1 code ${code}`)));
            });

            // PASS 2 - Corregido para evitar Error 187 (Preset y Threads ajustados)
            await new Promise((resolve, reject) => {
                const p2 = spawn('ffmpeg', [
                    '-i', input, '-vf', withWM(`scale=-2:${res}:flags=fast_bilinear`),
                    '-c:v', 'libx264', '-b:v', `${videoBitrateK}k`, '-pass', '2', '-passlogfile', logPrefix, 
                    '-preset', 'veryfast', '-c:a', 'aac', '-b:a', `${AUDIO_KBPS}k`, '-ac', '2', 
                    '-threads', '2', '-movflags', '+faststart', '-y', output
                ]);
                p2.stderr.on('data', (d) => logFFmpegProgress(`${label} - PASS 2/2`, d, totalFrames));
                p2.on('close', (code) => code === 0 ? resolve() : reject(new Error(`pass2 code ${code}`)));
            });

            const finalSizeMB = fs.statSync(output).size / 1024 / 1024;
            const mediaOptions = asDocument
                ? { document: fs.readFileSync(output), fileName: `video_${res}p_${targetMB}mb.mp4`, mimetype: 'video/mp4' }
                : { video: fs.readFileSync(output), caption: `✅ *${res}p* | ${finalSizeMB.toFixed(1)} MB` };
            
            await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
        } catch (e) {
            console.error(e);
            reply(`❌ Error al comprimir:\n\`${e.message}\``);
        } finally {
            // Limpieza rigurosa de logs de doble pasada
            [input, output, `${logPrefix}-0.log`, `${logPrefix}-0.log.mbtree`].forEach(f => {
                try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
            });
        }
    }

    if (/^(dw2|dw3|dw4)$/i.test(command)) {
        if (!m.quoted) return reply('Responde a un video.');
        const isDw4      = command === 'dw4';
        const isDw3      = command === 'dw3';
        const asDocument = args[args.length - 1]?.toLowerCase() === 'doc';
        let res          = isDw4 ? '360' : (args[0] || '360');
        const timestamp  = Date.now();
        const input      = `./temp/in_${timestamp}`;
        const output     = `./temp/out_${timestamp}.mp4`;
        const label      = `${command.toUpperCase()} ${res}p`;

        try {
            reply(`⚙️ Procesando \`${command}\` a \`${res}p\`...`);
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());

            const totalFrames = parseInt(execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "${input}"`, { encoding: 'utf8' }).trim()) || 0;

            let ffmpegArgs = ['-i', input];

            if (isDw4) {
                ffmpegArgs.push('-vf', withWM('scale=-2:360:flags=fast_bilinear'), '-c:v', 'libx264', '-crf', '28', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '64k');
            } else if (isDw3) {
                const aIdx = parseInt(args[1]) - 1 || 0;
                const sIdx = parseInt(args[2]) - 1 || 0;
                const escapedInput = input.replace(/'/g, "'\\''");
                ffmpegArgs.push('-map', '0:v:0', '-map', `0:a:${aIdx}`, '-vf', withWM(`scale=-2:${res}:flags=fast_bilinear,subtitles='${escapedInput}':si=${sIdx}`), '-c:v', 'libx264', '-crf', '26', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '80k');
            } else {
                ffmpegArgs.push('-vf', withWM(`scale=-2:${res}:flags=fast_bilinear`), '-c:v', 'libx264', '-crf', '24', '-preset', 'veryfast', '-c:a', 'copy');
            }

            ffmpegArgs.push('-threads', '2', '-movflags', '+faststart', '-y', output);

            await new Promise((resolve, reject) => {
                const proc = spawn('ffmpeg', ffmpegArgs);
                proc.stderr.on('data', (d) => logFFmpegProgress(label, d, totalFrames));
                proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`FFmpeg falló: ${code}`)));
            });

            const mediaOptions = asDocument
                ? { document: fs.readFileSync(output), fileName: `Video_${res}p.mp4`, mimetype: 'video/mp4' }
                : { video: fs.readFileSync(output), caption: `✅ *${res}p* | ${(fs.statSync(output).size / 1024 / 1024).toFixed(1)} MB` };
            
            await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
        } catch (e) {
            reply(`❌ Error: ${e.message}`);
        } finally {
            [input, output].forEach(f => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {} });
        }
    }
};

handler.command = /^(dw|dw2|dw3|dw4|mi)$/i;
export default handler;
            
