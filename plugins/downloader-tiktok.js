import axios from 'axios';
import cheerio from 'cheerio';
import {generateWAMessageFromContent} from "baileys";

const handler = async (m, {conn, text, args, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.descargas_tiktok

  if (!text) throw `${tradutor.texto1} _${usedPrefix + command} https://vt.tiktok.com/ZSSm2fhLX/_`;
  if (!/(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi.test(text)) throw `${tradutor.texto2} _${usedPrefix + command} https://vt.tiktok.com/ZSSm2fhLX/_`;
  
  const texto = `${tradutor.texto3}`;
  
  try {
    const aa = {quoted: m, userJid: conn.user.jid};
    const prep = generateWAMessageFromContent(m.chat, {extendedTextMessage: {text: texto, contextInfo: {externalAdReply: {title: 'ᴛʜᴇ ᴍʏsᴛɪᴄ - ʙᴏᴛ', body: null, thumbnail: imagen1, sourceUrl: 'https://github.com/BrunoSobrino/TheMystic-Bot-MD'}, mentionedJid: [m.sender]}}}, aa);
    await conn.relayMessage(m.chat, prep.message, {messageId: prep.key.id, mentions: [m.sender]});
    const tTiktok = await tiktokdlF(args[0]);
    const desc1n = `${tradutor.texto4[0]} _${usedPrefix}tomp3_ ${tradutor.texto4[1]}`;
    await conn.sendMessage(m.chat, {video: {url: tTiktok.video}, caption: desc1n}, {quoted: m});
  } catch (ee1) {
    try {
      const links = await fetchDownloadLinks(args[0], 'tiktok', conn, m);
      if (!links) throw new Error('No se pudieron obtener enlaces');
      const download = getDownloadLink('tiktok', links);
      if (!download) throw new Error('No se pudo obtener enlace de descarga');
      const cap = `${tradutor.texto8[0]} _${usedPrefix}tomp3_ ${tradutor.texto8[1]}`;
      await conn.sendMessage(m.chat, {video: {url: download}, caption: cap}, {quoted: m});
    } catch {
      throw `${tradutor.texto9}`;
    }
  }
};
handler.command = /^(tiktok|ttdl|tiktokdl|tiktoknowm|tt|ttnowm|tiktokaudio)$/i;
export default handler;

async function tiktokdlF(url) {
  if (!/tiktok/.test(url)) return {status: false, message: 'URL no válida'};
  try {
    const gettoken = await axios.get('https://tikdown.org/id', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(gettoken.data);
    let token = $('input[name="_token"]').attr('value') || 
                $('#download-form input[type="hidden"]').attr('value') ||
                $('meta[name="csrf-token"]').attr('content');
    if (!token) {
      const scriptContent = gettoken.data;
      const tokenMatch = scriptContent.match(/token['"]\s*:\s*['"]([^'"]+)['"]/i) ||
                         scriptContent.match(/_token['"]\s*:\s*['"]([^'"]+)['"]/i) ||
                         scriptContent.match(/csrf['"]\s*:\s*['"]([^'"]+)['"]/i);
      if (tokenMatch) {
        token = tokenMatch[1];
      }
    }
    if (!token) {
      throw new Error('No se pudo obtener el token CSRF');
    }
    const formData = new URLSearchParams();
    formData.append('url', url);
    formData.append('_token', token);
    const {data} = await axios.post('https://tikdown.org/getAjax', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://tikdown.org/id'
      }
    });
    if (data.status) {
      const getdata = cheerio.load(data.html);
      const videoUrl = getdata('div.download-links a').first().attr('href') ||
                      getdata('.download-btn').first().attr('href') ||
                      getdata('a[download]').first().attr('href');
      const audioUrl = getdata('div.download-links a').eq(1).attr('href') ||
                      getdata('.download-audio').first().attr('href');
      const thumbnail = getdata('img').first().attr('src');
      return {
        status: true,
        video: videoUrl,
        audio: audioUrl,
        thumbnail: thumbnail
      };
    } else {
      throw new Error('El servidor respondió con estado false');
    }
  } catch (error) {
    console.error('Error in tiktokdlF:', error.message);
    return {status: false, error: error.message};
  }
}

async function fetchDownloadLinks(text, platform, conn, m) {
    const { SITE_URL, form } = createApiRequest(text, platform);
    const res = await axios.post(`${SITE_URL}api`, form.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': SITE_URL,
            'Referer': SITE_URL,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
    const html = res?.data?.html;
    if (!html || res?.data?.status !== 'success') {
        return null;
    }
    const $ = cheerio.load(html);
    const links = [];
    $('a.btn[href^="http"]').each((_, el) => {
        const link = $(el).attr('href');
        if (link && !links.includes(link)) {
            links.push(link);
        }
    });
    return links;
}

function createApiRequest(text, platform) {
    const SITE_URL = 'https://instatiktok.com/';
    const form = new URLSearchParams();
    form.append('url', text);
    form.append('platform', platform);
    form.append('siteurl', SITE_URL);
    return { SITE_URL, form };
}

function getDownloadLink(platform, links) {
    if (platform === 'tiktok') {
        return links.find(link => /hdplay/.test(link)) || links[0];
    }
    return null;
}
