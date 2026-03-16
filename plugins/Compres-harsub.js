import fs from 'fs';
import { exec, spawn } from 'child_process';

let handler = async (m, { conn, text, command, args }) => {
    const reply = (texto) => conn.sendMessage(m.chat, { text: texto }, { quoted: m });

    if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp', { recursive: true });
    }

    const isMediaValid = () => {
        if (!m.quoted) return false;
        const mime = m.quoted.mimetype || '';
        return mime.includes('video') || mime.includes('application') || mime.includes('document');
    };

    const downloadMediaStream = async (quoted, outputPath) => {
        try {
            // Importacion directa segun tu package.json
            const { downloadContentFromMessage } = await import('baileys');
            
            const mediaType = quoted.mtype ? quoted.mtype.replace('Message', '') : (quoted.mimetype.includes('video') ? 'video' : 'document');
            const mediaObj = quoted.vM || quoted.message?.videoMessage || quoted.message?.documentMessage || quoted;
            
            const stream = await downloadContentFromMessage(mediaObj, mediaType);
            const writeStream = fs.createWriteStream(outputPath);
            
            for await (const chunk of stream) {
                writeStream.write(chunk);
            }
            writeStream.end();
            return true;
        } catch (e) {
            console.log('[!] Error en descarga por flujo:', e.message);
            return false;
        }
    };

    if (command === 'dw') {
        if (!isMediaValid()) return reply('Responde a un video o documento multimedia.');
        
        reply('Analizando archivo multimedia...');
        const inputVideo = `./temp/video_${Date.now()}`;
        
        try {
            const streamed = await downloadMediaStream(m.quoted, inputVideo);
            if (!streamed) {
                const mediaBuffer = await m.quoted.download();
                fs.writeFileSync(inputVideo, mediaBuffer);
            }
            
            exec(`ffprobe -v quiet -print_format json -show_streams "${inputVideo}"`, (error, stdout) => {
                if (error) {
                    if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
                    return reply('Error al analizar el video.');
                }
                
                const data = JSON.parse(stdout);
                let responseText = '> **Informacion del video**\n\n';
                
                const audios = data.streams.filter(s => s.codec_type === 'audio');
                responseText += '> **Audios**\n';
                audios.forEach((audio, index) => {
                    const lang = audio.tags?.language || 'Desconocido';
                    responseText += `- Pista ${index + 1}: ${audio.codec_name} (${lang})\n`;
                });
                
                const subs = data.streams.filter(s => s.codec_type === 'subtitle');
                responseText += '\n> **Subtitulos**\n';
                if (subs.length === 0) responseText += '- Ninguno\n';
                subs.forEach((sub, index) => {
                    const lang = sub.tags?.language || 'Desconocido';
                    responseText += `- Pista ${index + 1}: ${sub.codec_name} (${lang})\n`;
                });
                
                responseText += '\nUso:\n.dw2 [360|720|1080] [calidad]\n.dw3 [res] [audio] [sub] [calidad]';
                reply(responseText);
                if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
            });
        } catch (err) {
            reply('Error en el proceso.');
        }
    }

    if (command === 'dw2' || command === 'dw3') {
        if (!isMediaValid()) return reply('Responde a un video.');

        const res = args[0];
        const calidad = (command === 'dw2' ? args[1] : args[3]) || 'normal';
        
        if (!['360', '720', '1080'].includes(res)) return reply('Resolucion invalida (360, 720, 1080).');
        if (!['alta', 'normal', 'baja', 'extrema'].includes(calidad.toLowerCase())) return reply('Calidad invalida (alta, normal, baja, extrema).');

        reply(`Procesando en calidad ${calidad}...`);
        
        const timestamp = Date.now();
        const input = `./temp/in_${timestamp}${command === 'dw3' ? '.mkv' : ''}`;
        const output = `./temp/out_${timestamp}.mp4`;

        try {
            const streamed = await downloadMediaStream(m.quoted, input);
            if (!streamed) fs.writeFileSync(input, await m.quoted.download());

            let crf = '28', fps = [], audio = ['-c:a', 'copy'];
            if (calidad === 'alta') crf = '23';
            else if (calidad === 'baja') { crf = '32'; audio = ['-c:a', 'aac', '-b:a', '96k']; }
            else if (calidad === 'extrema') { crf = '40'; fps = ['-r', '20']; audio = ['-c:a', 'aac', '-b:a', '64k']; }

            let ffmpegArgs = ['-i', input];
            if (command === 'dw3') {
                const aIdx = parseInt(args[1]) - 1;
                const sIdx = parseInt(args[2]) - 1;
                ffmpegArgs.push('-map', '0:v:0', '-map', `0:a:${aIdx}`, '-vf', `scale=-2:${res},subtitles=${input}:si=${sIdx}`, '-c:a', 'aac', '-b:a', '128k');
            } else {
                ffmpegArgs.push('-vf', `scale=-2:${res}`, ...audio);
            }
            
            ffmpegArgs.push('-c:v', 'libx264', '-crf', crf, '-preset', 'ultrafast', '-threads', '2', ...fps, '-y', output);

            const proc = spawn('ffmpeg', ffmpegArgs);
            proc.stderr.on('data', d => process.stdout.write(d.toString()));
            proc.on('close', async (code) => {
                if (code === 0) await conn.sendMessage(m.chat, { video: fs.readFileSync(output) }, { quoted: m });
                else reply('Error en FFmpeg.');
                if (fs.existsSync(input)) fs.unlinkSync(input);
                if (fs.existsSync(output)) fs.unlinkSync(output);
            });
        } catch (e) {
            reply('Error critico.');
        }
    }
};

handler.command = /^(dw|dw2|dw3)$/i;
export default handler;
            
