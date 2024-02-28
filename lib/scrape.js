import axios from 'axios';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { sizeFormatter } from 'human-readable';
import https from "https";
import qs from "qs";

async function joox(query) {
    return new Promise((resolve, reject) => {
        const time = Math.floor(new Date() / 1000)
        axios.get('http://api.joox.com/web-fcgi-bin//web_search?lang=id&country=id&type=0&search_input=' + query + '&pn=1&sin=0&ein=29&_=' + time)
            .then(({ data }) => {
                let result = []
                let hasil = []
                let promoses = []
                let ids = []
                data.itemlist.forEach(result => {
                    ids.push(result.songid)
                });
                for (let i = 0; i < data.itemlist.length; i++) {
                    const get = 'http://api.joox.com/web-fcgi-bin/web_get_songinfo?songid=' + ids[i]
                    promoses.push(
                        axios.get(get, {
                            headers: {
                                Cookie: 'wmid=142420656; user_type=1; country=id; session_key=2a5d97d05dc8fe238150184eaf3519ad;'
                            }
                        })
                            .then(({ data }) => {
                                const res = JSON.parse(data.replace('MusicInfoCallback(', '').replace('\n)', ''))
                                hasil.push({
                                    lagu: res.msong,
                                    album: res.malbum,
                                    penyanyi: res.msinger,
                                    publish: res.public_time,
                                    img: res.imgSrc,
                                    mp3: res.mp3Url
                                })
                                Promise.all(promoses).then(() => resolve({
                                    creator: "WH MODS DEV",
                                    status: true,
                                    data: hasil,
                                }))
                            }).catch(reject)
                    )
                }
            }).catch(reject)
    })
}

async function fbdown(url) {
    try {
        const postOptions = {
            method: 'POST',
            body: new URLSearchParams({
                URLz: url,
            }),
        };

        const response = await fetch('https://fdown.net/download.php', postOptions);
        const html = await response.text();

        const $ = cheerio.load(html);

        return {
            title: $('.lib-row.lib-header').text().trim(),
            description: $('.lib-row.lib-desc').text().trim(),
            sdLink: $('#sdlink').attr('href'),
            hdLink: $('#hdlink').attr('href'),
        };
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

async function pinterest(text) {
    try {
        const response = await fetch(`https://id.pinterest.com/search/pins/?autologin=true&q=${encodeURIComponent(text)}`, {
            headers: {
                "cookie": "_auth=1; _b=\"AXOtdcLOEbxD+qMFO7SaKFUCRcmtAznLCZY9V3z9tcTqWH7bPo637K4f9xlJCfn3rl4=\"; _pinterest_sess=TWc9PSZWcnpkblM5U1pkNkZ0dzZ6NUc5WDZqZEpGd2pVY3A0Y2VJOGg0a0J0c2JFWVpQalhWeG5iTTRJTmI5R08zZVNhRUZ4SmsvMG1CbjBWUWpLWVFDcWNnNUhYL3NHT1EvN3RBMkFYVUU0T0dIRldqVVBrenVpbGo5Q1lONHRlMzBxQTBjRGFSZnFBcTdDQVgrWVJwM0JtN3VRNEQyeUpsdDYreXpYTktRVjlxb0xNanBodUR1VFN4c2JUek1DajJXbTVuLzNCUDVwMmRlZW5VZVpBeFQ5ZC9oc2RnTGpEMmg4M0Y2N2RJeVo2aGNBYllUYjRnM05VeERzZXVRUVVYNnNyMGpBNUdmQ1dmM2s2M0txUHRuZTBHVFJEMEE1SnIyY2FTTm9DUEVTeWxKb3V0SW13bkV3TldyOUdrdUZaWGpzWmdaT0JlVnhWb29xWTZOTnNVM1NQSzViMkFUTjBpRitRRVMxaUFxMEJqell1bVduTDJid2l3a012RUgxQWhZT1M3STViSVkxV0dSb1p0NTBYcXlqRU5nPT0ma25kRitQYjZJNTVPb2tyVnVxSWlleEdTTkFRPQ==; _ir=0"
            }
        });
        const data = await response.text();
        const $ = cheerio.load(data);
        const result = [];
        const hasil = [];
        $('div > a').get().map(b => {
            const link = $(b).find('img').attr('src');
            result.push(link);
        });
        result.forEach(v => {
            if (v && v.includes('236')) {
                hasil.push(v.replace(/236/g, '736'));
            }
        });
        hasil.shift();
        return hasil;
    } catch (error) {
        throw error;
    }
}



async function trustpositif(url) {
    if (!url) return false
    let agent = new https.Agent({ rejectUnauthorized: false })
    url = Array.isArray(url) ? encodeURIComponent(url.join("\n")) : url
    let { data } = await axios({
        "url": "https://trustpositif.kominfo.go.id/Rest_server/getrecordsname_home",
        "method": "POST",
        "httpsAgent": agent,
        "data": {
            "name": url,
        }
    })
    let result = {}
    for (let i of data.values) {
        result[i.Domain] = i.Status === "Ada"
    }
    return result
}

async function GDriveDl(url) {
    let id, res = { "error": true }
    if (!(url && url.match(/drive\.google/i))) return res

    const formatSize = sizeFormatter({
        std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B`
    })

    try {
        id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1]
        if (!id) throw 'ID Not Found'
        res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
            method: 'post',
            headers: {
                'accept-encoding': 'gzip, deflate, br',
                'content-length': 0,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'origin': 'https://drive.google.com',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
                'x-client-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=',
                'x-drive-first-party': 'DriveWebUi',
                'x-json-requested': 'true'
            }
        })
        let { fileName, sizeBytes, downloadUrl } = JSON.parse((await res.text()).slice(4))
        if (!downloadUrl) throw 'Link Download Limit!'
        let data = await fetch(downloadUrl)
        if (data.status !== 200) return data.statusText
        return { downloadUrl, fileName, fileSize: formatSize(sizeBytes), mimetype: data.headers.get('content-type') }
    } catch (e) {
        console.log(e)
        return res
    }
}

async function lirik(judul) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await axios.get('https://www.musixmatch.com/search/' + judul);
            const $ = cheerio.load(data);
            const hasil = {};
            let limk = 'https://www.musixmatch.com';
            const link = limk + $('div.media-card-body > div > h2').find('a').attr('href');
            const { data: lyricsData } = await axios.get(link);
            const $$ = cheerio.load(lyricsData);
            hasil.lyrics = $$('.lyrics__content__ok').text().trim();
            hasil.link = link;
            resolve(hasil);
        } catch (error) {
            reject(error);
        }
    });
}

async function wallpaper(query) {
    try {
        const { data } = await axios.get('https://www.wallpaperflare.com/search?wallpaper=' + query, {
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "cookie": "_ga=GA1.2.863074474.1624987429; _gid=GA1.2.857771494.1624987429; __gads=ID=84d12a6ae82d0a63-2242b0820eca0058:T=1624987427:RT=1624987427:S=ALNI_MaJYaH0-_xRbokdDkQ0B49vSYgYcQ"
            }
        });
        const $ = cheerio.load(data);
        const result = [];
        $('#gallery > li > figure > a').each(function (a, b) {
            result.push($(b).find('img').attr('data-src'));
        });
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export {
    joox,
    fbdown,
    pinterest,
    trustpositif,
    GDriveDl,
    lirik,
    wallpaper
                                  }
