const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'play',
    alias: ['play'],
    description: 'Descarga y envía audio de una canción en YouTube',
    category: 'multimedia',
    async execute(client, message, args) {
        if (!args.length) return message.reply('❌ Debes escribir el nombre de la canción después de .play');

        const query = args.join(' '); // Convertir args en un string de búsqueda
        const searchResults = await ytsr(query, { limit: 1 });
        if (searchResults.items.length === 0) {
            message.reply('No encontré ninguna canción con ese nombre.');
            return;
        }

        const videoUrl = searchResults.items[0].url;
        const filePath = path.join(__dirname, 'audio.mp3');

        // Descargar el audio de YouTube
        const stream = ytdl(videoUrl, { filter: 'audioonly' });
        const audioFile = fs.createWriteStream(filePath);

        stream.pipe(audioFile);

        stream.on('end', async () => {
            try {
                await client.sendMessage(message.from, { audio: { url: filePath }, mimetype: 'audio/mp4' });
                message.reply('🎶 Aquí tienes tu canción.');
            } catch (err) {
                console.error('Error al enviar el audio:', err);
                message.reply('❌ Ocurrió un error al enviar el audio.');
            } finally {
                fs.unlink(filePath, err => {
                    if (err) console.error('Error al eliminar el archivo:', err);
                });
            }
        });

        stream.on('error', error => {
            console.error('Error en el stream:', error);
            message.reply('❌ Hubo un problema al descargar la canción.');
        });
    }
};
