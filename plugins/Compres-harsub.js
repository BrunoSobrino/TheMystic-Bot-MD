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

    if (command === 'dw') {
        if (!m.quoted) return reply('Responde a un video o documento.');
        const inputVideo = `./temp/video_${Date.now()}`;
        try {
            let success = await downloadMediaStream(m.quoted, inputVideo);
            if (!success) fs.writeFileSync(inputVideo, await m.quoted.download());
            exec(`ffprobe -v quiet -print_format json -show_streams -show_format "${inputVideo}"`, async (error, stdout) => {
                if (error) {
                    if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
                    return reply('Error al analizar.');
                }
                const data = JSON.parse(stdout);
                const vStream = data.streams.find(s => s.codec_type === 'video');
                const resolution = vStream ? `${vStream.width}x${vStream.height}` : 'Desconocida';
                const durationSec = parseFloat(data.format.duration || 0);
                const duration = new Date(durationSec * 1000).toISOString().substr(11, 8);
                let responseText = '> *Informacion del video*\n\n';
                responseText += `> Formato: \`${data.format.format_long_name}\`\n`;
                responseText += `> Resolucion: \`${resolution}\`\n`;
                responseText += `> Duracion: \`${duration}\`\n`;
                responseText += `> Peso: \`${(data.format.size / 1024 / 1024).toFixed(2)} MB\`\n\n`;
                const audios = data.streams.filter(s => s.codec_type === 'audio');
                responseText += '> *Audios disponibles*\n';
                audios.forEach((a, i) => {
                    const lang = (a.tags?.language || 'und').toLowerCase();
                    responseText += `- Pista ${i + 1}: \`${a.codec_name}\` ${flags[lang] || '🏳️'} (\`${lang}\`)\n`;
                });
                const subs = data.streams.filter(s => s.codec_type === 'subtitle');
                responseText += '\n> *Subtitulos disponibles*\n';
                if (subs.length === 0) responseText += '- `Ninguno`\n';
                else subs.forEach((s, i) => {
                    const lang = (s.tags?.language || 'und').toLowerCase();
                    responseText += `- Pista ${i + 1}: \`${s.codec_name}\` ${flags[lang] || '🏳️'} (\`${lang}\`)\n`;
                });
                responseText += '\nUso:\n_*.dw2 [res] [calidad] (doc)*_\n_*.dw3 [res] [audio] [sub] [calidad] (doc)*_\n_*.dw4 (doc)*_';
                reply(responseText);
                if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
            });
        } catch (e) { reply('Error en analisis.'); }
    }

    if (/^(dw2|dw3|dw4)$/i.test(command)) {
        if (!m.quoted) return reply('Responde a un video.');
        const isDw4 = command === 'dw4';
        const isDw3 = command === 'dw3';
        const asDocument = args[args.length - 1]?.toLowerCase() === 'doc';
        let res = isDw4 ? '360' : args[0];
        const timestamp = Date.now();
        const input = `./temp/in_${timestamp}${isDw3 ? '.mkv' : ''}`;
        const output = `./temp/out_${timestamp}.mp4`;

        try {
            reply(`Procesando \`${command}\` a \`${res}p\`...\nModo: \`${asDocument ? 'Documento' : 'Video'}\``);
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());

            // FFPROBE mejorado para obtener duración y FPS para calcular frames totales de forma más fiable
            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate,duration -of default=noprint_wrappers=1:nokey=1 "${input}"`, (err, stdout) => {
                const parts = stdout.split('\n');
                const fpsParts = parts[0].split('/');
                const fps = parseFloat(fpsParts[0]) / parseFloat(fpsParts[1]);
                const duration = parseFloat(parts[1]);
                const totalFrames = Math.floor(fps * duration);

                let ffmpegArgs = ['-i', input];
                if (isDw4) {
                    const targetSizeKbits = 57 * 8192; 
                    let videoBitrate = Math.floor(targetSizeKbits / duration) - 64; 
                    if (videoBitrate > 2500) videoBitrate = 2500;
                    if (videoBitrate < 180) videoBitrate = 180;
                    ffmpegArgs.push('-vf', 'scale=-2:360', '-c:v', 'libx264', '-b:v', `${videoBitrate}k`, '-maxrate', `${videoBitrate}k`, '-bufsize', `${videoBitrate * 2}k`, '-preset', 'fast', '-c:a', 'aac', '-b:a', '64k', '-ac', '1');
                } else if (isDw3) {
                    const aIdx = parseInt(args[1]) - 1;
                    const sIdx = parseInt(args[2]) - 1;
                    ffmpegArgs.push('-map', '0:v:0', '-map', `0:a:${aIdx}`, '-vf', `scale=-2:${res},subtitles=${input}:si=${sIdx}`, '-c:a', 'aac', '-b:a', '128k', '-c:v', 'libx264', '-crf', '32', '-preset', 'ultrafast');
                } else {
                    ffmpegArgs.push('-vf', `scale=-2:${res}`, '-c:a', 'copy', '-c:v', 'libx264', '-crf', '32', '-preset', 'ultrafast');
                }

                ffmpegArgs.push('-threads', '2', '-y', output);
                const proc = spawn('ffmpeg', ffmpegArgs);

                proc.stderr.on('data', (data) => {
                    const line = data.toString();
                    if (line.includes('frame=')) {
                        const frame = line.match(/frame=\s*(\d+)/)?.[1] || '0';
                        const currFps = line.match(/fps=\s*([\d.]+)/)?.[1] || '0';
                        const time = line.match(/time=\s*([\d:.]+)/)?.[1] || '00:00:00';
                        const speed = line.match(/speed=\s*([\d.]+x)/)?.[1] || '0x';
                        let progress = totalFrames > 0 ? ((parseInt(frame) / totalFrames) * 100).toFixed(1) : '0.0';
                        process.stdout.write(`\r\x1b[35m[PROGRESS] ${progress}% | Frame: ${frame} | FPS: ${currFps} | Time: ${time} | Speed: ${speed}\x1b[0m`);
                    }
                });

                proc.on('close', async (code) => {
                    if (code === 0) {
                        const stats = fs.statSync(output);
                        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                        const mediaOptions = asDocument 
                            ? { document: fs.readFileSync(output), fileName: `Video_${res}p.mp4`, mimetype: 'video/mp4' }
                            : { video: fs.readFileSync(output), caption: `✅ Tamaño: ${sizeMB} MB` };
                        await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
                    } else { reply('Error en FFmpeg.'); }
                    if (fs.existsSync(input)) fs.unlinkSync(input);
                    if (fs.existsSync(output)) fs.unlinkSync(output);
                });
            });
        } catch (e) { reply('Error de proceso.'); }
    }
};

handler.command = /^(dw|dw2|dw3|dw4)$/i;
export default handler;
                                                                                                                                                         
