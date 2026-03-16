import fs from 'fs';
import { exec, spawn } from 'child_process';
import fetch from 'node-fetch';

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
            const { downloadContentFromMessage } = await import('baileys');
            const mediaType = quoted.mtype ? quoted.mtype.replace('Message', '') : (quoted.mimetype.includes('video') ? 'video' : 'document');
            const mediaObj = quoted.vM || quoted.message?.videoMessage || quoted.message?.documentMessage || quoted;
            
            const stream = await downloadContentFromMessage(mediaObj, mediaType);
            const writeStream = fs.createWriteStream(outputPath);
            
            for await (const chunk of stream) {
                writeStream.write(chunk);
            }
            writeStream.end();
            return new Promise((resolve) => writeStream.on('finish', () => resolve(true)));
        } catch (e) {
            console.log('[!] Error en descarga por flujo:', e.message);
            return false;
        }
    };

    // Función mejorada para Graph.org con creación de cuenta dinámica
    const createGraphPage = async (title, content) => {
        try {
            // 1. Crear una cuenta temporal para obtener un token fresco
            const account = await fetch('https://api.telegra.ph/createAccount?short_name=ArimaBot&author_name=ArimaMedia').then(res => res.json());
            if (!account.ok) return null;
            
            const token = account.result.access_token;

            // 2. Crear la página
            const response = await fetch('https://api.telegra.ph/createPage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_token: token,
                    title: title,
                    content: content.split('\n').map(line => ({ tag: 'p', children: [line] })),
                    return_content: true
                })
            });
            const json = await response.json();
            return json.ok ? json.result.url : null;
        } catch (e) {
            console.error('[Graph Error]', e);
            return null;
        }
    };

    if (command === 'dw') {
        if (!isMediaValid()) return reply('Responde a un video o documento multimedia.');
        reply('Generando MediaInfo en Graph.org...');
        const inputVideo = `./temp/video_${Date.now()}`;
        
        try {
            const streamed = await downloadMediaStream(m.quoted, inputVideo);
            if (!streamed) fs.writeFileSync(inputVideo, await m.quoted.download());
            
            exec(`ffprobe -v quiet -print_format json -show_streams -show_format "${inputVideo}"`, async (error, stdout) => {
                if (error) {
                    if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
                    return reply('Error al analizar el video con FFprobe.');
                }
                const data = JSON.parse(stdout);
                let infoText = `Formato: ${data.format.format_long_name}\n`;
                infoText += `Duracion: ${parseFloat(data.format.duration).toFixed(2)}s\n`;
                infoText += `Peso: ${(data.format.size / 1024 / 1024).toFixed(2)} MB\n\n--- AUDIOS ---\n`;
                
                data.streams.filter(s => s.codec_type === 'audio').forEach((a, i) => {
                    infoText += `Pista ${i + 1}: ${a.codec_name} (${a.tags?.language || 'und'})\n`;
                });
                
                infoText += `\n--- SUBTITULOS ---\n`;
                const subs = data.streams.filter(s => s.codec_type === 'subtitle');
                if (subs.length === 0) infoText += 'Ninguno detectado.\n';
                subs.forEach((s, i) => infoText += `Pista ${i + 1}: ${s.codec_name} (${s.tags?.language || 'und'})\n`);

                const graphUrl = await createGraphPage('Media Information', infoText);
                
                if (graphUrl) {
                    reply(`> **MediaInfo Generado**\n\n📄 Detalles: ${graphUrl}\n\nUso:\n.dw2 [res] [calidad] (doc)\n.dw3 [res] [audio] [sub] [calidad] (doc)`);
                } else {
                    reply('Fallo la subida a Graph.org. Revisa la consola de Termux.');
                }
                if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
            });
        } catch (err) { reply('Error critico en el proceso.'); }
    }

    if (command === 'dw2' || command === 'dw3') {
        if (!isMediaValid()) return reply('Responde a un video.');

        const res = args[0];
        const isDw3 = command === 'dw3';
        const calidad = (isDw3 ? args[3] : args[1]) || 'normal';
        const asDocument = args[args.length - 1]?.toLowerCase() === 'doc';
        
        if (!['360', '720', '1080'].includes(res)) return reply('Resolucion invalida (360, 720, 1080).');
        
        reply(`Procesando en calidad ${calidad}...\nModo: ${asDocument ? 'Documento' : 'Video'}`);
        
        const timestamp = Date.now();
        const input = `./temp/in_${timestamp}${isDw3 ? '.mkv' : ''}`;
        const output = `./temp/out_${timestamp}.mp4`;

        try {
            const streamed = await downloadMediaStream(m.quoted, input);
            if (!streamed) fs.writeFileSync(input, await m.quoted.download());

            let crf = '28', fps = [], audio = ['-c:a', 'copy'];
            if (calidad === 'alta') crf = '23';
            else if (calidad === 'baja') { crf = '32'; audio = ['-c:a', 'aac', '-b:a', '96k']; }
            else if (calidad === 'extrema') { crf = '40'; fps = ['-r', '20']; audio = ['-c:a', 'aac', '-b:a', '64k']; }

            let ffmpegArgs = ['-i', input];
            if (isDw3) {
                const aIdx = parseInt(args[1]) - 1;
                const sIdx = parseInt(args[2]) - 1;
                ffmpegArgs.push('-map', '0:v:0', '-map', `0:a:${aIdx}`, '-vf', `scale=-2:${res},subtitles=${input}:si=${sIdx}`, '-c:a', 'aac', '-b:a', '128k');
            } else {
                ffmpegArgs.push('-vf', `scale=-2:${res}`, ...audio);
            }
            
            ffmpegArgs.push('-c:v', 'libx264', '-crf', crf, '-preset', 'ultrafast', '-threads', '2', ...fps, '-y', output);

            const proc = spawn('ffmpeg', ffmpegArgs);
            proc.on('close', async (code) => {
                if (code === 0) {
                    const mediaOptions = asDocument 
                        ? { document: fs.readFileSync(output), fileName: `video_${res}p.mp4`, mimetype: 'video/mp4' }
                        : { video: fs.readFileSync(output) };
                    
                    await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
                } else {
                    reply('Error en el motor de compresion FFmpeg.');
                }
                if (fs.existsSync(input)) fs.unlinkSync(input);
                if (fs.existsSync(output)) fs.unlinkSync(output);
            });
        } catch (e) { reply('Error en el sistema de archivos.'); }
    }
};

handler.command = /^(dw|dw2|dw3)$/i;
export default handler;
    
