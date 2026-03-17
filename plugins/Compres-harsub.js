import fs from 'fs/promises';
import { existsSync, createWriteStream, unlinkSync, readFileSync } from 'fs';
import { exec, spawn } from 'child_process';
import { pipeline } from 'stream/promises';

let handler = async (m, { conn, text, command, args }) => {
    const reply = (texto) => conn.sendMessage(m.chat, { text: texto }, { quoted: m });

    // Crear carpeta temp de forma asíncrona
    if (!existsSync('./temp')) await fs.mkdir('./temp', { recursive: true });

    const flags = {
        'spa': '🇲🇽', 'es': '🇲🇽', 'eng': '🇺🇸', 'en': '🇺🇸', 'jpn': '🇯🇵', 'ja': '🇯🇵',
        'por': '🇧🇷', 'pt': '🇧🇷', 'ara': '🇸🇦', 'ar': '🇸🇦', 'fre': '🇫🇷', 'fra': '🇫🇷', 'fr': '🇫🇷',
        'ger': '🇩🇪', 'de': '🇩🇪', 'ita': '🇮🇹', 'it': '🇮🇹', 'rus': '🇷🇺', 'ru': '🇷🇺',
        'chi': '🇨🇳', 'zh': '🇨🇳', 'kor': '🇰🇷', 'ko': '🇰🇷', 'und': '🏳️'
    };

    if (command === 'dw') {
        if (!m.quoted) return reply('⚡ Responde a un video.');
        
        try {
            const { downloadContentFromMessage } = await import('baileys');
            const quoted = m.quoted;
            const message = quoted.fakeObj ? quoted.fakeObj.message : (quoted.vM ? quoted.vM.message : quoted);
            const type = Object.keys(message)[0];
            const media = message[type];
            
            if (!media || !media.mediaKey) return reply('⚠️ No se encontró el medio.');

            const stream = await downloadContentFromMessage(media, type.replace('Message', ''));
            
            // Limitamos el análisis de ffprobe para que sea instantáneo
            const ffprobe = spawn('ffprobe', [
                '-v', 'quiet', '-probesize', '500k', '-analyzeduration', '500k',
                '-show_entries', 'format=duration,size',
                '-show_entries', 'stream=codec_type,width,height,codec_name,tags',
                '-select_streams', 'v:0|a:0|s:0', '-print_format', 'json', '-i', 'pipe:0'
            ]);

            let stdoutData = '';
            let startTime = Date.now();

            stream.pipe(ffprobe.stdin);
            ffprobe.stdout.on('data', (chunk) => stdoutData += chunk);
            
            ffprobe.on('close', () => {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                try {
                    const data = JSON.parse(stdoutData);
                    const format = data.format || {};
                    const streams = data.streams || [];
                    
                    const vStream = streams.find(s => s.codec_type === 'video');
                    const resolution = vStream ? `${vStream.width}x${vStream.height}` : '?';
                    const duration = new Date(parseFloat(format.duration || 0) * 1000).toISOString().substr(11, 8);
                    const sizeMB = (parseInt(format.size) / 1024 / 1024).toFixed(1);

                    let res = `⚡ *ANÁLISIS* (${elapsed}s)\n\n📹 *Video:* \`${resolution}\`\n⏱️ *Duración:* \`${duration}\`\n💾 *Peso:* \`${sizeMB} MB\`\n`;

                    const audios = streams.filter(s => s.codec_type === 'audio').slice(0, 3);
                    if (audios.length) {
                        res += '🎵 *Audios:* ' + audios.map(a => `\`${a.codec_name}\`${flags[a.tags?.language] || '🏳️'}`).join(' ') + '\n';
                    }

                    reply(res + '\n🚀 `.dw3 [res] [audio] [sub] [calidad]`');
                } catch (e) { reply('⚠️ Error al analizar.'); }
            });
        } catch (e) { reply('⚠️ Error crítico.'); }
        return;
    }

    if (/^(dw2|dw3|dw4)$/i.test(command)) {
        if (!m.quoted) return reply('⚡ Responde a un video.');
        
        const isDw4 = command === 'dw4';
        const isDw3 = command === 'dw3';
        const asDoc = args.includes('doc');
        
        const validRes = ['360', '480', '720', '1080'];
        let res = isDw4 ? '360' : (args[0] || '480');
        res = validRes.includes(res) ? res : '480';
        
        const calidad = args.find(a => ['ultra', 'hd', 'sd'].includes(a)) || 'hd';
        const timestamp = Date.now();
        const input = `./temp/in_${timestamp}.mkv`;
        const output = `./temp/out_${timestamp}.mp4`;

        try {
            reply(`🎬 Procesando ${res}p...`);
            
            // Descarga eficiente
            const { downloadContentFromMessage } = await import('baileys');
            const message = m.quoted.fakeObj ? m.quoted.fakeObj.message : (m.quoted.vM ? m.quoted.vM.message : m.quoted);
            const type = Object.keys(message)[0];
            const stream = await downloadContentFromMessage(message[type], type.replace('Message', ''));
            await pipeline(stream, createWriteStream(input));

            // Obtener total de frames para la barra de progreso
            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "${input}"`, (err, stdout) => {
                const totalFrames = parseInt(stdout) || 0;
                let ffmpegArgs = ['-i', input];

                const resConfig = {
                    '360': { crf: 22, preset: 'faster' },
                    '480': { crf: 20, preset: 'medium' },
                    '720': { crf: 19, preset: 'medium' },
                    '1080': { crf: 18, preset: 'medium' }
                };
                const config = resConfig[res];

                if (isDw3) {
                    const aIdx = parseInt(args[1]) - 1 || 0;
                    const sIdx = parseInt(args[2]) - 1 || 0;
                    ffmpegArgs.push(
                        '-map', '0:v:0', '-map', `0:a:${aIdx}`, '-map', `0:s:${sIdx}?`,
                        '-vf', `scale=-2:${res},subtitles='${input}':si=${sIdx}`,
                        '-c:s', 'mov_text'
                    );
                } else {
                    ffmpegArgs.push('-vf', `scale=-2:${res}`);
                }

                ffmpegArgs.push(
                    '-c:v', 'libx264', '-crf', config.crf.toString(), '-preset', config.preset,
                    '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-y', output
                );

                const proc = spawn('ffmpeg', ffmpegArgs);

                proc.stderr.on('data', (data) => {
                    const line = data.toString();
                    if (line.includes('frame=')) {
                        const frame = line.match(/frame=\s*(\d+)/)?.[1] || '0';
                        const progress = totalFrames > 0 ? ((parseInt(frame) / totalFrames) * 100).toFixed(1) : '...';
                        process.stdout.write(`\r\x1b[36m[PROGRESO] ${progress}%\x1b[0m`);
                    }
                });

                proc.on('close', async (code) => {
                    if (code === 0) {
                        const media = asDoc ? { document: { url: output }, fileName: `video_${res}p.mp4`, mimetype: 'video/mp4' } : { video: { url: output } };
                        await conn.sendMessage(m.chat, media, { quoted: m });
                    } else {
                        reply('❌ Error en la conversión.');
                    }
                    // Limpieza asíncrona
                    [input, output].forEach(f => { if (existsSync(f)) unlinkSync(f); });
                });
            });
        } catch (e) { reply('❌ Error de proceso.'); }
    }
};

handler.command = /^(dw|dw2|dw3|dw4)$/i;
export default handler;
                            
