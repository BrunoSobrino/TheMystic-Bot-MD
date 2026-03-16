import fs from 'fs';
import { exec, spawn } from 'child_process';
import { pipeline } from 'stream/promises';
import { google } from 'googleapis';

// Configuración de Autenticación Google Drive
const oauth2Client = new google.auth.OAuth2();
oauth2Client.setCredentials({
    refresh_token: 'TU_REFRESH_TOKEN_AQUI' // Requiere generar un Token de Google Cloud
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

let handler = async (m, { conn, text, command, args }) => {
    const reply = (texto) => conn.sendMessage(m.chat, { text: texto }, { quoted: m });

    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });

    const uploadToDrive = async (filePath, fileName) => {
        try {
            const response = await drive.files.create({
                requestBody: {
                    name: fileName,
                    mimeType: 'video/mp4',
                },
                media: {
                    mimeType: 'video/mp4',
                    body: fs.createReadStream(filePath),
                },
            });
            return response.data.id;
        } catch (error) {
            console.error('Error subiendo a Drive:', error);
            return null;
        }
    };

    const flags = {
        'spa': '🇲🇽', 'es': '🇲🇽', 'eng': '🇺🇸', 'en': '🇺🇸', 'jpn': '🇯🇵', 'ja': '🇯🇵',
        'por': '🇧🇷', 'pt': '🇧🇷', 'ara': '🇸🇦', 'ar': '🇸🇦', 'fre': '🇫🇷', 'fra': '🇫🇷', 'fr': '🇫🇷',
        'ger': '🇩🇪', 'de': '🇩🇪', 'ita': '🇮🇹', 'it': '🇮🇹', 'rus': '🇷🇺', 'ru': '🇷🇺',
        'chi': '🇨🇳', 'zh': '🇨🇳', 'kor': '🇰🇷', 'ko': '🇰🇷', 'und': '🏳️'
    };

    if (command === 'dw') {
        if (!m.quoted) return reply('Responde a un video o documento.');
        const inputVideo = `./temp/video_${Date.now()}`;
        try {
            const { downloadContentFromMessage } = await import('baileys');
            const message = m.quoted.fakeObj ? m.quoted.fakeObj.message : (m.quoted.vM ? m.quoted.vM.message : m.quoted);
            const type = Object.keys(message)[0];
            const stream = await downloadContentFromMessage(message[type], type.replace('Message', ''));
            await pipeline(stream, fs.createWriteStream(inputVideo));

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

                responseText += '\nUso:\n_*.dw2 [res] [calidad] (doc)*_\n_*.dw3 [res] [audio] [sub] [calidad] (doc)*_\n_*.dw4 (doc)*_';
                reply(responseText);
                if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
            });
        } catch (e) { reply('Error en analisis.'); }
    }

    if (/^(dw2|dw3|dw4)$/i.test(command)) {
        if (!m.quoted) return reply('Responde a un video.');
        const isDw4 = command === 'dw4';
        const isDw3 = command === 'dw3';
        const asDocument = args[args.length - 1]?.toLowerCase() === 'doc';
        let res = isDw4 ? '360' : args[0];
        const timestamp = Date.now();
        const input = `./temp/in_${timestamp}${isDw3 ? '.mkv' : ''}`;
        const output = `./temp/out_${timestamp}.mp4`;

        try {
            reply(`Procesando \`${command}\`...\nModo: \`${asDocument ? 'Documento' : 'Video'}\`\nSubiendo a Drive tras finalizar.`);
            
            const { downloadContentFromMessage } = await import('baileys');
            const message = m.quoted.fakeObj ? m.quoted.fakeObj.message : (m.quoted.vM ? m.quoted.vM.message : m.quoted);
            const type = Object.keys(message)[0];
            const stream = await downloadContentFromMessage(message[type], type.replace('Message', ''));
            await pipeline(stream, fs.createWriteStream(input));

            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate,duration -of default=noprint_wrappers=1:nokey=1 "${input}"`, (err, stdout) => {
                const parts = stdout.split('\n');
                const fpsParts = parts[0].split('/');
                const fps = parseFloat(fpsParts[0]) / parseFloat(fpsParts[1]);
                const duration = parseFloat(parts[1]);
                const totalFrames = Math.floor(fps * duration);

                let ffmpegArgs = ['-i', input];

                if (isDw4) {
                    // Configuración solicitada: Preset ultrafast y CRF 32
                    ffmpegArgs.push('-vf', 'scale=-2:360', '-c:v', 'libx264', '-crf', '32', '-preset', 'ultrafast', '-c:a', 'aac', '-b:a', '64k', '-ac', '1');
                } else if (isDw3) {
                    const aIdx = parseInt(args[1]) - 1;
                    const sIdx = parseInt(args[2]) - 1;
                    ffmpegArgs.push('-map', '0:v:0', '-map', `0:a:${aIdx}`, '-vf', `scale=-2:${res},subtitles=${input}:si=${sIdx}`, '-c:a', 'aac', '-b:a', '128k', '-c:v', 'libx264', '-crf', '32', '-preset', 'ultrafast');
                } else {
                    ffmpegArgs.push('-vf', `scale=-2:${res}`, '-c:a', 'copy', '-c:v', 'libx264', '-crf', '32', '-preset', 'ultrafast');
                }

                ffmpegArgs.push('-threads', '2', '-y', output);
                const proc = spawn('ffmpeg', ffmpegArgs);

                proc.on('close', async (code) => {
                    if (code === 0) {
                        const driveId = await uploadToDrive(output, `Video_${timestamp}.mp4`);
                        const stats = fs.statSync(output);
                        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                        
                        let caption = `✅ Tamaño: ${sizeMB} MB\n`;
                        if (driveId) caption += `☁️ Almacenado en Drive ID: \`${driveId}\``;

                        const mediaOptions = asDocument 
                            ? { document: fs.readFileSync(output), fileName: `Video_${res}p.mp4`, mimetype: 'video/mp4', caption }
                            : { video: fs.readFileSync(output), caption };

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
                                  
