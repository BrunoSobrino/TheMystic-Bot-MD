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

    // --- COMANDO .dw (ANÁLISIS) ---
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
            const ffprobe = spawn('ffprobe', ['-v', 'error', '-probesize', '1M', '-analyzeduration', '1M', '-show_streams', '-show_format', '-print_format', 'json', '-i', 'pipe:0']);
            let stdoutData = '';
            ffprobe.stdin.on('error', (err) => { if (err.code !== 'EPIPE') console.error(err); });
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
                let responseText = `> *Información del video*\n\n> Resolución: \`${resolution}\`\n> Duración: \`${duration}\`\n> Peso: \`${(data.format.size / 1024 / 1024).toFixed(2)} MB\`\n\nUso:\n_*.dw2 [res]*_\n_*.dw3 [res] [audio] [sub]*_\n_*.dw4*_`;
                reply(responseText);
            });
        } catch (e) { reply('Error crítico.'); }
    }

    // --- COMANDOS DE PROCESAMIENTO CON MARCA DE AGUA DINÁMICA ---
    if (/^(dw2|dw3|dw4)$/i.test(command)) {
        if (!m.quoted) return reply('Responde a un video.');
        const isDw4 = command === 'dw4';
        const isDw3 = command === 'dw3';
        const asDocument = args[args.length - 1]?.toLowerCase() === 'doc';
        let res = isDw4 ? '360' : (args[0] || '480');
        const timestamp = Date.now();
        const input = `./temp/in_${timestamp}${isDw3 ? '.mkv' : ''}`;
        const output = `./temp/out_${timestamp}.mp4`;

        /** * FILTRO EXPLICADO:
         * enable='gte(t,3)': Aparece a partir del segundo 3.
         * text='By: CID': Tu firma.
         * borderw=2:bordercolor=black: Crea el borde negro alrededor de las letras.
         * fontsize=18: Pequeño pero visible.
         */
        const wmFilter = "drawtext=text='By\\: CID':x=main_w-tw-15:y=main_h-th-15:fontsize=18:fontcolor=white:borderw=2:bordercolor=black:enable='gte(t,3)'";

        try {
            reply(`Procesando \`${command}\`...\nMarca de agua activa desde el seg 3.`);
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());

            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "${input}"`, (err, stdout) => {
                const totalFrames = parseInt(stdout) || 0;
                let ffmpegArgs = ['-i', input];
                
                if (isDw4) {
                    ffmpegArgs.push('-vf', `scale=-2:360,${wmFilter}`, '-c:v', 'libx264', '-crf', '35', '-preset', 'ultrafast', '-c:a', 'aac', '-b:a', '64k', '-ac', '1');
                } else if (isDw3) {
                    const aIdx = parseInt(args[1]) - 1 || 0;
                    const sIdx = parseInt(args[2]) - 1 || 0;
                    ffmpegArgs.push('-map', '0:v:0', '-map', `0:a:${aIdx}`, '-vf', `scale=-2:${res},subtitles=${input}:si=${sIdx},${wmFilter}`, '-c:a', 'aac', '-b:a', '128k', '-c:v', 'libx264', '-crf', '30', '-preset', 'ultrafast');
                } else {
                    ffmpegArgs.push('-vf', `scale=-2:${res},${wmFilter}`, '-c:a', 'copy', '-c:v', 'libx264', '-crf', '30', '-preset', 'ultrafast');
                }

                ffmpegArgs.push('-threads', '2', '-y', output);
                const proc = spawn('ffmpeg', ffmpegArgs);

                proc.on('close', async (code) => {
                    if (code === 0) {
                        const mediaOptions = asDocument 
                            ? { document: fs.readFileSync(output), fileName: `Video_CID.mp4`, mimetype: 'video/mp4' }
                            : { video: fs.readFileSync(output), caption: '> *By: CID*' };
                        await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
                    } else { reply('Error al procesar.'); }
                    if (fs.existsSync(input)) fs.unlinkSync(input);
                    if (fs.existsSync(output)) fs.unlinkSync(output);
                });
            });
        } catch (e) { reply('Error de proceso.'); }
    }
};

handler.command = /^(dw|dw2|dw3|dw4)$/i;
export default handler;
        
