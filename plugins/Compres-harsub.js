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

    // ─────────────────────────────────────────────
    // COMANDO .dw — Análisis instantáneo de metadatos
    // ─────────────────────────────────────────────
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
                '-v', 'error',
                '-probesize', '1M',
                '-analyzeduration', '1M',
                '-show_streams',
                '-show_format',
                '-print_format', 'json',
                '-i', 'pipe:0'
            ]);

            let stdoutData = '';

            ffprobe.stdin.on('error', (err) => {
                if (err.code !== 'EPIPE') console.error('[FFPROBE ERROR]', err);
            });

            stream.pipe(ffprobe.stdin);

            ffprobe.stdout.on('data', (chunk) => {
                stdoutData += chunk;
            });

            ffprobe.on('close', (code) => {
                if (stream) stream.destroy();

                if (code !== 0 || !stdoutData) return reply('Error al analizar en tiempo real.');

                const data = JSON.parse(stdoutData);
                const vStream = data.streams.find(s => s.codec_type === 'video');
                const resolution = vStream ? `${vStream.width}x${vStream.height}` : 'Desconocida';
                const durationSec = parseFloat(data.format.duration || 0);
                const duration = new Date(durationSec * 1000).toISOString().substr(11, 8);
                const formatName = data.format.format_long_name ? data.format.format_long_name.split(' / ')[0] : 'Desconocido';

                let responseText = '> *Informacion del video*\n\n';
                responseText += `> Formato: \`${formatName}\`\n`;
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
                
                responseText += '\nUso:\n';
                responseText += '_*.dw2 [res] [calidad] (doc)*_\n';
                responseText += '_*.dw3 [res] [audio] [sub] [calidad] (doc)*_\n';
                responseText += '_*.dw4 (doc)*_\n';
                responseText += '_*.mi [res] [pesoMB] (doc)*_';
                
                reply(responseText);
            });

        } catch (e) { 
            reply('Error crítico en el análisis de flujo.'); 
        }
    }

    // ─────────────────────────────────────────────
    // COMANDO .mi — Comprimir a resolución y peso objetivo
    // Uso: .mi 720 200mb   o   .mi 1080 500mb doc
    // Sin límite de peso — el usuario manda.
    // ─────────────────────────────────────────────
    if (command === 'mi') {
        if (!m.quoted) return reply('Responde a un video.\nUso: _.mi [resolución] [pesoMB]_\nEjemplo: _.mi 720 200mb_');

        // ── Parseo de argumentos ──────────────────
        const asDocument  = args[args.length - 1]?.toLowerCase() === 'doc';
        const cleanArgs   = asDocument ? args.slice(0, -1) : [...args];

        const res         = parseInt(cleanArgs[0]);   // ej: 720
        const targetRaw   = cleanArgs[1]?.toLowerCase().replace('mb', '').trim(); // ej: "200"
        const targetMB    = parseFloat(targetRaw);

        if (!res || isNaN(res) || res < 144 || res > 4320)
            return reply('❌ Resolución inválida. Usa un valor como 360, 480, 720, 1080.');
        if (!targetMB || isNaN(targetMB) || targetMB <= 0)
            return reply('❌ Peso objetivo inválido.\nEjemplo: _.mi 720 200mb_');

        const timestamp = Date.now();
        const input  = `./temp/mi_in_${timestamp}`;
        const output = `./temp/mi_out_${timestamp}.mp4`;

        try {
            reply(`⚙️ Procesando \`.mi\`...\n> Resolución: \`${res}p\`\n> Peso objetivo: \`${targetMB} MB\`\n> Modo: \`${asDocument ? 'Documento' : 'Video'}\``);

            // ── Descarga ──────────────────────────
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());

            // ── Obtener duración real con ffprobe ──
            const getDuration = () => new Promise((resolve) => {
                exec(
                    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${input}"`,
                    (err, stdout) => resolve(parseFloat(stdout) || 0)
                );
            });

            const getTotalFrames = () => new Promise((resolve) => {
                exec(
                    `ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "${input}"`,
                    (err, stdout) => resolve(parseInt(stdout) || 0)
                );
            });

            const [durationSec, totalFrames] = await Promise.all([getDuration(), getTotalFrames()]);

            if (durationSec <= 0) {
                if (fs.existsSync(input)) fs.unlinkSync(input);
                return reply('❌ No se pudo determinar la duración del video.');
            }

            // ── Cálculo de bitrate objetivo (2-pass ready) ─
            // Fórmula: bitrate_kbps = (targetMB * 8192) / durationSec
            // Reservamos ~10% para audio (128 kbps) y overhead de contenedor
            const AUDIO_KBPS      = 128;
            const OVERHEAD_FACTOR = 0.95;                                          // 5% overhead contenedor
            const totalKbps       = ((targetMB * 8192) / durationSec) * OVERHEAD_FACTOR;
            const videoBitrateKbps = Math.max(Math.floor(totalKbps - AUDIO_KBPS), 100); // mínimo 100k video
            const maxrateKbps     = Math.floor(videoBitrateKbps * 1.5);
            const bufsizeKbps     = maxrateKbps * 2;

            console.log(`[MI] dur=${durationSec.toFixed(1)}s | target=${targetMB}MB | vbr=${videoBitrateKbps}k | max=${maxrateKbps}k`);

            // ── Construcción de argumentos ffmpeg ─
            // Usamos 2-pass encoding para máxima precisión de peso
            const passlogFile = `./temp/mi_pass_${timestamp}`;

            const commonVideoArgs = [
                '-vf',    `scale=-2:${res}:flags=lanczos`,
                '-c:v',   'libx264',
                '-b:v',   `${videoBitrateKbps}k`,
                '-maxrate', `${maxrateKbps}k`,
                '-bufsize',  `${bufsizeKbps}k`,
                '-preset', 'medium',
                '-profile:v', 'high',
            ];

            // PASS 1 — solo análisis, sin audio, sin archivo útil
            const pass1Args = [
                '-y', '-i', input,
                ...commonVideoArgs,
                '-pass', '1',
                '-passlogfile', passlogFile,
                '-an',
                '-f', 'null', '/dev/null'
            ];

            // PASS 2 — codificación real con audio
            const pass2Args = [
                '-y', '-i', input,
                ...commonVideoArgs,
                '-pass', '2',
                '-passlogfile', passlogFile,
                '-c:a', 'aac',
                '-b:a', `${AUDIO_KBPS}k`,
                '-ac', '2',
                '-movflags', '+faststart',
                '-threads', '2',
                output
            ];

            // ── Función auxiliar para correr un proceso ffmpeg ─
            const runFFmpeg = (ffArgs, label) => new Promise((resolve, reject) => {
                const proc = spawn('ffmpeg', ffArgs);

                proc.stderr.on('data', (data) => {
                    const line = data.toString();
                    if (line.includes('frame=')) {
                        const frame    = line.match(/frame=\s*(\d+)/)?.[1]    || '0';
                        const fps      = line.match(/fps=\s*([\d.]+)/)?.[1]   || '0';
                        const time     = line.match(/time=\s*([\d:.]+)/)?.[1] || '00:00:00';
                        const speed    = line.match(/speed=\s*([\d.]+x)/)?.[1]|| '0x';
                        const progress = totalFrames > 0
                            ? ((parseInt(frame) / totalFrames) * 100).toFixed(1)
                            : '0.0';
                        process.stdout.write(
                            `\r\x1b[36m[${label}] ${progress}% | Frame: ${frame} | FPS: ${fps} | Time: ${time} | Speed: ${speed}\x1b[0m`
                        );
                    }
                });

                proc.on('close', (code) => {
                    process.stdout.write('\n');
                    code === 0 ? resolve() : reject(new Error(`FFmpeg ${label} falló (code ${code})`));
                });
            });

            // ── Ejecución 2-pass ──────────────────
            await runFFmpeg(pass1Args, 'PASS1');
            await runFFmpeg(pass2Args, 'PASS2');

            // ── Verificación de peso resultante ───
            const finalSizeMB = fs.statSync(output).size / 1024 / 1024;
            console.log(`[MI] Resultado: ${finalSizeMB.toFixed(2)} MB (objetivo: ${targetMB} MB)`);

            // ── Envío ─────────────────────────────
            const mediaOptions = asDocument
                ? { document: fs.readFileSync(output), fileName: `Video_${res}p_${targetMB}MB.mp4`, mimetype: 'video/mp4' }
                : { video: fs.readFileSync(output) };

            await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
            reply(`✅ Listo\n> Resolución: \`${res}p\`\n> Peso final: \`${finalSizeMB.toFixed(2)} MB\` / objetivo \`${targetMB} MB\``);

        } catch (e) {
            console.error('[MI ERROR]', e);
            reply('❌ Error al comprimir el video.');
        } finally {
            // ── Limpieza ──────────────────────────
            const passlog1 = `./temp/mi_pass_${timestamp}-0.log`;
            const passlog2 = `./temp/mi_pass_${timestamp}-0.log.mbtree`;
            [input, output, passlog1, passlog2].forEach(f => {
                if (fs.existsSync(f)) fs.unlinkSync(f);
            });
        }
    }

    // ─────────────────────────────────────────────
    // COMANDOS .dw2 / .dw3 / .dw4 — Procesamiento
    // ─────────────────────────────────────────────
    if (/^(dw2|dw3|dw4)$/i.test(command)) {
        if (!m.quoted) return reply('Responde a un video.');
        
        const isDw4 = command === 'dw4';
        const isDw3 = command === 'dw3';
        const asDocument = args[args.length - 1]?.toLowerCase() === 'doc';
        
        let res = isDw4 ? '360' : args[0];
        const timestamp = Date.now();
        const input  = `./temp/in_${timestamp}${isDw3 ? '.mkv' : ''}`;
        const output = `./temp/out_${timestamp}.mp4`;

        try {
            reply(`Procesando \`${command}\` a \`${res}p\`...\nModo: \`${asDocument ? 'Documento' : 'Video'}\``);
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());

            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "${input}"`, (err, stdout) => {
                const totalFrames = parseInt(stdout) || 0;

                let ffmpegArgs = ['-i', input];
                
                if (isDw4) {
                    ffmpegArgs.push(
                        '-vf', 'scale=-2:360:flags=lanczos',
                        '-c:v', 'libx264',
                        '-crf', '24',
                        '-maxrate', '1200k',
                        '-bufsize', '2400k',
                        '-preset', 'medium',
                        '-tune', 'film',
                        '-profile:v', 'high',
                        '-level', '3.1',
                        '-c:a', 'aac',
                        '-b:a', '96k',
                        '-ac', '2',
                        '-movflags', '+faststart'
                    );
                } else if (isDw3) {
                    const aIdx = parseInt(args[1]) - 1 || 0;
                    const sIdx = parseInt(args[2]) - 1 || 0;
                    ffmpegArgs.push('-map', '0:v:0', '-map', `0:a:${aIdx}`, '-vf', `scale=-2:${res},subtitles=${input}:si=${sIdx}`, '-c:a', 'aac', '-b:a', '128k', '-c:v', 'libx264', '-crf', '32', '-preset', 'ultrafast');
                } else {
                    ffmpegArgs.push('-vf', `scale=-2:${res}`, '-c:a', 'copy', '-c:v', 'libx264', '-crf', '32', '-preset', 'ultrafast');
                }

                ffmpegArgs.push('-threads', '2', '-y', output);

                const proc = spawn('ffmpeg', ffmpegArgs);

                proc.stderr.on('data', (data) => {
                    const line = data.toString();
                    if (line.includes('frame=')) {
                        const frame    = line.match(/frame=\s*(\d+)/)?.[1]    || '0';
                        const fps      = line.match(/fps=\s*([\d.]+)/)?.[1]   || '0';
                        const time     = line.match(/time=\s*([\d:.]+)/)?.[1] || '00:00:00';
                        const speed    = line.match(/speed=\s*([\d.]+x)/)?.[1]|| '0x';
                        const progress = totalFrames > 0
                            ? ((parseInt(frame) / totalFrames) * 100).toFixed(1)
                            : '0.0';
                        process.stdout.write(`\r\x1b[35m[PROGRESS] ${progress}% | Frame: ${frame} | FPS: ${fps} | Time: ${time} | Speed: ${speed}\x1b[0m`);
                    }
                });

                proc.on('close', async (code) => {
                    process.stdout.write('\n');
                    if (code === 0) {
                        if (isDw4) {
                            const fileSizeMB = fs.statSync(output).size / 1024 / 1024;
                            console.log(`📁 DW4 - Peso: ${fileSizeMB.toFixed(1)}MB`);
                            
                            if (fileSizeMB > 60) {
                                reply('📦 Archivo muy pesado, optimizando final...');
                                exec(`ffmpeg -i "${output}" -c:v libx264 -crf 28 -maxrate 1000k -bufsize 2000k -preset fast -c:a aac -b:a 80k -y "${output}_opt.mp4"`, async (err) => {
                                    const finalFile = fs.existsSync(`${output}_opt.mp4`) ? `${output}_opt.mp4` : output;
                                    const mediaOptions = asDocument 
                                        ? { document: fs.readFileSync(finalFile), fileName: `Video_360p_HD.mp4`, mimetype: 'video/mp4' }
                                        : { video: fs.readFileSync(finalFile) };
                                    await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
                                    [input, output, `${output}_opt.mp4`].forEach(f => {
                                        if (fs.existsSync(f)) fs.unlinkSync(f);
                                    });
                                });
                                return;
                            }
                        }
                        
                        const mediaOptions = asDocument 
                            ? { document: fs.readFileSync(output), fileName: `Video_${res}p.mp4`, mimetype: 'video/mp4' }
                            : { video: fs.readFileSync(output) };
                        await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
                    } else { 
                        reply('❌ Error en FFmpeg.'); 
                    }
                    
                    if (fs.existsSync(input)) fs.unlinkSync(input);
                    if (fs.existsSync(output)) fs.unlinkSync(output);
                });
            });
        } catch (e) { 
            reply('❌ Error de proceso.'); 
        }
    }
};

handler.command = /^(dw|dw2|dw3|dw4|mi)$/i;
export default handler;
                    
