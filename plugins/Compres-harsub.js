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
        console.log(`\x1b[36m[ANALIZANDO]\x1b[0m Pipeline MediaInfo: ${m.sender}`);
        
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
                if (audios.length === 0) responseText += '- `Ninguno`\n';
                else {
                    audios.forEach((a, i) => {
                        const lang = (a.tags?.language || 'und').toLowerCase();
                        responseText += `- Pista ${i + 1}: \`${a.codec_name}\` ${flags[lang] || '🏳️'} (\`${lang}\`)\n`;
                    });
                }
                
                const subs = data.streams.filter(s => s.codec_type === 'subtitle');
                responseText += '\n> *Subtitulos disponibles*\n';
                if (subs.length === 0) responseText += '- `Ninguno`\n';
                else {
                    subs.forEach((s, i) => {
                        const lang = (s.tags?.language || 'und').toLowerCase();
                        responseText += `- Pista ${i + 1}: \`${s.codec_name}\` ${flags[lang] || '🏳️'} (\`${lang}\`)\n`;
                    });
                }
                
                responseText += '\nUso:\n';
                responseText += '_*.dw2 [res] (doc)*_\n';
                responseText += '_*.dw3 [res] [audio] [sub] (doc)*_';
                
                reply(responseText);
                if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
            });
        } catch (e) { reply('Error en analisis.'); }
    }

    if (command === 'dw2' || command === 'dw3') {
        if (!m.quoted) return reply('Responde a un video.');
        const isDw3 = command === 'dw3';
        const res = args[0];
        const asDocument = args[args.length - 1]?.toLowerCase() === 'doc';

        if (!['360', '720', '1080'].includes(res)) return reply('Resolucion invalida.');

        const timestamp = Date.now();
        const input = `./temp/in_${timestamp}${isDw3 ? '.mkv' : ''}`;
        const output = `./temp/out_${timestamp}.mp4`;

        try {
            reply(`Procesando pipeline a \`${res}p\`...\nModo: \`${asDocument ? 'Documento' : 'Video'}\``);
            let success = await downloadMediaStream(m.quoted, input);
            if (!success) fs.writeFileSync(input, await m.quoted.download());

            let ffmpegArgs = ['-i', input];
            if (isDw3) {
                const aIdx = parseInt(args[1]) - 1;
                const sIdx = parseInt(args[2]) - 1;
                ffmpegArgs.push('-map', '0:v:0', '-map', `0:a:${aIdx}`, '-vf', `scale=-2:${res},subtitles=${input}:si=${sIdx}`, '-c:a', 'aac', '-b:a', '128k');
            } else {
                ffmpegArgs.push('-vf', `scale=-2:${res}`, '-c:a', 'copy');
            }

            // Cambios aplicados: CRF 23 y Preset veryfast
            ffmpegArgs.push('-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast', '-threads', '2', '-y', output);

            const proc = spawn('ffmpeg', ffmpegArgs);

            proc.stderr.on('data', (data) => {
                const line = data.toString();
                if (line.includes('frame=')) {
                    const frame = line.match(/frame=\s*(\d+)/)?.[1] || '0';
                    const time = line.match(/time=\s*([\d:.]+)/)?.[1] || '00:00:00';
                    const speed = line.match(/speed=\s*([\d.]+x)/)?.[1] || '0x';
                    process.stdout.write(`\r\x1b[35m[PROGRESS]\x1b[0m Frame: ${frame} | Time: ${time} | Speed: ${speed}`);
                }
            });

            proc.on('close', async (code) => {
                console.log(`\n\x1b[32m[FINISHED]\x1b[0m Codigo: ${code}`);
                if (code === 0) {
                    const fileName = `Encod_Video_${res}p.mp4`;
                    const mediaOptions = asDocument 
                        ? { document: fs.readFileSync(output), fileName: fileName, mimetype: 'video/mp4' }
                        : { video: fs.readFileSync(output) };
                    await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
                } else { reply('Error en pipeline FFmpeg.'); }
                
                if (fs.existsSync(input)) fs.unlinkSync(input);
                if (fs.existsSync(output)) fs.unlinkSync(output);
            });
        } catch (e) { reply('Error de memoria.'); }
    }
};

handler.command = /^(dw|dw2|dw3)$/i;
export default handler;
          
