import fs from 'fs';
import path from 'path';
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

    // Colores ANSI
    const colors = {
        reset: '\x1b[0m',
        cyan: '\x1b[36m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        red: '\x1b[31m'
    };

    // Visualización de progreso estilo solicitado con colores
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

    const WM = `drawtext=fontfile='/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans-Oblique.ttf':text='By\\:CID':fontcolor=white:fontsize=w*0.04:x=20:y=20:borderw=2:bordercolor=black:alpha='if(lt(t,4),1,if(lt(t,5),5-t,0))'`;
    const withWM = (vf) => `${vf},${WM}`;

    // ─────────────────────────────────────────────
    //  COMANDO: .tr — Transcripción/Traducción con Whisper
    //  Uso:
    //    .tr              → transcribe en idioma original
    //    .tr es           → fuerza detección española
    //    .tr ja           → audio en japonés, transcribe en japonés
    //    .tr ja translate → transcribe y traduce al inglés (limitación de Whisper)
    //  Modelo por defecto: small (balance velocidad/calidad en Termux)
    // ─────────────────────────────────────────────
    if (command === 'tr') {
        if (!m.quoted) return reply('Responde a un audio, video o nota de voz.\n\nUso: *.tr [idioma] [translate]*\nEjemplos:\n`.tr` → auto\n`.tr ja` → japonés\n`.tr ja translate` → japonés → inglés');

        const timestamp  = Date.now();
        const inputRaw   = `./temp/tr_in_${timestamp}`;
        const audioWav   = `./temp/tr_audio_${timestamp}.wav`;

        // Parseo de args
        // Idiomas válidos (ISO 639-1 / nombre Whisper)
        const whisperLangs = new Set([
            'af','ar','hy','az','be','bs','bg','ca','zh','hr','cs','da','nl','en','et',
            'fi','fr','gl','de','el','he','hi','hu','is','id','it','ja','kn','kk','ko',
            'lv','lt','mk','ms','mr','mi','ne','no','fa','pl','pt','ro','ru','sr','sk',
            'sl','es','sw','sv','tl','ta','th','tr','uk','ur','vi','cy'
        ]);

        let lang   = null;   // null = autodetección
        let task   = 'transcribe';
        let model  = 'small';

        for (const arg of args) {
            if (arg.toLowerCase() === 'translate') task = 'translate';
            else if (whisperLangs.has(arg.toLowerCase())) lang = arg.toLowerCase();
            else if (['tiny','base','small','medium','large'].includes(arg.toLowerCase())) model = arg.toLowerCase();
        }

        // Si no se especifica idioma, Whisper auto-detecta
        const langLabel = lang ? `\`${lang}\`` : '`auto`';
        const taskLabel = task === 'translate' ? '→ inglés 🇺🇸' : '→ español 🇲🇽 (si el audio es en español)';

        await reply(
            `🎙️ *Transcribiendo audio...*\n` +
            `> Modelo: \`${model}\`\n` +
            `> Idioma: ${langLabel}\n` +
            `> Tarea: \`${task}\` ${taskLabel}\n\n` +
            `_Esto puede tardar unos minutos en Termux..._`
        );

        try {
            // 1. Descargar el medio
            let success = await downloadMediaStream(m.quoted, inputRaw);
            if (!success) fs.writeFileSync(inputRaw, await m.quoted.download());

            // 2. Extraer audio en WAV mono 16kHz (formato óptimo para Whisper)
            await new Promise((resolve, reject) => {
                const ffArgs = [
                    '-y', '-i', inputRaw,
                    '-vn',                   // sin video
                    '-ar', '16000',          // sample rate 16kHz
                    '-ac', '1',              // mono
                    '-c:a', 'pcm_s16le',     // PCM 16-bit (WAV puro)
                    audioWav
                ];
                const ff = spawn('ffmpeg', ffArgs);
                ff.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg WAV extraction failed (code ${code})`)));
            });

            // 3. Construir comando Whisper
            const whisperArgs = [
                audioWav,
                '--model', model,
                '--task', task,
                '--output_format', 'txt',
                '--output_dir', './temp',
                '--fp16', 'False'  // Sin GPU en Termux
            ];
            if (lang) whisperArgs.push('--language', lang);

            console.log(`[TR] Ejecutando: whisper ${whisperArgs.join(' ')}`);

            // 4. Ejecutar Whisper
            const whisperResult = await new Promise((resolve, reject) => {
                let stdout = '';
                let stderr = '';
                const wp = spawn('whisper', whisperArgs);
                wp.stdout.on('data', (d) => { stdout += d.toString(); process.stdout.write(d); });
                wp.stderr.on('data', (d) => { stderr += d.toString(); process.stdout.write(d); });
                wp.on('close', (code) => {
                    if (code === 0) resolve({ stdout, stderr });
                    else reject(new Error(stderr || `Whisper salió con código ${code}`));
                });
                wp.on('error', (err) => {
                    // whisper no está instalado
                    reject(new Error('Whisper no encontrado. Instala con: pip install openai-whisper'));
                });
            });

            // 5. Leer el .txt generado por Whisper (usa el stem del archivo de entrada)
            const stem    = path.basename(audioWav, '.wav');
            const txtFile = `./temp/${stem}.txt`;
            let transcription = '';

            if (fs.existsSync(txtFile)) {
                transcription = fs.readFileSync(txtFile, 'utf8').trim();
            } else {
                // Fallback: buscar cualquier .txt generado en ./temp con timestamp
                const candidates = fs.readdirSync('./temp').filter(f => f.includes(`tr_audio_${timestamp}`) && f.endsWith('.txt'));
                if (candidates.length > 0) {
                    transcription = fs.readFileSync(`./temp/${candidates[0]}`, 'utf8').trim();
                } else {
                    // Último recurso: capturar desde stdout
                    transcription = whisperResult.stdout.replace(/\[\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\]/g, '').trim();
                }
            }

            if (!transcription) {
                return reply('⚠️ Whisper no produjo texto. Verifica que el audio tenga voz clara.');
            }

            // 6. Enviar resultado
            const header = task === 'translate'
                ? `📝 *Transcripción (EN)* | Modelo: \`${model}\`\n${'─'.repeat(30)}\n\n`
                : `📝 *Transcripción (${lang || 'auto'})* | Modelo: \`${model}\`\n${'─'.repeat(30)}\n\n`;

            const fullText = header + transcription;

            // Telegram/WhatsApp tienen límite de ~4096 chars; dividir si es largo
            const MAX_CHUNK = 3800;
            if (fullText.length <= MAX_CHUNK) {
                await reply(fullText);
            } else {
                // Enviar en partes
                const parts = [];
                let remaining = transcription;
                while (remaining.length > 0) {
                    parts.push(remaining.slice(0, MAX_CHUNK));
                    remaining = remaining.slice(MAX_CHUNK);
                }
                await reply(header + `_(${parts.length} partes)_`);
                for (let i = 0; i < parts.length; i++) {
                    await conn.sendMessage(m.chat, { text: `📄 *Parte ${i + 1}/${parts.length}*\n\n${parts[i]}` }, { quoted: m });
                }
            }

        } catch (e) {
            console.error('[TR] Error:', e);
            reply(`❌ Error en transcripción:\n\`${e.message}\``);
        } finally {
            [inputRaw, audioWav, `./temp/tr_audio_${timestamp}.txt`].forEach(f => {
                if (fs.existsSync(f)) fs.unlinkSync(f);
            });
        }
    }

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
                r += '\n_*.dw2 [res] (doc)*_\n_*.dw3 [res] [audio] [sub] (doc)*_\n_*.dw4 (doc)*_\n_*.mi [res] [pesoMB] (doc)*_\n_*.tr [idioma] (translate)*_';
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
            reply(`⚙️ *Comprimiendo video*\n> Resolución: \`${res}p\`\n> Peso objetivo: \`${targetMB} MB\`\n> Modo: \`${asDocument ? 'Documento' : 'Video'}\`\n\nProcesando...`);
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());

            const getDuration    = () => new Promise(r => exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${input}"`, (e, o) => r(parseFloat(o) || 0)));
            const getTotalFrames = () => new Promise(r => exec(`ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "${input}"`, (e, o) => r(parseInt(o) || 0)));
            const [durationSec, totalFrames] = await Promise.all([getDuration(), getTotalFrames()]);

            const AUDIO_KBPS    = 128;
            const videoBitrateK = calcVideoBitrate(durationSec, targetMB, AUDIO_KBPS);
            const maxrateK      = Math.round(videoBitrateK * 1.5);
            const bufsizeK      = maxrateK * 2;

            // PASS 1
            const pass1Args = [
                '-i', input, '-vf', `scale=-2:${res}:flags=fast_bilinear`, '-c:v', 'libx264', '-b:v', `${videoBitrateK}k`, '-maxrate', `${maxrateK}k`, '-bufsize', `${bufsizeK}k`,
                '-pass', '1', '-passlogfile', logPrefix, '-preset', 'ultrafast', '-threads', '0', '-an', '-f', 'null', '/dev/null', '-y'
            ];
            await new Promise((resolve, reject) => {
                const p1 = spawn('ffmpeg', pass1Args);
                p1.stderr.on('data', (d) => logFFmpegProgress(`${label} - PASS 1/2`, d, totalFrames));
                p1.on('close', (code) => {
                    process.stdout.write('\n\n');
                    if (code === 0) resolve(); else reject(new Error(`pass1 code ${code}`));
                });
            });

            // PASS 2
            const pass2Args = [
                '-i', input, '-vf', withWM(`scale=-2:${res}:flags=fast_bilinear`), '-c:v', 'libx264', '-b:v', `${videoBitrateK}k`, '-maxrate', `${maxrateK}k`, '-bufsize', `${bufsizeK}k`,
                '-pass', '2', '-passlogfile', logPrefix, '-preset', 'veryfast', '-threads', '0', '-c:a', 'aac', '-b:a', `${AUDIO_KBPS}k`, '-ac', '2', '-movflags', '+faststart', '-y', output
            ];
            await new Promise((resolve, reject) => {
                const p2 = spawn('ffmpeg', pass2Args);
                p2.stderr.on('data', (d) => {
                    logFFmpegProgress(`${label} - PASS 2/2`, d, totalFrames);
                });
                p2.on('close', (code) => {
                    process.stdout.write('\n\n');
                    if (code === 0) resolve(); else reject(new Error(`pass2 code ${code}`));
                });
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
            [input, output, `${logPrefix}-0.log`, `${logPrefix}-0.log.mbtree`].forEach(f => {
                if (fs.existsSync(f)) fs.unlinkSync(f);
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
        const label      = `${command.toUpperCase()} ${res}p`;

        try {
            reply(`⚙️ Procesando \`${command}\` a \`${res}p\`...\nModo: \`${asDocument ? 'Documento' : 'Video'}\``);
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());

            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "${input}"`, (err, stdout) => {
                const totalFrames = parseInt(stdout) || 0;
                let ffmpegArgs = ['-i', input];

                if (isDw4) {
                    ffmpegArgs.push(
                        '-vf', withWM('scale=-2:360:flags=lanczos'),
                        '-c:v', 'libx264',
                        '-crf', '23',
                        '-maxrate', '1400k',
                        '-bufsize', '2800k',
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
                    ffmpegArgs.push(
                        '-map', '0:v:0',
                        '-map', `0:a:${aIdx}`,
                        '-vf', withWM(`scale=-2:${res}:flags=lanczos,subtitles=${input}:si=${sIdx}:force_style='PrimaryColour=&H00FFFFFF,OutlineColour=&H00FFBF00,Outline=1.0,Shadow=0.5'`),
                        '-c:a', 'aac',
                        '-b:a', '128k',
                        '-c:v', 'libx264',
                        '-crf', '22',
                        '-preset', 'medium',
                        '-profile:v', 'high',
                        '-movflags', '+faststart'
                    );
                } else {
                    ffmpegArgs.push(
                        '-vf', withWM(`scale=-2:${res}:flags=lanczos`),
                        '-c:a', 'copy',
                        '-c:v', 'libx264',
                        '-crf', '20',
                        '-preset', 'medium',
                        '-profile:v', 'high',
                        '-movflags', '+faststart'
                    );
                }

                ffmpegArgs.push('-threads', '0', '-y', output);

                const proc = spawn('ffmpeg', ffmpegArgs);
                proc.stderr.on('data', (data) => logFFmpegProgress(label, data, totalFrames));
                proc.on('close', async (code) => {
                    process.stdout.write('\n\n');
                    if (code === 0) {
                        if (isDw4) {
                            const fileSizeMB = fs.statSync(output).size / 1024 / 1024;
                            if (fileSizeMB > 60) {
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
                    } else {
                        reply('❌ Error en FFmpeg.');
                    }
                    if (fs.existsSync(input))  fs.unlinkSync(input);
                    if (fs.existsSync(output)) fs.unlinkSync(output);
                });
            });
        } catch (e) {
            reply('❌ Error de proceso.');
            console.error(e);
        }
    }
};

handler.command = /^(dw|dw2|dw3|dw4|mi|tr)$/i;
export default handler;
