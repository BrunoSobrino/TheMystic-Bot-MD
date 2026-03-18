import fs from 'fs';
import { exec, spawn, execSync } from 'child_process';
import { pipeline } from 'stream/promises';

// ── Detectar fuente disponible para drawtext (compatible Termux + Linux) ──
const detectFont = () => {
    const candidates = [
        // Termux (Android)
        '/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans.ttf',
        '/data/data/com.termux/files/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/data/data/com.termux/files/usr/share/fonts/dejavu/DejaVuSans.ttf',
        '/data/data/com.termux/files/usr/share/fonts/DejaVuSans.ttf',
        // Android sistema
        '/system/fonts/Roboto-Regular.ttf',
        '/system/fonts/DroidSans.ttf',
        '/system/fonts/NotoSans-Regular.ttf',
        // Linux estándar
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    ];
    for (const f of candidates) {
        if (fs.existsSync(f)) return f;
    }
    // Último recurso: buscar con find en Termux
    try {
        const result = execSync(
            'find /data/data/com.termux/files/usr/share/fonts /system/fonts -name "*.ttf" 2>/dev/null | head -1',
            { timeout: 3000 }
        ).toString().trim();
        if (result) return result;
    } catch (_) {}
    return null; // sin fuente — drawtext no se aplicará
};

const FONT_PATH = detectFont();
console.log('[FONT] ' + (FONT_PATH ? '✔ ' + FONT_PATH : '✖ No se encontró fuente TTF — marca de agua desactivada'));

// ═══════════════════════════════════════════════════
//  LOGGER — Terminal legible con colores y barra
// ═══════════════════════════════════════════════════
const C = {
    reset:  '\x1b[0m',
    bold:   '\x1b[1m',
    dim:    '\x1b[2m',
    // Colores de texto
    white:  '\x1b[97m',
    cyan:   '\x1b[96m',
    green:  '\x1b[92m',
    yellow: '\x1b[93m',
    red:    '\x1b[91m',
    magenta:'\x1b[95m',
    blue:   '\x1b[94m',
    gray:   '\x1b[90m',
    // Fondos
    bgBlue:    '\x1b[44m',
    bgGreen:   '\x1b[42m',
    bgYellow:  '\x1b[43m',
    bgRed:     '\x1b[41m',
    bgMagenta: '\x1b[45m',
    bgCyan:    '\x1b[46m',
};

