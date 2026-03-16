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

    // Función de descarga con log en terminal
    const downloadMediaStream = async (quoted, outputPath) => {
        try {
            const { downloadContentFromMessage } = await import('baileys');
            const message = quoted.fakeObj ? quoted.fakeObj.message : (quoted.vM ? quoted.vM.message : quoted);
            const type = Object.keys(message)[0];
            const media = message[type];
            if (!media || !media.mediaKey) return false;

            console.log(`\x1b[36m[DOWNLOAD] Iniciando descarga de: ${type}\x1b[0m`);
            const stream = await downloadContentFromMessage(media, type.replace('Message', ''));
            
            let downloadedBytes = 0;
            stream.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                process.stdout.write(`\r\x1b[36m[DOWNLOAD] Recibido: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB\x1b[0m`);
            });

            await pipeline(stream, fs.createWriteStream(outputPath));
            console.log(`\n\x1b[32m[DOWNLOAD] Completado: ${outputPath}\x1b[0m`);
            return true;
        } catch (e) { 
            console.error('\x1b[31m[DOWNLOAD ERROR]\x1b[0m', e);
            return false; 
        }
    };

    // --- COMANDO DE ANÁLISIS RÁPIDO (.dw) ---
    if (command === 'dw') {
        if (!m.quoted) return reply('Responde a un video o documento.');
        const inputVideo = `./temp/video_${Date.now()}`;
        try {
            let success = await downloadMediaStream(m.quoted, inputVideo);
            if (!success) {
                console.log('\x1b[33m[INFO] Intentando descarga alternativa...\x1b[0m');
                fs.writeFileSync(inputVideo, await m.quoted.download());
            }
            
            console.log(`\x1b[34m[ANALYSIS] Ejecutando ffprobe rápido...\x1b[0m`);
            exec(`ffprobe -v error -probesize 64K -analyzeduration 0 -print_format json -show_streams -show_format "${inputVideo}"`, async (error, stdout) => {
                if (error) {
                    if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
                    return reply('Error al analizar.');
                }
                const data = JSON.parse(stdout);
                const vStream = data.streams.find(s => s.codec_type === 'video');
                const resolution = vStream ? `${vStream.width}x${vStream.height}` : 'Desconocida';
                const durationSec = parseFloat(data.format.duration || 0);
                const duration = new Date(durationSec * 1000).toISOString().substr(11, 8);
                
                let responseText = '> *Información del video*\n\n';
                responseText += `> Resolución: \`${resolution}\` | Duración: \`${duration}\`\n`;
                responseText += `> Peso: \`${(data.format.size / 1024 / 1024).toFixed(2)} MB\`\n\n`;
                
                const audios = data.streams.filter(s => s.codec_type === 'audio');
                responseText += '> *Audios disponibles*\n';
                audios.forEach((a, i) => {
                    const lang = (a.tags?.language || 'und').toLowerCase();
                    responseText += `- Pista ${i + 1}: \`${a.codec_name}\` ${flags[lang] || '🏳️'}\n`;
                });
                
                const subs = data.streams.filter(s => s.codec_type === 'subtitle');
                responseText += '\n> *Subtítulos disponibles*\n';
                if (subs.length === 0) responseText += '- `Ninguno`\n';
                else subs.forEach((s, i) => {
                    const lang = (s.tags?.language || 'und').toLowerCase();
                    responseText += `- Pista ${i + 1}: \`${s.codec_name}\` ${flags[lang] || '🏳️'}\n`;
                });
                
                responseText += '\nUso:\n_*.dw2 [res] [calidad] (doc)*_\n_*.dw3 [res] [audio] [sub] [calidad] (doc)*_\n_*.dw4 (doc)*_';
                reply(responseText);
                console.log(`\x1b[32m[ANALYSIS] Finalizado con éxito.\x1b[0m`);
                if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
            });
        } catch (e) { reply('Error en análisis.'); }
    }

    // --- COMANDOS DE ENCODING (.dw2, .dw3, .dw4) ---
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
            reply(`Procesando \`${command}\` (\`${res}p\`) | Calidad: \`${Object.keys(qualityMap).find(k => qualityMap[k] === crf) || 'media'}\`...`);
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());

            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate,duration -of default=noprint_wrappers=1:nokey=1 "${input}"`, (err, stdout) => {
                const lines = stdout.split('\n');
                const fps = eval(lines[0]) || 24;
                const duration = parseFloat(lines[1]) || 1;
                const totalFrames = Math.floor(fps * duration);

                let ffmpegArgs = ['-i', input];

                if (isDw4) {
                    const targetSizeKbits = 57 * 8192; 
                    let videoBitrate = Math.floor(targetSizeKbits / duration) - 64; 
                    if (videoBitrate > 2500) videoBitrate = 2500;
                    if (videoBitrate < 180) videoBitrate = 180;
                    ffmpegArgs.push('-vf', 'scale=-2:360', '-c:v', 'libx264', '-b:v', `${videoBitrate}k`, '-maxrate', `${videoBitrate}k`, '-bufsize', `${videoBitrate * 2}k`, '-preset', 'fast', '-c:a', 'aac', '-b:a', '64k', '-ac', '1');
                } else if (isDw3) {
                    const aIdx = parseInt(args[1]) - 1 || 0;
                    const sIdx = parseInt(args[2]) - 1 || 0;
                    ffmpegArgs.push('-map', '0:v:0', '-map', `0:a:${aIdx}`, '-vf', `scale=-2:${res},subtitles=${input}:si=${sIdx}`, '-c:v', 'libx264', '-crf', crf, '-preset', 'ultrafast', '-c:a', 'aac', '-b:a', '128k');
                } else {
                    ffmpegArgs.push('-vf', `scale=-2:${res}`, '-c:v', 'libx264', '-crf', crf, '-preset', 'ultrafast', '-c:a', 'copy');
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
                            : { video: fs.readFileSync(output), caption: `✅ Tamaño final: ${sizeMB} MB` };
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
                
