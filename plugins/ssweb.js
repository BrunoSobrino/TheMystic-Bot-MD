import axios from 'axios'

let handler = async (m, { 
conn, text, command, usedPrefix
}) => {
if (!text) return m.reply(`هذا الامر يخول لك ان تلتقط سكرين شوت لاي موقع فقط اكتب الامر ثم ضع امامه رابطه وشاهد النتيجة سوف اعطيك مثال حتى تفهم\n\n*مثال :* \n${usedPrefix + command} https://www.facebook.com`)
m.reply(wait)
var phone = await ssweb(text, 'phone')
var desktop = await ssweb(text, 'desktop')
var tablet = await ssweb(text, 'tablet')
var res = ``
if (command === 'sshp') {
await conn.sendFile(m.chat, phone.result, '',res, m, false)
}
if (command === 'ssweb' || command === 'sstablet') {
await conn.sendFile(m.chat, tablet.result, '',res, m, false)
}
if (command === 'sspc') {
await conn.sendFile(m.chat, desktop.result, '',res, m, false)
}
}
handler.help = ['ssweb']
handler.tags = ['tools']
handler.command = /^(ssweb)$/i

handler.limit = false

export default handler

async function ssweb(url, device = 'desktop'){
     return new Promise((resolve, reject) => {
          const base = 'https://www.screenshotmachine.com'
          const param = {
            url: url,
            device: device,
            cacheLimit: 0
          }
          axios({url: base + '/capture.php',
               method: 'POST',
               data: new URLSearchParams(Object.entries(param)),
               headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
               }
          }).then((data) => {
               const cookies = data.headers['set-cookie']
               if (data.data.status == 'success') {
                    axios.get(base + '/' + data.data.link, {
                         headers: {
                              'cookie': cookies.join('')
                         },
                         responseType: 'arraybuffer'
                    }).then(({ data }) => {
                       let result = {
                            status: 200,
                            author: '♥',
                            result: data
                        }
                         resolve(result)
                    })
               } else {
                    reject({ status: 404, author: '♥', message: data.data })
               }
          }).catch(reject)
     })
}
