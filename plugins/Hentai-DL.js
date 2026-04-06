import axios from 'axios'
import * as cheerio from 'cheerio'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*─── [ ⚠️ EJEMPLO ] ───*\n\n*${usedPrefix}${command}* joshi luck`
    
    const domain = 'https://latinohentai.vip'
    const baseUrl = `${domain}/?s=${encodeURIComponent(text)}`

    // Mensaje de espera con estilo
    await conn.sendMessage(m.chat, { 
        text: `⏳ *Buscando contenido...*\n\n╭━━━━━━〔 🔞 〕━━━━━━\n┃ 🔍 *Buscando:* _${text}_\n┃ 🌐 *Fuente:* _LatinoHentai_\n╰━━━━━━━━━━━━━━━━━━` 
    }, { quoted: m })

    try {
        const { data } = await axios.get(baseUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Referer': domain
            }
        })
        
        const $ = cheerio.load(data)
        let result = null 

        $('article, .post, .item, .video-block').each((i, el) => {
            if (!result) { 
                let title = $(el).find('h2, h3, h1, .title').text().trim()
                let link = $(el).find('a').attr('href')
                let img = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || $(el).find('img').attr('data-lazy-src')
                
                if (title && link) {
                    if (!link.startsWith('http')) link = domain + (link.startsWith('/') ? '' : '/') + link
                    if (img && !img.startsWith('http')) {
                        if (img.startsWith('//')) img = 'https:' + img
                        else img = domain + (img.startsWith('/') ? '' : '/') + img
                    }
                    result = { title, link, img } 
                }
            }
        })

        if (!result) return m.reply(`*─── [ ❌ SIN RESULTADOS ] ───*\n\nNo se hallaron coincidencias para: *${text}*`)

        // --- DISEÑO CORREGIDO (FORMATO WHATSAPP) ---
        let caption = `✨ *R E S U L T A D O* ✨\n\n`
        caption += `> *🎬 TÍTULO:* \n`
        caption += `> *${result.title}*\n\n`
        caption += `╔════════════════════╗\n`
        caption += `┃  🔞 *CATEGORÍA:* Hentai\n`
        caption += `┃  🔗 *ENLACE:* ${result.link}\n`
        caption += `╚════════════════════╝\n\n`
        caption += `────────────────────\n`
        caption += `*💡 Toca el enlace para ver el contenido.*`

        if (result.img) {
            await conn.sendMessage(m.chat, { 
                image: { url: result.img }, 
                caption: caption.trim() 
            }, { quoted: m })
        } else {
            await m.reply(caption.trim())
        }

    } catch (e) {
        let errCode = e.response ? e.response.status : e.message
        console.error("❌ Error en LatinoHentai:", errCode)
        m.reply(`*─── [ ⚠️ ERROR ] ───*\n\nEl servidor no respondió correctamente.\n*Status:* ${errCode}`)
    }
}

handler.command = /^(hentaidl)$/i
handler.tags = ['hentai']
handler.help = ['hentaidl']

export default handler

