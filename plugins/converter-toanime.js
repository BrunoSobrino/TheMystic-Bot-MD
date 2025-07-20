import uploadImage from '../src/libraries/uploadImage.js';
import fetch from 'node-fetch';
import axios from 'axios';
import Jimp from 'jimp';
import FormData from 'form-data';

const handler = async (m, {conn, text, args, usedPrefix, command}) => {
 const datas = global
 const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
 const tradutor = _translate.plugins.convertidor_toanime

 const q = m.quoted ? m.quoted : m;
 const mime = (q.msg || q).mimetype || q.mediaType || '';
 if (!/image/g.test(mime)) throw `*${tradutor.texto1}*`;
 m.reply(`*${tradutor.texto2}*`);
 const data = await q.download?.();
 const image = await uploadImage(data);
 try {
  const testing = await jadianime(image)
  console.log(testing)
 const anime = await fetch(`https://deliriusapi-official.vercel.app/api/toanime?url=${image}`);
 const json = await anime.json();  
 await conn.sendFile(m.chat, json.data.convert, 'error.jpg', null, m);
 } catch {      
 try {
 const anime = `https://api.lolhuman.xyz/api/imagetoanime?apikey=${lolkeysapi}&img=${image}`;
 await conn.sendFile(m.chat, anime, 'error.jpg', null, m);
 } catch {
 try {
 const anime2 = `https://api.zahwazein.xyz/photoeditor/jadianime?url=${image}&apikey=${keysxxx}`;
 await conn.sendFile(m.chat, anime2, 'error.jpg', null, m);
 } catch {
 try {
 const anime3 = `https://api.caliph.biz.id/api/animeai?img=${image}&apikey=caliphkey`;
 await conn.sendFile(m.chat, anime3, 'error.jpg', null, m);
 } catch {
 throw `*${tradutor.texto3}*`;
    }
   } 
  }
 }
};
handler.help = ['toanime'];
handler.tags = ['converter'];
handler.command = ['jadianime', 'toanime'];

export default handler;

async function jadianime(image) {
    return new Promise(async(resolve, reject) => {
        const requestId = Math.random().toString(36).substring(7); 
        const userAgent = getRandomUserAgent();
        const ipAddress = generateRandomIP();
        axios("https://www.drawever.com/ai/photo-to-anime", {
            headers: {
                "content-type": "application/json",
                "X-Request-ID": requestId,
                "user-agent": userAgent,
                "X-Forwarded-For": ipAddress,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
                "Cookie": "DRAWEVER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MDk4OWJlZDM5NzI3ODhiN2U1MjY0NCIsImVtYWlsIjoidGhlc2hhZG93YnJva2VyczEzM0BnbWFpbC5jb20iLCJmdWxsbmFtZSI6IlNoYWRvdyIsImNyZWRpdHMiOjAsImlhdCI6MTcxMTkwMTExOH0.TQmn5BBN4hrraSaggn9skoTJC7h7LDin9kq0zweSvdc",
                "Referer": "https://www.drawever.com/process",
                "Sec-Ch-Ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": "\"Windows\"",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "same-origin",
                "Upgrade-Insecure-Requests": "1",
            },
            "data": { "data": "data:image/jpeg;base64," + image.toString('base64') },
            "method": "POST"
        }).then(res => { 
            let yanz = res.data
            console.log(yanz)
            resolve(yanz)
        }).catch(err => {
            reject(err)
        });
    });
}

function getRandomUserAgent() {
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36"
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function generateRandomIP() {
    const octet = () => Math.floor(Math.random() * 256);
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
}
