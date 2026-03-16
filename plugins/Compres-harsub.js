import fs from 'fs';
import { exec, spawn } from 'child_process';

let handler = async (m, { conn, text, command, args }) => {
    const reply = (texto) => conn.sendMessage(m.chat, { text: texto }, { quoted: m });

    if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp', { recursive: true });
        console.log('[Sistema] Carpeta ./temp creada.');
    }

    if (command === 'dw') {
        if (!m.quoted || !m.quoted.mimetype.includes('video')) {
            return reply('Por favor, responde a un video.');
        }
        
        console.log('\n--- NUEVO PROCESO DE ANALISIS (.dw) ---');
        console.log('[1/3] Descargando video de WhatsApp para analisis...');
        reply('Descargando y analizando el video...');
        
        const timestamp = Date.now();
        const inputVideo = `./temp/video_${timestamp}.mp4`;
        
        try {
            const mediaBuffer = await m.quoted.download();
            fs.writeFileSync(inputVideo, mediaBuffer);
            console.log('[2/3] Descarga completada. Analizando metadatos con FFprobe...');
            
            const ffprobeCommand = `ffprobe -v quiet -print_format json -show_streams "${inputVideo}"`;
            
            exec(ffprobeCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('[!] Error en FFprobe:', error);
                    if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
                    return reply('Ocurrio un error al analizar el video.');
                }
                
                console.log('[3/3] Analisis completado. Enviando resultados al chat.');
                const data = JSON.parse(stdout);
                
                let responseText = '> **Informacion del video**\n\n';
                
                const audios = data.streams.filter(s => s.codec_type === 'audio');
                responseText += '> **Audios disponibles**\n';
                if (audios.length === 0) responseText += '- Ninguno\n';
                audios.forEach((audio, index) => {
                    const lang = audio.tags && audio.tags.language ? audio.tags.language : 'Desconocido';
                    responseText += `- Pista ${index + 1}: ${audio.codec_name} (Idioma: ${lang})\n`;
                });
                
                responseText += '\n> **Subtitulos disponibles**\n';
                const subs = data.streams.filter(s => s.codec_type === 'subtitle');
                if (subs.length === 0) responseText += '- Ninguno\n';
                subs.forEach((sub, index) => {
                    const lang = sub.tags && sub.tags.language ? sub.tags.language : 'Desconocido';
                    responseText += `- Pista ${index + 1}: ${sub.codec_name} (Idioma: ${lang})\n`;
                });
                
                responseText += '\nPara comprimir usa: .dw2 [360|720|1080]\nPara procesar completo usa: .dw3 [resolucion] [audio] [subtitulo]';
                
                reply(responseText);
                
                if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
                console.log('--- FIN DEL ANALISIS ---\n');
            });
        } catch (err) {
            console.error('[!] Error en la descarga:', err);
            reply('Error al descargar el video.');
        }
    }

    if (command === 'dw2') {
        if (!m.quoted || !m.quoted.mimetype.includes('video')) {
            return reply('Por favor, responde a un video.');
        }
        
        if (!args[0] || !['360', '720', '1080'].includes(args[0])) {
            return reply('Formato invalido. Debes usar: .dw2 360, .dw2 720 o .dw2 1080');
        }
        
        const resolucion = args[0];
        console.log(`\n--- NUEVO PROCESO DE COMPRESION (.dw2 a ${resolucion}p) ---`);
        reply(`Iniciando compresion a ${resolucion}p. Revisa la terminal para ver el progreso...`);
        
        const timestamp = Date.now();
        const inputVideo = `./temp/input_${timestamp}.mp4`;
        const outputVideo = `./temp/output_${timestamp}.mp4`;
        
        try {
            console.log('[1/4] Descargando video fuente de WhatsApp...');
            const mediaBuffer = await m.quoted.download();
            fs.writeFileSync(inputVideo, mediaBuffer);
            console.log('[2/4] Descarga completada. Iniciando FFmpeg...');
            
            const ffmpegArgs = [
                '-i', inputVideo,
                '-vf', `scale=-2:${resolucion}`,
                '-c:v', 'libx264',
                '-crf', '28',
                '-preset', 'ultrafast',
                '-c:a', 'copy',
                '-y', outputVideo
            ];
            
            const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
            
            // Esto muestra el progreso de FFmpeg en la terminal
            ffmpegProcess.stderr.on('data', (data) => {
                process.stdout.write(data.toString());
            });
            
            ffmpegProcess.on('close', async (code) => {
                if (code === 0) {
                    console.log(`\n[3/4] Compresion completada con exito.`);
                    console.log('[4/4] Subiendo video procesado a WhatsApp...');
                    
                    await conn.sendMessage(m.chat, { 
                        video: fs.readFileSync(outputVideo)
                    }, { quoted: m });
                    
                    console.log('--- ENVIO COMPLETADO ---\n');
                } else {
                    console.error(`\n[!] FFmpeg termino con error. Codigo: ${code}`);
                    reply('Ocurrio un error al comprimir el video.');
                }
                
                if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
                if (fs.existsSync(outputVideo)) fs.unlinkSync(outputVideo);
            });
        } catch (err) {
            console.error('[!] Error critico:', err);
            reply('Error en el proceso de descarga y compresion.');
        }
    }

    if (command === 'dw3') {
        if (!m.quoted || !m.quoted.mimetype.includes('video')) {
            return reply('Por favor, responde a un video analizado previamente.');
        }
        
        if (args.length < 3) {
            return reply('Uso incorrecto. Formato: .dw3 [resolucion] [numero_audio] [numero_subtitulo]\nEjemplo: .dw3 720 2 1');
        }
        
        const resolucion = args[0];
        const audioIndex = parseInt(args[1]) - 1;
        const subIndex = parseInt(args[2]) - 1;
        
        if (!['360', '720', '1080'].includes(resolucion)) {
            return reply('Resolucion invalida. Usa 360, 720 o 1080.');
        }
        
        console.log(`\n--- NUEVO PROCESO COMPLETO (.dw3) ---`);
        console.log(`Resolucion: ${resolucion}p | Audio Index: ${audioIndex} | Sub Index: ${subIndex}`);
        reply(`Procesando video a ${resolucion}p.\nExtrayendo Audio ${args[1]} y quemando Subtitulo ${args[2]}...\nRevisa la terminal de Termux.`);
        
        const timestamp = Date.now();
        const inputVideo = `./temp/input_${timestamp}.mp4`;
        const outputVideo = `./temp/output_${timestamp}.mp4`;
        
        try {
            console.log('[1/4] Descargando video fuente de WhatsApp...');
            const mediaBuffer = await m.quoted.download();
            fs.writeFileSync(inputVideo, mediaBuffer);
            console.log('[2/4] Descarga completada. Iniciando mapeo y quema de subtitulos en FFmpeg...');
            
            const ffmpegArgs = [
                '-i', inputVideo,
                '-map', '0:v:0',
                '-map', `0:a:${audioIndex}`,
                '-vf', `scale=-2:${resolucion},subtitles=${inputVideo}:si=${subIndex}`,
                '-c:v', 'libx264',
                '-crf', '28',
                '-preset', 'ultrafast',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-y', outputVideo
            ];
            
            const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
            
            // Esto imprime el frame a frame, bitrate y velocidad en tu pantalla
            ffmpegProcess.stderr.on('data', (data) => {
                process.stdout.write(data.toString());
            });
            
            ffmpegProcess.on('close', async (code) => {
                if (code === 0) {
                    console.log(`\n[3/4] Decodificacion y quemado de subtitulos completado.`);
                    console.log('[4/4] Subiendo archivo final a WhatsApp...');
                    
                    await conn.sendMessage(m.chat, { 
                        video: fs.readFileSync(outputVideo)
                    }, { quoted: m });
                    
                    console.log('--- ENVIO COMPLETADO ---\n');
                } else {
                    console.error(`\n[!] Error en FFmpeg al mapear. Codigo: ${code}`);
                    reply('Ocurrio un error al mapear el audio y los subtitulos. Asegurate de que los indices existan.');
                }
                
                if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
                if (fs.existsSync(outputVideo)) fs.unlinkSync(outputVideo);
            });
        } catch (err) {
            console.error('[!] Error critico en dw3:', err);
            reply('Error critico en la descarga o procesamiento.');
        }
    }
};

handler.command = /^(dw|dw2|dw3)$/i;
export default handler;
                    
