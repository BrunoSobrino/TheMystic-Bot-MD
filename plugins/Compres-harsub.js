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

    // --- COMANDO .dw (INFORMACIÓN) ---
    if (command === 'dw') {
        if (!m.quoted) return reply('Responde a un video o documento.');
        
        try {
            const { downloadContentFromMessage } = await import('baileys');
            const quoted = m.quoted;
            const message = quoted.fakeObj ? quoted.fakeObj.message : (quoted.vM ? quoted.vM.message : quoted);
            const type = Object.keys(message)[0];
            const media = message[type];
            
            if (!media || !media.mediaKey) return reply('Error: No se encontró el medio.');

            const stream = await downloadContentFromMessage(media, type.replace('Message', ''));
            
            const ffprobe = spawn('ffprobe', [
                '-v', 'error', '-probesize', '1M', '-analyzeduration', '1M',
                '-show_streams', '-show_format', '-print_format', 'json', '-i', 'pipe:0'
            ]);

            let stdoutData = '';
            ffprobe.stdin.on('error', (err) => { if (err.code !== 'EPIPE') console.error('[FFPROBE ERROR]', err); });
            stream.pipe(ffprobe.stdin);

            ffprobe.stdout.on('data', (chunk) => { stdoutData += chunk; });

            ffprobe.on('close', (code) => {
                if (stream) stream.destroy();
                if (code !== 0 || !stdoutData) return reply('Error al analizar.');

                const data = JSON.parse(stdoutData);
                const vStream = data.streams.find(s => s.codec_type === 'video');
                const resolution = vStream ? `${vStream.width}x${vStream.height}` : 'Desconocida';
                const durationSec = parseFloat(data.format.duration || 0);
                const duration = new Date(durationSec * 1000).toISOString().substr(11, 8);
                const formatName = data.format.format_long_name ? data.format.format_long_name.split(' / ')[0] : 'Desconocido';

                let responseText = `📊 *Información del video*\n\n`;
                responseText += `📄 Formato: \`${formatName}\`\n`;
                responseText += `📐 Resolución: \`${resolution}\`\n`;
                responseText += `⏱️ Duración: \`${duration}\`\n`;
                responseText += `💾 Peso: \`${(data.format.size / 1024 / 1024).toFixed(2)} MB\`\n\n`;

                const audios = data.streams.filter(s => s.codec_type === 'audio');
                responseText += `🔊 *Audios:* ${audios.length}\n`;
                audios.forEach((a, i) => {
                    const lang = (a.tags?.language || 'und').toLowerCase();
                    responseText += `  ${i + 1}. \`${a.codec_name}\` ${flags[lang] || '🏳️'}\n`;
                });

                const subs = data.streams.filter(s => s.codec_type === 'subtitle');
                responseText += `📝 *Subtítulos:* ${subs.length}\n`;
                
                responseText += `\n🎯 *USO .dw2:*\n`;
                responseText += `• \`.dw2 720\` → 720p **sin límites**\n`;
                responseText += `• \`.dw2 720 30\` → 720p máx 30MB\n`;
                responseText += `• \`.dw2 720 30 doc\` → Como documento\n`;
                responseText += `• \`.dw2\` → 480p sin límites (por defecto)`;
                
                reply(responseText);
            });
        } catch (e) { reply('Error en análisis.'); }
    }

    // --- COMANDO .dw2 TODO EN UNO ---
    if (command === 'dw2') {
        if (!m.quoted) return reply('❌ Responde a un video.');
        
        const asDocument = args[args.length - 1]?.toLowerCase() === 'doc';
        let res = parseInt(args[0]) || 480;
        let maxSizeMB = parseFloat(args[1]);
        const isLimited = maxSizeMB && !isNaN(maxSizeMB);
        
        const timestamp = Date.now();
        const input = `./temp/in_${timestamp}.mp4`;
        const output = `./temp/out_${timestamp}.mp4`;

        try {
            let msg = `🔄 Procesando .dw2 → **${res}p**`;
            if (isLimited) msg += ` | 📦 Máx: **${maxSizeMB}MB**`;
            else msg += ` | 🚀 **Sin límites**`;
            msg += `\n📱 Modo: ${asDocument ? '📎 Documento' : '🎥 Video'}`;
            reply(msg);
            
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());

            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "${input}"`, (err, stdout) => {
                const totalFrames = parseInt(stdout) || 0;

                let ffmpegArgs = [
                    '-i', input,
                    '-vf', `scale=-2:${res}:flags=lanczos`,
                    '-c:v', 'libx264',
                    '-preset', isLimited ? 'fast' : 'slow',
                    '-tune', 'film'
                ];

                // Configuración de calidad según límites
                if (!isLimited) {
                    // ⭐ SIN LÍMITES = CALIDAD MÁXIMA
                    ffmpegArgs.push('-crf', '22', '-profile:v', 'high', '-level', '4.1');
                    ffmpegArgs.push('-c:a', 'aac', '-b:a', '128k', '-ac', '2');
                } else {
                    // 📦 CON LÍMITES = Balanceado
                    const targetBitrate = Math.max(400, (maxSizeMB * 1024 * 8 / (totalFrames / 30)) / 1.2);
                    ffmpegArgs.push('-crf', '26', '-maxrate', `${targetBitrate}k`, '-bufsize', `${targetBitrate * 2}k`);
                    ffmpegArgs.push('-c:a', 'aac', '-b:a', '96k', '-ac', '2');
                }

                ffmpegArgs.push('-movflags', '+faststart', '-threads', '2', '-y', output);

                const proc = spawn('ffmpeg', ffmpegArgs);

                proc.stderr.on('data', (data) => {
                    const line = data.toString();
                    if (line.includes('frame=')) {
                        const frame = line.match(/frame=\s*(\d+)/)?.[1] || '0';
                        const progress = totalFrames > 0 ? ((parseInt(frame) / totalFrames) * 100).toFixed(1) : '0';
                        process.stdout.write(`\r\x1b[32m[DW2] ${progress}% ${frame} frames\x1b[0m`);
                    }
                });

                proc.on('close', async (code) => {
                    process.stdout.write('\n');
                    if (code === 0 && fs.existsSync(output)) {
                        const fileSizeMB = fs.statSync(output).size / 1024 / 1024;
                        
                        // Reprocesar si excede límite
                        if (isLimited && fileSizeMB > maxSizeMB) {
                            reply(`📦 ${fileSizeMB.toFixed(1)}MB > ${maxSizeMB}MB → Optimizando...`);
                            exec(`ffmpeg -i "${output}" -c:v libx264 -crf 28 -maxrate 800k -bufsize 1600k -preset fast -c:a aac -b:a 80k -y "${output}_opt.mp4"`, async (err) => {
                                sendFile(output, fileSizeMB, res, asDocument, m, conn, maxSizeMB);
                            });
                            return;
                        }
                        
                        sendFile(output, fileSizeMB, res, asDocument, m, conn, maxSizeMB);
                    } else {
                        reply('❌ Error en FFmpeg.');
                        cleanup([input, output]);
                    }
                });
            });
        } catch (e) {
            reply('❌ Error en proceso.');
            cleanup([input, output]);
        }
    }
};

// Funciones auxiliares
const sendFile = async (filePath, sizeMB, res, asDocument, m, conn, maxSizeMB) => {
    const finalSizeMB = fs.statSync(filePath).size / 1024 / 1024;
    const fileName = `Video_${res}p_${finalSizeMB.toFixed(0)}MB.mp4`;
    
    const mediaOptions = asDocument 
        ? { document: fs.readFileSync(filePath), fileName, mimetype: 'video/mp4' }
        : { video: fs.readFileSync(filePath) };
    
    await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
    
    let status = maxSizeMB ? `📦 ${finalSizeMB.toFixed(1)}/${maxSizeMB}MB` : `📦 ${finalSizeMB.toFixed(1)}MB`;
    reply(`✅ **${res}p Listo!** 🎬\n${status}`);
    
    cleanup([filePath]);
};

const cleanup = (files) => {
    files.forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
    });
};

handler.command = /^(dw|dw2)$/i;
export default handler;
