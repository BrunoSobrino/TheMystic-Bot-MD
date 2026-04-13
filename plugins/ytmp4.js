import fetch from 'node-fetch';
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

// Convertimos exec en una promesa para poder usar await
const execPromise = promisify(exec);

const handler = async (m, { conn, client, args, text, command }) => {
    // Compatibilidad de sockets
    const socket = conn || client;
    let url = text || args[0];
    
    // Tu API Key
    const apikey = "causa-0e3eacf90ab7be15";
    
    // Validar si el usuario ingresó un enlace
    if (!url) {
        return socket.sendMessage(m.chat, { 
            text: `《✧》 Por favor, ingresa un enlace de YouTube válido.` 
        }, { quoted: m });
    }
    
    if (!url.includes('youtu')) {
        return socket.sendMessage(m.chat, { 
            text: `❌ El enlace proporcionado no parece ser de YouTube.` 
        }, { quoted: m });
    }

    try {
        // Reaccionar con reloj al inicio del proceso
        await socket.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        // =======================================================
        // PLAN A: INTENTAR CON YT-DLP (Solo para documentos)
        // =======================================================
        if (command === 'ytmp4doc') {
            try {
                // Creamos un nombre de archivo temporal único para evitar cruces
                const tmpFile = `./tmp_${Date.now()}.mp4`;
                
                // 1. Obtener el título usando yt-dlp
                const { stdout: titleOut } = await execPromise(`yt-dlp --print title "${url}"`);
                const title = titleOut.trim() || 'Video_YouTube';
                const tituloLimpio = title.replace(/[\\/:*?"<>|]/g, "");

                // 2. Descargar con yt-dlp forzando formato mp4 y máximo 720p
                await execPromise(`yt-dlp -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best" --merge-output-format mp4 -o "${tmpFile}" "${url}"`);

                // 3. Enviar el archivo como documento
                await socket.sendMessage(m.chat, { 
                    document: fs.readFileSync(tmpFile), 
                    mimetype: 'video/mp4',
                    fileName: `${tituloLimpio}.mp4`
                }, { quoted: m });

                // 4. Borrar el archivo temporal
                if (fs.existsSync(tmpFile)) {
                    fs.unlinkSync(tmpFile);
                }

                // Reacción de éxito y terminamos la ejecución aquí
                await socket.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                return; 

            } catch (err) {
                console.log('⚠️ Error con yt-dlp, activando API de respaldo...', err.message);
                // Si falla (no está instalado, error de descarga, etc.), 
                // ignoramos el error y dejamos que el código siga hacia el PLAN B.
            }
        }

        // =======================================================
        // PLAN B: RESPALDO CON API (O para el comando .ytmp4)
        // =======================================================
        let apiUrl = `https://rest.apicausas.xyz/api/v1/descargas/youtube?apikey=${apikey}&url=${encodeURIComponent(url)}&type=video`;
        
        if (command === 'ytmp4doc') {
            apiUrl += `&quality=720p`;
        }

        // Consultar la API
        const res = await fetch(apiUrl);
        const json = await res.json();

        // Extraer enlace de descarga y título
        const downloadUrl = json.data?.download?.url || json.result?.download || json.url || (json.data && json.data.url);
        const titleApi = json.data?.title || json.title || json.result?.title || 'Video_YouTube';
        
        if (!downloadUrl) throw new Error('La API no devolvió un enlace de descarga válido.');

        const tituloLimpioApi = titleApi.replace(/[\\/:*?"<>|]/g, "");

        // Enviar según el comando
        if (command === 'ytmp4doc') {
            await socket.sendMessage(m.chat, { 
                document: { url: downloadUrl }, 
                mimetype: 'video/mp4',
                fileName: `${tituloLimpioApi}.mp4`
            }, { quoted: m });
        } else {
            await socket.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                caption: `🎬 *${titleApi}*`,
                mimetype: 'video/mp4',
                fileName: `${tituloLimpioApi}.mp4`
            }, { quoted: m });
        }

        // Reacción de éxito
        await socket.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        // Reacción de error y mensaje
        await socket.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        socket.sendMessage(m.chat, { text: `❌ *Error:* ${e.message}` }, { quoted: m });
    }
};

handler.help = ['ytmp4 <link>', 'ytmp4doc <link>'];
handler.tags = ['downloader'];
handler.command = /^(ytmp4|ytmp4doc)$/i;

export default handler;
