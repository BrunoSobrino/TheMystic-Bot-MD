import fetch from 'node-fetch';
import axios from 'axios';
import cheerio from 'cheerio';
import vm from 'node:vm';
import qs from 'qs';
const handler = async (m, {conn, text, usedPrefix, command}) => {
if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝚄𝙽 𝙴𝙽𝙻𝙰𝙲𝙴 𝙳𝙴 𝚇 (𝚃𝚆𝙸𝚃𝚃𝙴𝚁), 𝙴𝙹𝙴𝙼𝙿𝙻𝙾: ${usedPrefix + command}* https://twitter.com/auronplay/status/1586487664274206720?s=20&t=3snvkvwGUIez5iWYQAehpw`;
 try {
   const resFG = await twitter(text);
   await m.reply(global.wait);
     const captionFG = '*𝙰𝚀𝚄𝙸 𝙴𝚂𝚃𝙰 𝚂𝚄 𝚅𝙸𝙳𝙴𝙾*';
     await conn.sendFile(m.chat, resFG[0].url, 'error.mp4', captionFG, m);
 } catch {    
 console.log('error')    
 try {
   const res = await twitterDl(text);
   await m.reply(global.wait);
   for (let x = 0; x < res.media.length; x++) {
     const caption = x === 0 ? res.caption.replace(/https:\/\/t.co\/[a-zA-Z0-9]+/gi, '').trim() : '*𝙰𝚀𝚄𝙸 𝙴𝚂𝚃𝙰 𝚂𝚄 𝚅𝙸𝙳𝙴𝙾*';
     await conn.sendFile(m.chat, res.media[x].url, 'error.mp4', caption, m);
   }
 } catch {
   try {
     const AA = await savefrom(text);
     await conn.sendFile(m.chat, AA.url[0].url, 'error.mp4', '*𝙰𝚀𝚄𝙸 𝙴𝚂𝚃𝙰 𝚂𝚄 𝚅𝙸𝙳𝙴𝙾*', m);
   } catch {
     throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚁𝚁𝙾𝚁, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝚁𝙻𝙾*';
   }
  }
 }
};    
handler.command = /^((x|xdl|dlx|twdl|tw|twt|twitter)(dl)?)$/i;
export default handler;

async function twitterDl(url) {
  const id = /twitter\.com\/[^/]+\/status\/(\d+)/.exec(url)?.[1];
  const res = await fetch(`https://tweetpik.com/api/tweets/${id}`);
  if (res.status !== 200) throw res.statusText;
  const json = await res.json();
  if (json.media) {
    const media = [];
    for (const i of json.media) {
      if (/video|animated_gif/.test(i.type)) {
        let vid = await (await fetch(`https://tweetpik.com/api/tweets/${id}/video`)).json();
        vid = vid.variants.pop();
        media.push({url: vid.url, type: i.type});
      } else {
        media.push({url: i.url, type: i.type});
      }
    }
    return {
      caption: json.text, media,
    };
  }
}
async function savefrom(urlL) {
  const body = new URLSearchParams({'sf_url': encodeURI(urlL), 'sf_submit': '', 'new': 2, 'lang': 'id', 'app': '', 'country': 'id', 'os': 'Windows', 'browser': 'Chrome', 'channel': ' main', 'sf-nomad': 1});
  let {data} = await axios({'url': 'https://worker.sf-tools.com/savefrom.php', 'method': 'POST', 'data': body, 'headers': {'content-type': 'application/x-www-form-urlencoded', 'origin': 'https://id.savefrom.net', 'referer': 'https://id.savefrom.net/', 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36'}});
  const exec = '[]["filter"]["constructor"](b).call(a);';
  data = data.replace(exec, `\ntry {\ni++;\nif (i === 2) scriptResult = ${exec.split('.call')[0]}.toString();\nelse (\n${exec.replace(/;/, '')}\n);\n} catch {}`);
  const context = {'scriptResult': '', 'i': 0};
  vm.createContext(context);
  new vm.Script(data).runInContext(context);
  return JSON.parse(context.scriptResult.split('window.parent.sf.videoResult.show(')?.[1].split(');')?.[0]);
}
async function twitter(url) {
	let payload = { url, submit: '' }
	let res = await fetch('https://www.expertsphp.com/instagram-reels-downloader.php', {
		method: 'POST',
		body: new URLSearchParams(Object.entries(payload)),
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			cookie: '_ga=GA1.2.783835709.1637038175; __gads=ID=5b4991618655cd86-22e2c7aeadce00ae:T=1637038176:RT=1637038176:S=ALNI_MaCe3McPrVVswzBEqcQlgnVZXtZ1g; _gid=GA1.2.1817576486.1639614645; _gat_gtag_UA_120752274_1=1',
			origin: 'https://www.expertsphp.com',
			referer: 'https://www.expertsphp.com/twitter-video-downloader.html',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
		}})
	let $ = cheerio.load(await res.text())
	let results = []
	$('table.table > tbody > tr').each(function () {
		let quality = $(this).find('td').eq(2).find('strong').text()
		let type = $(this).find('td').eq(1).find('strong').text()
		let url = $(this).find('td').eq(0).find('a[href]').attr('href')
		let isVideo = /video/i.test(type)
		results.push({ quality, type, url, isVideo })
	})
	return results
}
