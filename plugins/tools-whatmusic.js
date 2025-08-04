import { Shazam } from 'node-shazam';
import fetch from 'node-fetch';
import fs from 'fs';
import ytSearch from 'yt-search'; 
import path from 'path';

const shazam = new Shazam();

const handler = async (m, { conn }) => {
  const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje;
  const traductor = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`)).plugins.herramientas_whatmusic;

  const q = m.quoted || m;
  const mime = (q.msg || q).mimetype || '';
  
  if (/audio|video/.test(mime)) {
    const media = await q.download();
    const ext = mime.split('/')[1];
    const baseFilePath = `./src/tmp/${m.sender}`; 
    const tempPath = await getUniqueFileName(baseFilePath, ext); 
    fs.writeFileSync(tempPath, media);

    let recognisePromise;
    if (/audio/.test(mime)) {
      recognisePromise = shazam.fromFilePath(tempPath, false, 'en');
    } else if (/video/.test(mime)) {
      recognisePromise = shazam.fromVideoFile(tempPath, false, 'en');
    }

    const recognise = await recognisePromise;
    
    if (!recognise || !recognise?.track) {
      fs.unlinkSync(tempPath);
      return m.reply('> *[❗] Error: Audio not found.*')
    }
    
    const { title, subtitle, artists, genres, images } = recognise.track;
    const apiTitle = `${title} - ${subtitle || ''}`.trim();

    let ytUrl = 'https://github.com/BrunoSobrino';
    try {
      const searchResult = await ytSearch(apiTitle);
      if (searchResult && searchResult.videos.length > 0) {
        ytUrl = searchResult.videos[0].url;
      }
    } catch (error) {
      // Silent error
    }

    const texto = `${traductor.texto3[0]}\n\n${traductor.texto3[1]} ${title || traductor.texto2}\n${traductor.texto3[2]} ${subtitle || traductor.texto2}\n${traductor.texto3[4]} ${genres.primary || traductor.texto2}`;
    
    let imagen;
    try {
      imagen = await (await fetch(images.coverart)).buffer();
    } catch (error) {
      imagen = null;
    }
    
    await conn.sendMessage(m.chat, { text: texto.trim(), contextInfo: { forwardingScore: 9999999, isForwarded: true }}, { quoted: m });

    await fs.unlinkSync(tempPath);

    if (ytUrl !== 'https://github.com/BrunoSobrino') {
      try {
        const downloadResult = await yt.download(ytUrl, 'mp3');
        
        if (downloadResult && downloadResult.url) {
          const audiobuff = await conn.getFile(downloadResult.url);
          await conn.sendMessage(m.chat, { 
            audio: audiobuff.data, 
            fileName: `${title}.mp3`, 
            mimetype: 'audio/mpeg' 
          }, { quoted: m });
        }
      } catch (error) {
        console.log(error)
      }
    }
  } else {
    throw traductor.texto4;
  }
};

handler.command = /^(quemusica|quemusicaes|whatmusic|shazam)$/i;
export default handler;

async function getUniqueFileName(basePath, extension) {
  let fileName = `${basePath}.${extension}`;
  let counter = 1;
  while (fs.existsSync(fileName)) {
    fileName = `${basePath}_${counter}.${extension}`;
    counter++;
  }
  return fileName;
}

/*
  base    : https://ytmp3.lat/
  update  : 4 agustus 2025
  by      : wolep
  url     : https://pastebin.com/dSqm6kj0
*/
const yt = {
    _tools: {
        genRandomHex: (length = 32) => {
            const charSet = '0123456789abcdef'
            return Array.from({ length }, _ => charSet.charAt(Math.floor(Math.random() * charSet.length))).join('')
        },
        enc1: (url) => url.split("").map(v => v.charCodeAt()).reverse().join(),
        enc2: (url) => url.split("").map(v => String.fromCharCode(v.charCodeAt() ^ 1)).join(''),
        validateString: (description, variable) => { if (typeof (variable) !== "string" || variable?.trim()?.length === 0) throw Error(`${description} harus string dan gak boleh kosong!`) },
        mintaJson: async function (description, url, fetchOptions) {
            try {
                const response = await fetch(url, fetchOptions)
                if (!response.ok) throw Error(`${response.status} ${response.statusText} ${(await response.text() || `(respond body kosong)`).substring(0, 150)}...`)
                const json = await response.json()
                return json
            } catch (error) {
                throw Error(`gagal minta json: ${description}\nerror: ${error.message}`)
            }
        },
    },
    get baseHeaders() {
        return {
            'content-type': 'application/json',
            'Referer': 'https://ytmp3.lat/',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
        }
    },

    init: async function (ytUrl, format = 'mp3') {
        this._tools.validateString(`url youtube`, ytUrl)
        
        const formatList = {
            'mp3' : 0,
            'mp4' : 1
        }
        const selectedFormat = formatList?.[format] + ""
        if (selectedFormat === undefined) throw Error (`invalid format, format tersedia: ${Object.keys(formatList).join(', ')}`)

        const encUrl = this._tools.enc1(ytUrl)
        const encPayload = this._tools.enc2(ytUrl)
        const hash1 = this._tools.genRandomHex()
        const hash2 = this._tools.genRandomHex()

        const url = `https://ytmp3.lat/${hash1}/init/${encUrl}/${hash2}/`
        const headers = {
            ... this.baseHeaders
        }
        const body = JSON.stringify({
            "data": encPayload,
            "format": selectedFormat,
        })
        const json = await this._tools.mintaJson(`init`, url, { headers, body, method: 'post' })
        json.format = format
        return json
    },

    cekStatus: async function (initObject) {
        let wolep = initObject
        let fetchCount = 1
        const MAX_FETCH_ATTEMPT = 60

        if (wolep?.s == 'C') {
            const url = this.createDownloadUrl(wolep)
            const title = initObject?.t || `(no name)`
            const format = initObject?.format
            const result = {url, title, format}
            return result
        } else {
            const hash1 = this._tools.genRandomHex()
            const hash2 = this._tools.genRandomHex()
            const { i } = wolep
            const headers = { ... this.baseHeaders }
            const url = `https://ytmp3.lat/${hash1}/status/${i}/${hash2}/`
            const body = JSON.stringify({
                data: i
            })

            do {
                wolep = await this._tools.mintaJson(`status`, url, { headers, body, 'method': 'post' })

                if (wolep.le) throw Error(`The video is longer than 30 minutes. Please select another video.`)
                if (wolep.e) throw Error(`There was an error in converting video. Please try again.`)
                if (wolep.i == 'invalid') throw Error(`Please enter a correct YouTube video URL.`)
                if (wolep.s == 'C') {
                    const url = this.createDownloadUrl(wolep)
                    const title = wolep.t || `(no name)`
                    const format = initObject.format
                    const result = {url, title, format}
                    return result
                }
                await new Promise(re => setTimeout(re, 3000))
                fetchCount++

            } while (wolep?.s == 'P' && fetchCount < MAX_FETCH_ATTEMPT)
            throw Error(`mencapai maksimal batas checking ${MAX_FETCH_ATTEMPT}`)
        }
    },

    createDownloadUrl: function (cekStatusObject) {
        const hash1 = this._tools.genRandomHex()
        const hash2 = this._tools.genRandomHex()
        const encTaskId = this._tools.enc2(cekStatusObject.i)
        const url = `https://ytmp3.lat/${hash1}/download/${encTaskId}/${hash2}/`
        return url
    },

    download: async function (youtubeUrl, format = 'mp3') {
        const initObject = await this.init(youtubeUrl, format)
        const result = await this.cekStatus(initObject)
        return result
    }
}
