const fs = require('fs');
const { exec } = require('child_process');

// Agrega esto dentro de tu switch(command) o estructura principal:

case 'dw': {
    if (!m.quoted || !m.quoted.mimetype.includes('video')) {
        return reply('Por favor, responde a un video.');
    }
    
    reply('Descargando y analizando el video...');
    
    const timestamp = Date.now();
    const tempFile = `./temp/video_${timestamp}`;
    
    try {
        const inputVideo = await conn.downloadAndSaveMediaMessage(m.quoted, tempFile);
        
        const ffprobeCommand = `ffprobe -v quiet -print_format json -show_streams "${inputVideo}"`;
        
        exec(ffprobeCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error en FFprobe:', error);
                if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
                return reply('Ocurrio un error al analizar el video.');
            }
            
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
        });
    } catch (err) {
        console.error(err);
        reply('Error al descargar el video.');
    }
    break;
}

case 'dw2': {
    if (!m.quoted || !m.quoted.mimetype.includes('video')) {
        return reply('Por favor, responde a un video.');
    }
    
    const args = text.trim().split(' ');
    const resolucion = args[0];
    
    if (!['360', '720', '1080'].includes(resolucion)) {
        return reply('Formato invalido. Debes usar: .dw2 360, .dw2 720 o .dw2 1080');
    }
    
    reply(`Iniciando compresion a ${resolucion}p. Esto tomara un tiempo...`);
    
    const timestamp = Date.now();
    const tempBase = `./temp/video_${timestamp}`;
    let inputVideo = '';
    const outputVideo = `./temp/output_${timestamp}.mp4`;
    
    try {
        inputVideo = await conn.downloadAndSaveMediaMessage(m.quoted, tempBase);
        
        const ffmpegCommand = `ffmpeg -i "${inputVideo}" -vf "scale=-2:${resolucion}" -c:v libx264 -crf 28 -preset ultrafast -c:a copy -y "${outputVideo}"`;
        
        exec(ffmpegCommand, async (error, stdout, stderr) => {
            if (error) {
                console.error('Error en FFmpeg:', error);
                if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
                return reply('Ocurrio un error al comprimir el video.');
            }
            
            await conn.sendMessage(m.chat, { 
                video: fs.readFileSync(outputVideo)
            }, { quoted: m });
            
            if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
            if (fs.existsSync(outputVideo)) fs.unlinkSync(outputVideo);
        });
    } catch (err) {
        console.error(err);
        reply('Error en el proceso de descarga y compresion.');
    }
    break;
}

case 'dw3': {
    if (!m.quoted || !m.quoted.mimetype.includes('video')) {
        return reply('Por favor, responde a un video analizado previamente.');
    }
    
    const args = text.trim().split(' ');
    
    if (args.length < 3) {
        return reply('Uso incorrecto. Formato: .dw3 [resolucion] [numero_audio] [numero_subtitulo]\nEjemplo: .dw3 720 2 1');
    }
    
    const resolucion = args[0];
    const audioIndex = parseInt(args[1]) - 1;
    const subIndex = parseInt(args[2]) - 1;
    
    if (!['360', '720', '1080'].includes(resolucion)) {
        return reply('Resolucion invalida. Usa 360, 720 o 1080.');
    }
    
    if (isNaN(audioIndex) || isNaN(subIndex) || audioIndex < 0 || subIndex < 0) {
        return reply('Los numeros de pista de audio y subtitulo deben ser validos.');
    }
    
    reply(`Procesando video a ${resolucion}p.\nExtrayendo Audio ${args[1]} y quemando Subtitulo ${args[2]}...\nEsto tomara un tiempo.`);
    
    const timestamp = Date.now();
    const tempBase = `./temp/input_${timestamp}`;
    let inputVideo = '';
    const outputVideo = `./temp/output_${timestamp}.mp4`;
    
    try {
        inputVideo = await conn.downloadAndSaveMediaMessage(m.quoted, tempBase);
        
        const ffmpegCommand = `ffmpeg -i "${inputVideo}" -map 0:v:0 -map 0:a:${audioIndex} -vf "scale=-2:${resolucion},subtitles='${inputVideo}':si=${subIndex}" -c:v libx264 -crf 28 -preset ultrafast -c:a aac -b:a 128k -y "${outputVideo}"`;
        
        exec(ffmpegCommand, async (error, stdout, stderr) => {
            if (error) {
                console.error('Error en FFmpeg:', error);
                if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
                return reply('Ocurrio un error al mapear el audio y los subtitulos. Asegurate de que los numeros de pista existan.');
            }
            
            await conn.sendMessage(m.chat, { 
                video: fs.readFileSync(outputVideo)
            }, { quoted: m });
            
            if (fs.existsSync(inputVideo)) fs.unlinkSync(inputVideo);
            if (fs.existsSync(outputVideo)) fs.unlinkSync(outputVideo);
        });
    } catch (err) {
        console.error(err);
        reply('Error critico en la descarga o procesamiento.');
    }
    break;
        }
             
