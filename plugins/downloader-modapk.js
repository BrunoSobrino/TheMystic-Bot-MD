let handler  = async (m, { conn, usedPrefix: prefix, command, text }) => {
try {
switch(command) {
case 'modapk': case 'apkmod':
if (!text) throw `*[❗] 𝙸𝙽𝙶𝚁𝙴𝙴𝚂𝙴 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝙻𝙰 𝙰𝙿𝙺 𝚀𝚄𝙴 𝚀𝚄𝙸𝙴𝚁𝙰 𝙱𝚄𝚂𝙲𝙰𝚁*`        
//const data2 = await fetchJson('https://api.akuari.my.id/search/searchmod2?query=' + text)
const daaaaa = await searchApk(text)
//const daaaaa2 = await getApk(daaaaa.result)

const data2 = await fetchJson('https://api.akuari.my.id/search/searchmod?query=' + text)
global.fetchJson = fetchJson
const data = data2.respon
if (data.length < 1) return await  conn.sendMessage(m.chat, { text: '*[❗] 𝙽𝙾 𝙵𝚄𝙴 𝙿𝙾𝚂𝙸𝙱𝙻𝙴 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝚁 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 𝙳𝙴 𝙻𝙰 𝙰𝙿𝙺*' }, { quoted: m } )
var srh = [];  
for (var i = 0; i < data.length; i++) {
srh.push({ title: data[i].title, description: '', rowId: prefix + 'dapk2 ' + data[i].link });}
const sections = [{title: '𝚂𝙴𝙻𝙴𝙲𝙲𝙸𝙾𝙽𝙰 𝙴𝙻 𝙼𝙾𝙳 𝙰 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝚁', rows: srh}]
const listMessage = {text: `┌───[ᴍᴏᴅᴀᴘᴋ ʙʏ ᴍʏsᴛɪᴄʙᴏᴛ]\n│\n│- 📟 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 𝙳𝙴: ${text}\n│\n└─────────────────◉`, footer: wm, title: null, buttonText: "𝐒𝐄𝐋𝐄𝐂𝐂𝐈𝐎𝐍𝐀 𝐀𝐐𝐔𝐈", sections}
await conn.sendMessage(m.chat, listMessage, { quoted: m })
break
case 'dapk2': 
if (!text) throw `*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙻𝙸𝙽𝙺 𝙳𝙴 𝙰𝙻𝙶𝚄𝙽𝙰 𝙰𝙿𝙺, 𝙴𝙹𝙴𝙼𝙿𝙻𝙾: ${prefix + command}* https://rexdl.com/android/minecraft-pocket-edition-apk-download1.html/`     
await conn.reply(m.chat, global.wait, m)
//let data5 = await fetchJson('https://api.akuari.my.id/downloader/dlmod?link=' + text)
let data5 = await fetchJson('https://api.akuari.my.id/downloader/dlmod?link=' + text)    
if ( data5.respon.size.replace(' MB' , '') > 200) return await conn.sendMessage(m.chat, { text: '*[ ⛔ ] ᴇʟ ᴀʀᴄʜɪᴠᴏ ᴇs ᴅᴇᴍᴀsɪᴀᴅᴏ ᴘᴇsᴀᴅᴏ*' }, { quoted: m } )
if ( data5.respon.size.includes('GB')) return await conn.sendMessage(m.chat, { text: '*[ ⛔ ] ᴇʟ ᴀʀᴄʜɪᴠᴏ ᴇs ᴅᴇᴍᴀsɪᴀᴅᴏ ᴘᴇsᴀᴅᴏ*' }, { quoted: m } )
const apk5 = await conn.sendMessage(m.chat, { document: { url: data5.respon.linkdl /*respon.download[0].url*/ }, mimetype: 'application/vnd.android.package-archive', fileName: 'APK' + '.apk', caption: null }, { quoted: m })   
break        
}
} catch {
throw `*[❗] 𝙽𝙾 𝚂𝙴 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙾 𝙽𝙸𝙽𝙶𝚄𝙽 𝙼𝙾𝙳 𝙰𝙿𝙺 𝙲𝙾𝙽 𝙴𝚂𝙴 𝙽𝙾𝙼𝙱𝚁𝙴 𝙾 𝙻𝙰 𝙰𝙿𝙸 (𝙿𝙰𝙶𝙸𝙽𝙰) 𝙴𝚂𝚃𝙰 𝙲𝙰𝙸𝙳𝙰*`
}}    
handler.command = /^(apkmod|modapk|dapk2)$/i
export default handler
async function fetchJson(url, options) {
try {
options ? options : {}
const res = await axios({ method: 'GET', url: url, headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'}, ...options })
return res.data
} catch (err) {
return err
}}

async function getApk(url) {
     return new Promise((resolve, reject) => {
          if (!/rexdlfile.com/g.test(url)) return resolve({ status: false, message: 'URL Yang Kamu Masukkan Tidak Valid' })
          axios.get(url)
               .then(({ data }) => {
                    const $ = cheerio.load(data)
                    const updated = $('li.dl-update > span:nth-child(2)').text()
                    const size = $('li.dl-size > span:nth-child(2)').text()
                    const version = $('li.dl-version > span:nth-child(2)').text()
                    let name = []
                    let url_download = []
                    let link_download = []
                    let promiss = []
                    $('li.download > span').get().map((rest) => {
                         name.push($(rest).text())
                    })
                    $('div#dlbox > ul.dl > a').get().map((rest) => {
                         url_download.push($(rest).attr('href'))
                    })
                    let download = []
                    for (let i = 0; i < name.length; i++) {
                         download.push({
                              name: name[i],
                              url_download: url_download[i]
                         })
                    }
                    for (let i = 0; i < url_download.length; i++) {
                         promiss.push(
                            link_download.push({ 
                                title: name[i],
                                url: url_download[i]
                            })
                         )
                    }
                    Promise.all(promiss).then(() => {
                         resolve({
                              title: url.split('=')[1].replace(/-/gi, ' '),
                              version: version,
                              size: size,
                              updated: updated,
                              download: link_download
})})}).catch(reject)})}

async function searchApk(apkname) {
     return new Promise((resolve, reject) => {
          axios.get(`https://rexdl.com/?s=${apkname}`)
               .then(({ data }) => {
                    const $ = cheerio.load(data)
                    let name = []
                    let url = []
                    let url_download = []
                    let thumb = []
                    let desc = []
                    $('h2.post-title > a').get().map((rest) => {
                         name.push($(rest).text())
                    })
                    $('div > div.post-thumbnail > a').get().map((rest) => {
                         url.push($(rest).attr('href'))
                    })
                    $('div > div.post-thumbnail > a').get().map((rest) => {
                         url_download.push('https://rexdlfile.com/index.php?id=' + $(rest).attr('href').split('/')[4].replace('.html', ''))
                    })
                    $('div > div.post-thumbnail > a > img').get().map((rest) => {
                         thumb.push($(rest).attr('data-src'))
                    })
                    $('div.entry.excerpt > p').get().map((rest) => {
                         desc.push($(rest).text())
                    })
                    let result = []
                    for (let i = 0; i < name.length; i++) {
                         result.push({
                              title: name[i],
                              thumb: thumb[i],
                              url: url[i],
                              url_download: url_download[i],
                              desc: desc[i]
})}
resolve({
result: result
})}).catch(reject)})}