const log = {
    // Separador visual
    sep: (char = '─', len = 60, color = C.gray) =>
        console.log(`${color}${char.repeat(len)}${C.reset}`),

    // Cabecera de bloque
    header: (title, color = C.bgBlue) =>
        console.log(`\n${color}${C.bold}${C.white}  ${title.toUpperCase()}  ${C.reset}\n`),

    // Líneas informativas
    info:    (label, value) => console.log(`  ${C.cyan}${C.bold}${label.padEnd(18)}${C.reset} ${C.white}${value}${C.reset}`),
    success: (msg)          => console.log(`\n  ${C.green}${C.bold}✔  ${msg}${C.reset}`),
    warn:    (msg)          => console.log(`  ${C.yellow}${C.bold}⚠  ${msg}${C.reset}`),
    error:   (msg)          => console.log(`\n  ${C.red}${C.bold}✖  ${msg}${C.reset}`),
    step:    (msg)          => console.log(`\n  ${C.magenta}${C.bold}►  ${msg}${C.reset}`),
    done:    (msg)          => console.log(`  ${C.green}${msg}${C.reset}`),
    dim:     (msg)          => console.log(`  ${C.gray}${msg}${C.reset}`),

    // Barra de progreso inline (sobreescribe la línea actual)
    progress: (label, pct, frame, fps, time, speed, color = C.cyan) => {
        const BAR_LEN  = 25;
        const filled   = Math.round((pct / 100) * BAR_LEN);
        const empty    = BAR_LEN - filled;
        const bar      = `${'█'.repeat(filled)}${'░'.repeat(empty)}`;
        const pctStr   = `${pct.toFixed(1)}%`.padStart(6);
        const line     =
            `  ${color}${C.bold}[${label}]${C.reset} ` +
            `${color}${bar}${C.reset} ${C.bold}${C.white}${pctStr}${C.reset}` +
            `  ${C.gray}Frame:${C.reset}${C.white}${String(frame).padStart(6)}${C.reset}` +
            `  ${C.gray}FPS:${C.reset}${C.white}${String(fps).padStart(5)}${C.reset}` +
            `  ${C.gray}Time:${C.reset}${C.white}${time}${C.reset}` +
            `  ${C.gray}Speed:${C.reset}${C.yellow}${speed}${C.reset}`;
        process.stdout.write(`\r${line}`);
    },

    // Salta a nueva línea tras la barra
    endProgress: () => process.stdout.write('\n'),
};

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
            log.header('▸ comando .mi  —  compresión a peso objetivo', C.bgMagenta);
            log.info('Resolución',  `${res}p`);
            log.info('Peso objetivo', `${targetMB} MB`);
            log.info('Modo envío',  asDocument ? 'Documento 📄' : 'Video 🎬');
            log.sep();

            reply(`⚙️ Procesando \`.mi\`...\n> Resolución: \`${res}p\`\n> Peso objetivo: \`${targetMB} MB\`\n> Modo: \`${asDocument ? 'Documento' : 'Video'}\``);

            // ── Descarga ──────────────────────────
            log.step('Descargando archivo...');
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());
            const dlSizeMB = fs.statSync(input).size / 1024 / 1024;
            log.success(`Descarga completa — ${dlSizeMB.toFixed(2)} MB guardados en ${input}`);

            // ── Obtener duración real con ffprobe ──
            log.step('Analizando metadatos con ffprobe...');
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
                log.error('No se pudo determinar la duración del video.');
                if (fs.existsSync(input)) fs.unlinkSync(input);
                return reply('❌ No se pudo determinar la duración del video.');
            }

            const durStr = new Date(durationSec * 1000).toISOString().substr(11, 8);
            log.info('Duración',    `${durStr}  (${durationSec.toFixed(2)}s)`);
            log.info('Total frames', totalFrames > 0 ? `${totalFrames}` : 'desconocido');

            // ── Cálculo de bitrate objetivo (2-pass ready) ─
            const AUDIO_KBPS      = 128;
            const OVERHEAD_FACTOR = 0.95;
            const totalKbps       = ((targetMB * 8192) / durationSec) * OVERHEAD_FACTOR;
            const videoBitrateKbps = Math.max(Math.floor(totalKbps - AUDIO_KBPS), 100);
            const maxrateKbps     = Math.floor(videoBitrateKbps * 1.5);
            const bufsizeKbps     = maxrateKbps * 2;

            log.sep();
            log.step('Cálculo de bitrate:');
            log.info('  Bitrate total',  `${Math.floor(totalKbps)} kbps`);
            log.info('  Audio reservado',`${AUDIO_KBPS} kbps`);
            log.info('  Bitrate vídeo',  `${videoBitrateKbps} kbps`);
            log.info('  Maxrate',         `${maxrateKbps} kbps`);
            log.info('  Bufsize',         `${bufsizeKbps} kbps`);

            // ── Construcción de argumentos ffmpeg ─
            // Usamos 2-pass encoding para máxima precisión de peso
            // ── Marca de agua ─────────────────────
            const chatId  = String(m.chat).replace(/[^0-9]/g, '').slice(-10);
            const wmText  = `Emisión ${chatId}`;
            const wmFilter = FONT_PATH
                ? `drawtext=fontfile=${FONT_PATH}:text='emision-${chatId}':fontcolor=white:fontsize=18:x=12:y=12:borderw=2:bordercolor=black`
                : null;
            if (wmFilter) log.info('Marca de agua', `emision-${chatId}  →  fuente: ${FONT_PATH}`);
            else           log.warn('Marca de agua desactivada — no se encontró fuente TTF');
            log.info('Marca de agua', `${wmText}  →  esquina superior izquierda`);

            const passlogFile = `./temp/mi_pass_${timestamp}`;

            const commonVideoArgs = [
                '-vf',    wmFilter ? `scale=-2:${res}:flags=lanczos,${wmFilter}` : `scale=-2:${res}:flags=lanczos`,
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
            const runFFmpeg = (ffArgs, label, color) => new Promise((resolve, reject) => {
                log.sep('─', 60, color);
                log.step(`Iniciando FFmpeg  [${label}]`);
                log.dim(`Comando: ffmpeg ${ffArgs.slice(0, 6).join(' ')} ...`);
                console.log('');

                const proc = spawn('ffmpeg', ffArgs);

                proc.stderr.on('data', (data) => {
                    const line = data.toString();
                    if (line.includes('frame=')) {
                        const frame    = line.match(/frame=\s*(\d+)/)?.[1]    || '0';
                        const fps      = line.match(/fps=\s*([\d.]+)/)?.[1]   || '0';
                        const time     = line.match(/time=\s*([\d:.]+)/)?.[1] || '00:00:00';
                        const speed    = line.match(/speed=\s*([\d.]+x)/)?.[1]|| '0x';
                        const pct      = totalFrames > 0
                            ? (parseInt(frame) / totalFrames) * 100
                            : 0;
                        log.progress(label, pct, frame, fps, time, speed, color);
                    }
                });

                proc.on('close', (code) => {
                    log.endProgress();
                    if (code === 0) {
                        log.success(`${label} completado exitosamente`);
                        resolve();
                    } else {
                        log.error(`FFmpeg ${label} terminó con código ${code}`);
                        reject(new Error(`FFmpeg ${label} falló (code ${code})`));
                    }
                });
            });

            // ── Ejecución 2-pass ──────────────────
            log.sep('═', 60, C.magenta);
            await runFFmpeg(pass1Args, 'PASS 1 — Análisis', C.cyan);
            await runFFmpeg(pass2Args, 'PASS 2 — Codificación', C.magenta);

            // ── Verificación de peso resultante ───
            const finalSizeMB  = fs.statSync(output).size / 1024 / 1024;
            const diff         = finalSizeMB - targetMB;
            const diffStr      = diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
            const accuracy     = (100 - Math.abs(diff / targetMB) * 100).toFixed(1);

            log.sep('═', 60, C.green);
            log.header('▸ resultado final', C.bgGreen);
            log.info('Peso objetivo',  `${targetMB} MB`);
            log.info('Peso final',     `${finalSizeMB.toFixed(2)} MB  (${diffStr} MB)`);
            log.info('Precisión',      `${accuracy}%`);
            log.info('Resolución',     `${res}p`);
            log.info('Archivo salida', output);
            log.sep();

            // ── Envío ─────────────────────────────
            const mediaOptions = asDocument
                ? { document: fs.readFileSync(output), fileName: `Video_${res}p_${targetMB}MB.mp4`, mimetype: 'video/mp4' }
                : { video: fs.readFileSync(output) };

            await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
            reply(`✅ Listo\n> Resolución: \`${res}p\`\n> Peso final: \`${finalSizeMB.toFixed(2)} MB\` / objetivo \`${targetMB} MB\``);

        } catch (e) {
            log.sep('═', 60, C.red);
            log.error(`Error crítico en .mi`);
            log.dim(`${e.message}`);
            console.error(e);
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
  
