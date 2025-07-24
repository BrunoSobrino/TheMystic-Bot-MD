import { join } from 'path';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import axios from 'axios';
import fetch from 'node-fetch';
import NodeID3 from 'node-id3';
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import("baileys")).default;

const handler = async (m, { conn, args }) => {
    try {
        if (!args[0]) throw '*[❗] Por favor, ingresa una descripción para generar la canción.*\n\n*Uso:* /musicaia descripción | tags opcionales\n*Ejemplo:* /musicaia canción de amor | pop, romántico, acústico';
        
        const input = args.join(' ');
        const [prompt, customTags] = input.split('|').map(part => part.trim());
        
        if (!prompt) throw '*[❗] Por favor, ingresa una descripción para generar la canción.*';
        
        m.reply("*[❗] Ey! Espera un poco, nuestra IA creativa está trabajando a todo ritmo para componer tu canción perfecta, esto puede demorar unos momentos, cuando esté lista se te enviará.*");
        const generatedSongs = await generateMusic(prompt, { tags: customTags || 'pop, romantic' });
        
        if (!generatedSongs || generatedSongs.length === 0) throw '❌ No se pudo generar la canción. Intenta con otro prompt.';
        
        const song = generatedSongs[0];
        
        const [audioBuffer, thumbnailBuffer] = await Promise.all([
            fetch(song.audio_url).then(res => res.buffer()),
            fetch(song.image_url).then(res => res.buffer())
        ]);
               
        const tags = {
            title: song.title,
            artist: 'IA Musical',
            album: 'Generado por IA',
            APIC: {
                mime: 'image/png',
                type: {
                    id: 3,
                    name: 'front cover'
                },
                description: 'Cover Art',
                imageBuffer: thumbnailBuffer
            },
            year: new Date().getFullYear().toString(),
            genre: song.tags,
            comment: {
                language: 'spa',
                text: `👑 By @BrunoSobrino 👑\n\nGénero: ${song.tags}\nDuración: ${song.duration}s`
            }
        };
        
        if (song.lyrics !== null && song.lyrics) {
            tags.unsynchronisedLyrics = {
                language: 'spa',
                text: `👑 By @BrunoSobrino 👑\n\nTítulo: ${song.title}\n\n${song.lyrics}`.substring(0, 5000)
            };
        }
        
        const taggedBuffer = NodeID3.write(tags, audioBuffer);
                
        const tmpDir = tmpdir();
        const audioPath = join(tmpDir, `${song.title.replace(/[^a-z0-9]/gi, '_')}.mp3`);
        writeFileSync(audioPath, taggedBuffer);
        
        const thumbnailMessage = await prepareWAMessageMedia({ image: { url: song.image_url } }, { upload: conn.waUploadToServer });
        const documentMessage = await prepareWAMessageMedia({ 
            document: {
                url: audioPath,
                mimetype: 'audio/mpeg',
                fileName: `${sanitizeFileName(song.title.substring(0, 64))}.mp3`, 
                fileLength: taggedBuffer.length,
                title: song.title.substring(0, 64), 
                ptt: false 
            }
        }, { upload: conn.waUploadToServer, mediaType: 'document' });

        const mesg = generateWAMessageFromContent(m.chat, {
            documentMessage: {
                ...documentMessage.documentMessage,
                mimetype: 'audio/mpeg',
                title: song.title.substring(0, 64),
                fileName: `${sanitizeFileName(song.title.substring(0, 64))}.mp3`, 
                jpegThumbnail: thumbnailMessage.imageMessage.jpegThumbnail,
                mediaKeyTimestamp: Math.floor(Date.now() / 1000),
            }
        }, { userJid: conn.user.jid, quoted: m });
                
        await conn.relayMessage(m.chat, mesg.message, { messageId: mesg.key.id });
        
        setTimeout(() => {
            if (existsSync(audioPath)) unlinkSync(audioPath);
        }, 5000);
        
    } catch (error) {
        console.error('Error en el handler:', error);
        m.reply(`❌ Ocurrió un error al generar la canción: ${error.message || error}`);
    }
};

handler.help = ['musicaia <descripción> | [tags opcionales]'];
handler.tags = ['ai', 'music'];
handler.command = /^(musicaia|musicaai|aimusic|genmusic)$/i;
export default handler;

// Credits for rynn-stuff.
async function generateMusic(prompt, { tags = 'pop, romantic' } = {}) {
    try {
        if (!prompt) throw new Error('Prompt is required');
        
        const { data: ai } = await axios.get('https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat', {
            params: {
                query: JSON.stringify([
                    {
                        role: 'system',
                        content: 'Eres una IA letrista profesional entrenada para escribir letras de canciones poéticas y rítmicas en español. Responde únicamente con letras, usando las etiquetas [verse], [chorus], [bridge], e [instrumental] o [inst] para estructurar la canción. Usa solo la etiqueta (ej: [verse]) sin numeración o texto extra (no escribas [verse 1], [chorus x2], etc). No agregues explicaciones, títulos, ni otro texto fuera de las letras. Enfócate en imágenes vívidas, flujo emocional y ritmo lírico fuerte. Evita etiquetar géneros o dar comentarios. Responde en texto plano limpio, exactamente como una hoja de letras de canción en español.'
                    },
                    {
                        role: 'user',
                        content: `Escribe una canción en español sobre: ${prompt}`
                    }
                ]),
                link: 'writecream.com'
            }
        });
        
        const session_hash = Math.random().toString(36).substring(2);
        const d = await axios.post(`https://ace-step-ace-step.hf.space/gradio_api/queue/join?`, {
            data: [ 240, tags, ai.response_content, 60, 15, 'euler', 'apg', 10, '', 0.5, 0, 3, true, false, true, '', 0, 0, false, 0.5, null, 'none' ],
            event_data: null,
            fn_index: 11,
            trigger_id: 45,
            session_hash: session_hash
        });
        
        const { data } = await axios.get(`https://ace-step-ace-step.hf.space/gradio_api/queue/data?session_hash=${session_hash}`);
        
        let result;
        const lines = data.split('\n\n');
        for (const line of lines) {
            if (line.startsWith('data:')) {
                const d = JSON.parse(line.substring(6));
                if (d.msg === 'process_completed') {
                    const outputData = d.output.data;
                    if (outputData && outputData.length >= 2) {
                        const audioFile = outputData[0];
                        const metadata = outputData[1];
                        
                        result = [{
                            audio_url: audioFile.url,
                            image_url: 'https://images.wondershare.es/dc/AI/Inteligencia_Artificial_Musical.png',
                            title: prompt.substring(0, 64) || 'Cancion_IA',
                            tags: metadata.prompt || tags,
                            lyrics: metadata.lyrics || ai.response_content || null,
                            duration: metadata.audio_duration || 240
                        }];
                    }
                }
            }
        }
        
        if (!result) {
            throw new Error('No se pudo generar la canción');
        }
        
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
}

function sanitizeFileName(str) {
    return str.replace(/[\/\\|:*?"<>]/g, '').trim();
}
