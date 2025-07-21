const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return conn.reply(m.chat, `🔍 *Por favor, proporciona un enlace de 1fichier*\n\nEjemplo: ${usedPrefix + command} https://1fichier.com/?dd6d52sj7l9h4bwezax4`, m);

    const url = args[0];

    try {
        //await conn.sendMessage(m.chat, { text: '⏳ *Procesando enlace...*\nPor favor espera mientras desbloqueamos el archivo con AllDebrid'}, { quoted: m });

        const result = await unlockWithAllDebrid(url);

        if (!result.success) {
            return await conn.sendMessage(m.chat, { 
                text: `❌ *Error al procesar el enlace*\n\n${result.error || 'Error desconocido'}\n\nEnlace: ${url}` 
            }, { quoted: m });
        }
      
        const documentContent = `
📁 *Información del Archivo*

🔹 *Nombre:* ${result.fileInfo.filename}
🔹 *Tamaño:* ${result.fileInfo.sizeFormatted}
🔹 *Host:* ${result.fileInfo.host}

🔗 *Enlace de Descarga Directa:*
${result.downloadUrl}

⚠ *Este enlace es temporal, descarga pronto!*
        `.trim();

        conn.sendMessage(m.chat, { text: documentContent }, { quoted: m });

        await conn.sendMessage(m.chat, {
            document: { url: result.downloadUrl },
            fileName: result.fileInfo.filename,
            mimetype: 'video/mp4'  
        }, { quoted: m });

    } catch (error) {
        console.error('Error en el handler:', error);
        await conn.sendMessage(m.chat, {
            text: `⚠ *Ocurrió un error inesperado*\n\n${error.message}\n\nPor favor intenta nuevamente más tarde.`
        }, { quoted: m });
    }
};

handler.help = ['1fichierdl <url>'];
handler.tags = ['downloader'];
handler.command = /^(1fichier|1fichierdl|dlpeli|pelidl)$/i;
export default handler;

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const ALL_DEBRID_API_KEY = "KOLMjMMazZ9ULUgK6pxo";

async function unlockWithAllDebrid(url, options = {}) {
    const result = {
        success: false,
        originalUrl: url,
        downloadUrl: null,
        fileInfo: null,
        error: null,
        message: null
    };

    try {

        
        const params = new URLSearchParams();
        params.append('link', url);
        if (options.password) params.append('password', options.password);

        const response = await fetch("https://api.alldebrid.com/v4/link/unlock", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ALL_DEBRID_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        const data = await response.json();

        if (data.error) {
            result.error = `AllDebrid error: ${data.error.message || data.error.code}`;
            console.error('❌ Error:', result.error);
            return result;
        }

        if (!data.data || !data.data.link) {
            result.error = "Respuesta inesperada de la API";
            return result;
        }

        result.success = true;
        result.downloadUrl = data.data.link;
        result.fileInfo = {
            filename: data.data.filename,
            size: data.data.filesize,
            sizeFormatted: formatBytes(data.data.filesize),
            host: data.data.host
        };
        result.message = "Enlace desbloqueado correctamente";



    } catch (error) {
        result.error = `Error de conexión: ${error.message}`;
        console.error('❌ Error en la solicitud:', error);
    }

    return result;
}
