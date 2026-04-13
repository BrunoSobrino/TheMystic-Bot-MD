import { File } from 'megajs';
import axios from 'axios';
import cheerio from 'cheerio';
import { lookup } from 'mime-types';
import fs from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { performance } from 'perf_hooks';
import { pipeline } from 'stream/promises';
import { PassThrough } from 'stream';
import https from 'https';

// Agente persistente para optimizar conexiones
const httpsAgent = new https.Agent({ keepAlive: true, maxFreeSockets: 20 });

global.activeDownloads = global.activeDownloads || new Map();

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (command === 'cancelar' || command === 'stop') {
        const quotedMsgId = m.quoted ? m.quoted.id : null;
        if (!quotedMsgId) return m.reply(`❌ Responde al mensaje de la descarga activa.`);
        const download = global.activeDownloads.get(quotedMsgId);
        if (!download) return m.reply(`❌ No hay descarga activa para ese mensaje.`);
        download.controller.abort();
        global.activeDownloads.delete(quotedMsgId);
        return m.reply(`🚫 Descarga cancelada.`);
    }

    const url = args[0];
    if (!url) throw `*< DESCARGAS />*\n\n*[ ℹ️ ] Ingrese un enlace de Mega o MediaFire.*`;

    const isMega = /mega\.nz/.test(url);
    const isMediaFire = /mediafire\.com/.test(url);
    const controller = new AbortController();
    const { signal } = controller;
    let tempPath;

    try {
        let name, sizeH, downloadUrl, sizeBytes;
        const { key } = await m.reply(`⏳ *Preparando archivos...*`);
        const msgId = key.id;
        global.activeDownloads.set(msgId, { controller });

        if (isMega) {
            // --- PROCESO MEGA CON MONITOR DE DESCARGA ---
            const file = File.fromURL(url);
            await file.loadAttributes();
            name = file.name;
            sizeBytes = file.size;
            sizeH = (sizeBytes / (1024 * 1024)).toFixed(2) + ' MB';
            
            await conn.sendMessage(m.chat, { text: `📥 *Descargando de Mega:* ${name}\n⚖️ *Tamaño:* ${sizeH}\n\n_Monitoreando en terminal..._`, edit: key });
            
            tempPath = join(tmpdir(), `mega_${Date.now()}_${name}`);
            const fileStream = file.download({ signal });
            
            let dld = 0;
            fileStream.on('data', (chunk) => {
                dld += chunk.length;
                const p = ((dld / sizeBytes) * 100).toFixed(2);
                process.stdout.write(`\r[MEGA] 🔽 DESCARGANDO: ${p}% | ${(dld / 1024 / 1024).toFixed(2)}MB`);
            });

            await pipeline(fileStream, fs.createWriteStream(tempPath), { signal });

        } else {
            // --- PROCESO MEDIAFIRE CON MONITOR DE DESCARGA ---
            const mfData = await mediafireDl(url);
            name = mfData.name;
            downloadUrl = mfData.link;
            const head = await axios.head(downloadUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal, httpsAgent });
            sizeBytes = parseInt(head.headers['content-length'] || '0');
            sizeH = (sizeBytes / (1024 * 1024)).toFixed(2) + ' MB';

            await conn.sendMessage(m.chat, { text: `📥 *Descargando de MediaFire:* ${name}\n⚖️ *Tamaño:* ${sizeH}`, edit: key });

            tempPath = join(tmpdir(), `mf_${Date.now()}_${name}`);
            const response = await axios({ method: 'get', url: downloadUrl, responseType: 'stream', signal, httpsAgent });
            
            let dld = 0;
            response.data.on('data', (chunk) => {
                dld += chunk.length;
                const p = ((dld / sizeBytes) * 100).toFixed(2);
                process.stdout.write(`\r[MEDIAFIRE] 🔽 DESCARGANDO: ${p}% | ${(dld / 1024 / 1024).toFixed(2)}MB`);
            });

            await pipeline(response.data, fs.createWriteStream(tempPath), { signal });
        }

        // --- MONITOR DE SUBIDA UNIVERSAL (MEGA Y MF) ---
        console.log(`\n[BOT] ✅ Descarga completa. Iniciando subida a WhatsApp...`);
        const stats = fs.statSync(tempPath);
        const totalUploadSize = stats.size;
        let uploadedBytes = 0;
        const startTimeUpload = performance.now();

        const progressStream = new PassThrough();
        progressStream.on('data', (chunk) => {
            uploadedBytes += chunk.length;
            const elapsed = (performance.now() - startTimeUpload) / 1000;
            const speed = (uploadedBytes / (1024 * 1024) / elapsed).toFixed(2);
            const percent = ((uploadedBytes / totalUploadSize) * 100).toFixed(2);
            process.stdout.write(`\r[WHATSAPP] ⬆️ SUBIENDO: ${percent}% | Velocidad: ${speed} MB/s`);
        });

        // Iniciamos la lectura para el monitor
        fs.createReadStream(tempPath).pipe(progressStream);

        await conn.sendMessage(m.chat, { 
            document: { url: tempPath }, 
            fileName: name, 
            mimetype: lookup(name) || 'application/octet-stream',
            caption: `✅ *Archivo:* ${name}\n⚖️ *Tamaño:* ${sizeH}\n🚀 *Enviado con éxito.*`
        }, { quoted: m });

        console.log(`\n[BOT] ✨ Proceso finalizado.`);
        global.activeDownloads.delete(msgId);

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log(`\n[BOT] 🛑 Descarga cancelada.`);
        } else {
            console.error(`\n[ERROR]:`, error.message);
            await m.reply(`❌ *Error:* ${error.message}`);
        }
    } finally {
        if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
};

async function mediafireDl(url) {
    const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
    const $ = cheerio.load(res.data);
    const link = $('#downloadButton').attr('href') || res.data.match(/href="(https:\/\/download\d+\.mediafire\.com[^"]+)"/)?.[1];
    let name = $('.promoDownloadName').first().attr('title') || $('.filename').first().text().trim();
    return { name: name.replace(/\s+/g, ' ').trim(), link };
}

handler.command = /^(mega|mg|mediafire|mf|cancelar|stop)$/i;
export default handler;
    
