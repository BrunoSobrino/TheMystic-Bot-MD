import axios from 'axios';
import fs from 'fs';

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
    try {
        const datas = global;
        const idioma = datas.db.data.users[m.sender]?.language || global.defaultLenguaje;
        const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
        const tradutor = _translate.plugins.herramientas_chatgpt;

        if (!text) return m.reply(tradutor.texto1[0] || 'Ingresa un texto');

        let mediax = null;
        let userID = m.sender;
        let imageDescription = '';
        
        if (m.quoted?.mimetype?.startsWith('image/') || m.mimetype?.startsWith('image/')) {
            const q = m.quoted ? m.quoted : m;
            mediax = await q.download().catch(() => null);
            
            if (mediax) {
                userID += '1';

                const descPayload = {
                    content: "Describe esta imagen en detalle",
                    user: userID,
                    prompt: "Describe objetivamente lo que ves en la imagen",
                    imageBuffer: mediax,
                    webSearchMode: false
                };
                
                const descResponse = await axios.post("https://luminai.my.id", descPayload);
                imageDescription = descResponse?.data?.result || "Imagen no identificada";
            }
        }

        let context = `Eres The Mystic Bot (v3.0). Idioma: ${idioma.toUpperCase()}\n\n` + `Creador: Bruno Sobrino\n` + `Numero del creador: +52 1 999 612  5657\n` + `Repositorio: https://github.com/BrunoSobrino/TheMystic-Bot-MD\n\n`;
        
        if (imageDescription) {
            context += `IMAGEN ACTUAL: ${imageDescription}\n\n`;
        }
        
        context += `Instrucciones:\n` +
                  `1. Responde en formato WhatsApp\n` +
                  `2. No todos los Bruno son tu creador, no los trates como creadores.\n` +
                  `3. No uses **markdown** doble`;

        const payload = {
            content: text,
            user: userID,
            prompt: context,
            webSearchMode: false,
            ...(mediax && { imageBuffer: mediax })
        };
        
        const response = await axios.post("https://luminai.my.id", payload);
        const result = response?.data?.result;
        
        m.reply(result);
        
    } catch (error) {
        console.error('Error:', error);
        m.reply(tradutor.texto4);
    }
};

handler.help = ['testia <texto> (opcional: responder a imagen)'];
handler.tags = ['ai'];
handler.command = /^(testia)$/i;
export default handler;
