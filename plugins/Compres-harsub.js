import fs from 'fs';
import { exec, spawn } from 'child_process';
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

    const logFFmpegProgress = (label, data, totalFrames = 0) => {
        const line = data.toString();
        if (!line.includes('frame=')) return;
        const frame   = line.match(/frame=\s*(\d+)/)?.[1]            ?? '0';
        const fps     = line.match(/fps=\s*([\d.]+)/)?.[1]           ?? '0';
        const time    = line.match(/time=\s*([\d:.]+)/)?.[1]         ?? '00:00:00';
        const speed   = line.match(/speed=\s*([\d.x]+)/)?.[1]        ?? '0x';
        const bitrate = line.match(/bitrate=\s*([\d.]+\s*\S+)/)?.[1] ?? '-';
        const size    = line.match(/size=\s*(\S+)/)?.[1]             ?? '-';
        const pct    = totalFrames > 0 ? `${((parseInt(frame) / totalFrames) * 100).toFixed(1)}%`.padStart(6) : '  ??%';
        const filled = totalFrames > 0 ? Math.round((parseInt(frame) / totalFrames) * 30) : 0;
        const bar    = `[${'█'.repeat(filled)}${'░'.repeat(30 - filled)}]`;
        process.stdout.write(
            `\r\x1b[36m${label}\x1b[0m ${bar} \x1b[33m${pct}\x1b[0m` +
            `  frame:\x1b[97m${frame.padStart(6)}\x1b[0m` +
            `  fps:\x1b[97m${fps.padStart(5)}\x1b[0m` +
            `  time:\x1b[97m${time}\x1b[0m` +
            `  speed:\x1b[92m${speed.padStart(5)}\x1b[0m` +
            `  br:\x1b[95m${bitrate.padStart(10)}\x1b[0m` +
            `  size:\x1b[94m${size.padStart(8)}\x1b[0m   `
        );
    };

    const calcVideoBitrate = (durationSec, targetMB, audioBitrateK = 128) => {
        if (!durationSec || durationSec <= 0) return 1000;
        const videoBits = targetMB * 8 * 1024 * 1024 - audioBitrateK * 1000 * durationSec;
        return Math.max(100, Math.floor(videoBits / durationSec / 1000));
    };

    const WM     = `drawtext=text='CID':fontcolor=white@0.75:fontsize=w*0.04:x=18:y=14:box=1:boxcolor=black@0.35:boxborderw=6:font=Sans`;
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
            ffprobe.on('close', (code) => {
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
                r += '\nUso:\n_*.dw2 [res] [calidad] (doc)*_\n_*.dw3 [res] [audio] [sub] [calidad] (doc)*_\n_*.dw4 (doc)*_\n_*.mi [res] [pesoMB] (doc)*_';
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
        const label     = `\x1b[35m[MI ${res}p → ${targetMB}MB]\x1b[0m`;
        console.log(`\n${label} Iniciando... ${res}p | ${targetMB} MB | ${asDocument ? 'doc' : 'video'}`);
        try {
            reply(`⚙️ *Comprimiendo video*\n> Resolución: \`${res}p\`\n> Peso objetivo: \`${targetMB} MB\`\n> Modo: \`${asDocument ? 'Documento' : 'Video'}\`\n\nProcesando... esto puede tardar.`);
            console.log(`${label} Descargando...`);
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) { console.log(`${label} Fallback a .download()`); fs.writeFileSync(input, await m.quoted.download()); }
            console.log(`${label} ✔ Descarga completa.`);
            const getDuration    = () => new Promise(r => exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${input}"`, (e, o) => r(parseFloat(o) || 0)));
            const getTotalFrames = () => new Promise(r => exec(`ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "${input}"`, (e, o) => r(parseInt(o) || 0)));
            const [durationSec, totalFrames] = await Promise.all([getDuration(), getTotalFrames()]);
            console.log(`${label} Duración: ${durationSec.toFixed(1)}s | Frames: ${totalFrames}`);
            const AUDIO_KBPS    = 128;
            const videoBitrateK = calcVideoBitrate(durationSec, targetMB, AUDIO_KBPS);
            const maxrateK      = Math.round(videoBitrateK * 1.5);
            const bufsizeK      = maxrateK * 2;
            console.log(`${label} Bitrate → video: ${videoBitrateK}kbps | maxrate: ${maxrateK}kbps | audio: ${AUDIO_KBPS}kbps`);
            const pass1Args = ['-i', input, '-vf', `scale=-2:${res}:flags=lanczos`, '-c:v', 'libx264', '-b:v', `${videoBitrateK}k`, '-maxrate', `${maxrateK}k`, '-bufsize', `${bufsizeK}k`, '-pass', '1', '-an', '-f', 'null', '/dev/null', '-y'];
            console.log(`\n${label} ── PASS 1 / 2 ──`);
            await new Promise((resolve, reject) => {
                const p1 = spawn('ffmpeg', pass1Args);
                p1.stderr.on('data', (d) => logFFmpegProgress(`${label} P1`, d, totalFrames));
                p1.on('close', (code) => {
                    process.stdout.write('\n');
                    if (code === 0) { console.log(`${label} ✔ Pass 1 completado.`); resolve(); }
                    else reject(new Error(`ffmpeg pass1 exited with code ${code}`));
                });
            });
            const pass2Args = ['-i', input, '-vf', withWM(`scale=-2:${res}:flags=lanczos`), '-c:v', 'libx264', '-b:v', `${videoBitrateK}k`, '-maxrate', `${maxrateK}k`, '-bufsize', `${bufsizeK}k`, '-pass', '2', '-c:a', 'aac', '-b:a', `${AUDIO_KBPS}k`, '-ac', '2', '-movflags', '+faststart', '-y', output];
            console.log(`\n${label} ── PASS 2 / 2 ──`);
            await new Promise((resolve, reject) => {
                const p2 = spawn('ffmpeg', pass2Args);
                p2.stderr.on('data', (d) => logFFmpegProgress(`${label} P2`, d, totalFrames));
                p2.on('close', (code) => {
                    process.stdout.write('\n');
                    if (code === 0) resolve();
                    else reject(new Error(`ffmpeg pass2 exited with code ${code}`));
                });
            });
            const finalSizeMB = fs.statSync(output).size / 1024 / 1024;
            console.log(`\n${label} ✅ Peso final: ${finalSizeMB.toFixed(2)} MB | Δ ${Math.abs(finalSizeMB - targetMB).toFixed(2)} MB (${((Math.abs(finalSizeMB - targetMB) / targetMB) * 100).toFixed(1)}%)`);
            const mediaOptions = asDocument
                ? { document: fs.readFileSync(output), fileName: `video_${res}p_${targetMB}mb.mp4`, mimetype: 'video/mp4' }
                : { video: fs.readFileSync(output), caption: `✅ *${res}p* | ${finalSizeMB.toFixed(1)} MB` };
            await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
            console.log(`${label} ✔ Enviado.`);
        } catch (e) {
            console.error(`\n${label} ❌ Error:`, e.message);
            reply(`❌ Error al comprimir:\n\`${e.message}\``);
        } finally {
            [input, output, 'ffmpeg2pass-0.log', 'ffmpeg2pass-0.log.mbtree'].forEach(f => {
                if (fs.existsSync(f)) { fs.unlinkSync(f); console.log(`${label} 🗑 ${f}`); }
            });
        }
    }

    if (/^(dw2|dw3|dw4)$/i.test(command)) {
        if (!m.quoted) return reply('Responde a un video.');
        const isDw4      = command === 'dw4';
        const isDw3      = command === 'dw3';
        const asDocument = args[args.length - 1]?.toLowerCase() === 'doc';
        let res          = isDw4 ? '360' : args[0];
        const timestamp  = Date.now();
        const input      = `./temp/in_${timestamp}${isDw3 ? '.mkv' : ''}`;
        const output     = `./temp/out_${timestamp}.mp4`;
        const label      = `[${command.toUpperCase()}${res ? ' ' + res + 'p' : ''}]`;
        try {
            reply(`⚙️ Procesando \`${command}\` a \`${res}p\`...\nModo: \`${asDocument ? 'Documento' : 'Video'}\``);
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());
            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "${input}"`, (err, stdout) => {
                const totalFrames = parseInt(stdout) || 0;
                let ffmpegArgs = ['-i', input];
                if (isDw4) {
                    ffmpegArgs.push('-vf', withWM('scale=-2:360:flags=lanczos'), '-c:v', 'libx264', '-crf', '24', '-maxrate', '1200k', '-bufsize', '2400k', '-preset', 'medium', '-tune', 'film', '-profile:v', 'high', '-level', '3.1', '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-movflags', '+faststart');
                } else if (isDw3) {
                    const aIdx = parseInt(args[1]) - 1 || 0;
                    const sIdx = parseInt(args[2]) - 1 || 0;
                    ffmpegArgs.push('-map', '0:v:0', '-map', `0:a:${aIdx}`, '-vf', withWM(`scale=-2:${res},subtitles=${input}:si=${sIdx}`), '-c:a', 'aac', '-b:a', '128k', '-c:v', 'libx264', '-crf', '32', '-preset', 'ultrafast');
                } else {
                    ffmpegArgs.push('-vf', withWM(`scale=-2:${res}`), '-c:a', 'copy', '-c:v', 'libx264', '-crf', '32', '-preset', 'ultrafast');
                }
                ffmpegArgs.push('-threads', '2', '-y', output);
                console.log(`\n${label} Iniciando ffmpeg...`);
                const proc = spawn('ffmpeg', ffmpegArgs);
                proc.stderr.on('data', (data) => logFFmpegProgress(label, data, totalFrames));
                proc.on('close', async (code) => {
                    process.stdout.write('\n');
                    if (code === 0) {
                        if (isDw4) {
                            const fileSizeMB = fs.statSync(output).size / 1024 / 1024;
                            console.log(`${label} Peso: ${fileSizeMB.toFixed(1)} MB`);
                            if (fileSizeMB > 60) {
                                reply('📦 Archivo muy pesado, optimizando final...');
                                exec(`ffmpeg -i "${output}" -c:v libx264 -crf 28 -maxrate 1000k -bufsize 2000k -preset fast -c:a aac -b:a 80k -y "${output}_opt.mp4"`, async () => {
                                    const finalFile    = fs.existsSync(`${output}_opt.mp4`) ? `${output}_opt.mp4` : output;
                                    const mediaOptions = asDocument
                                        ? { document: fs.readFileSync(finalFile), fileName: 'Video_360p_HD.mp4', mimetype: 'video/mp4' }
                                        : { video: fs.readFileSync(finalFile) };
                                    await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
                                    [input, output, `${output}_opt.mp4`].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
                                });
                                return;
                            }
                        }
                        const mediaOptions = asDocument
                            ? { document: fs.readFileSync(output), fileName: `Video_${res}p.mp4`, mimetype: 'video/mp4' }
                            : { video: fs.readFileSync(output) };
                        await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
                        console.log(`${label} ✔ Enviado.`);
                    } else {
                        reply('❌ Error en FFmpeg.');
                    }
                    if (fs.existsSync(input))  fs.unlinkSync(input);
                    if (fs.existsSync(output)) fs.unlinkSync(output);
                });
            });
        } catch (e) {
            console.error(`${label} Error:`, e.message);
            reply('❌ Error de proceso.');
        }
    }
};

handler.command = /^(dw|dw2|dw3|dw4|mi)$/i;
export default handler;
