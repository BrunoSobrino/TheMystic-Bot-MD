import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

// Cliente axios con soporte para Cloudflare
const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    },
    timeout: 15000,
    maxRedirects: 5
})

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*⚠️ Ejemplo:* ${usedPrefix}${command} One Piece|01`
    
    const args = text.split('|').map(arg => arg.trim())
    const anime = args[0]
    const episode = args[1] || '01'
    const servidor = args[2] || 'auto' // mega, mediafire, etc
    
    await conn.sendMessage(m.chat, { 
        text: `✨ *Buscando:* _${anime} Cap ${episode}_\n🌐 *Extrayendo servidores disponibles...*` 
    }, { quoted: m })

    try {
        let animeData = null

        // Proveedores a intentar
        const providers = [
            () => searchJkanime(anime, episode),
            () => searchAnimeFLV(anime, episode),
            () => searchKatanime(anime, episode),
            () => searchAnimeDBS(anime, episode),
            () => searchAnimeYTX(anime, episode)
        ]

        for (const provider of providers) {
            try {
                animeData = await provider()
                if (animeData && animeData.downloadLinks && Object.keys(animeData.downloadLinks).length > 0) {
                    break
                }
            } catch (e) {
                console.error('Provider error:', e.message)
                continue
            }
        }

        if (!animeData || !animeData.downloadLinks) {
            return m.reply(`❌ *No se hallaron resultados para:* _${anime} Cap ${episode}_`)
        }

        // Mostrar servidores disponibles
        let serversText = `⭐ *SERVIDORES DISPONIBLES* ⭐\n`
        serversText += `═══════════════════\n\n`
        serversText += `*🎬 Título:* ${animeData.title}\n`
        serversText += `*📺 Capítulo:* ${animeData.episode}\n\n`
        serversText += `*📥 Servidores disponibles:*\n`

        let serverIndex = 1
        const servers = Object.keys(animeData.downloadLinks)
        
        servers.forEach(server => {
            serversText += `${serverIndex}️⃣ *${server}*\n`
            serverIndex++
        })

        serversText += `\n_Usa:_ \`${usedPrefix}${command} ${anime}|${episode}|<servidor>\`\n`
        serversText += `_Ejemplo:_ \`${usedPrefix}${command} ${anime}|${episode}|mega\``

        if (animeData.img) {
            await conn.sendMessage(m.chat, { 
                image: { url: animeData.img }, 
                caption: serversText 
            }, { quoted: m })
        } else {
            await m.reply(serversText)
        }

        // Si especificó servidor, descargar
        if (servidor !== 'auto' && animeData.downloadLinks[servidor]) {
            await m.reply(`📥 *Descargando desde ${servidor}...`))
            await downloadAnimeVideo(conn, m.chat, animeData, servidor, m)
        }

    } catch (e) {
        console.error('Error en anime handler:', e)
        m.reply('⚠️ *Error de conexión.* Intenta de nuevo más tarde.')
    }
}

// ================== BÚSQUEDA JKANIME ==================
async function searchJkanime(anime, episode) {
    try {
        const searchUrl = `https://jkanime.net/directorio/?q=${encodeURIComponent(anime)}`
        const { data } = await axiosInstance.get(searchUrl)

        const $ = cheerio.load(data)
        let animeUrl = null
        let img = null

        $('a[href*="/anime/"]').each((i, el) => {
            if (!animeUrl && i < 1) {
                const link = $(el).attr('href')
                const image = $(el).find('img').attr('src') || $(el).find('img').attr('data-src')
                
                if (link) {
                    animeUrl = link.startsWith('http') ? link : `https://jkanime.net${link}`
                    img = image
                }
            }
        })

        if (!animeUrl) return null

        const episodeData = await getJkanimeDownloads(animeUrl, episode)
        if (!episodeData) return null

        return {
            title: episodeData.title,
            episode: episodeData.episodeText || `Capítulo ${episode}`,
            downloadLinks: episodeData.downloadLinks || {},
            img: img || episodeData.img,
            provider: 'Jkanime'
        }

    } catch (e) {
        console.error('Error en searchJkanime:', e.message)
        return null
    }
}

async function getJkanimeDownloads(animeUrl, episode) {
    try {
        const { data } = await axiosInstance.get(animeUrl)
        const $ = cheerio.load(data)
        const title = $('h1').text().trim()
        const episodeNum = episode.padStart(2, '0')
        let episodeUrl = null
        let episodeText = null

        $('a').each((i, el) => {
            const text = $(el).text().toLowerCase().trim()
            const href = $(el).attr('href')
            
            if (href && (text.includes(`cap ${episodeNum}`) || text === episodeNum)) {
                episodeUrl = href.startsWith('http') ? href : `https://jkanime.net${href}`
                episodeText = $(el).text().trim()
                return false
            }
        })

        if (!episodeUrl) return null

        // Obtener página del episodio
        const episodeRes = await axiosInstance.get(episodeUrl)
        const $ep = cheerio.load(episodeRes.data)
        const downloadLinks = {}

        // Buscar links de descarga
        $ep('a').each((i, el) => {
            const href = $ep(el).attr('href')
            const text = $ep(el).text().toLowerCase().trim()
            
            if (href) {
                if (href.includes('mega.nz') || href.includes('mega')) {
                    downloadLinks['Mega'] = href
                }
                else if (href.includes('mediafire')) {
                    downloadLinks['Mediafire'] = href
                }
                else if (href.includes('drive.google') || href.includes('gdrive')) {
                    downloadLinks['Google Drive'] = href
                }
                else if (href.includes('dropbox')) {
                    downloadLinks['Dropbox'] = href
                }
                else if (text.includes('descargar') || text.includes('download')) {
                    // Intentar extraer servidor del texto
                    const server = text.split(' ')[0]
                    if (server && !downloadLinks[server]) {
                        downloadLinks[server] = href
                    }
                }
            }
        })

        return {
            title,
            episodeText,
            downloadLinks,
            episodeUrl
        }

    } catch (e) {
        console.error('Error en getJkanimeDownloads:', e.message)
        return null
    }
}

// ================== BÚSQUEDA ANIME FLV ==================
async function searchAnimeFLV(anime, episode) {
    try {
        const searchUrl = `https://m.animeflv.net/browse?q=${encodeURIComponent(anime)}`
        const { data } = await axiosInstance.get(searchUrl)

        const $ = cheerio.load(data)
        let animeUrl = null
        let img = null

        $('article a').each((i, el) => {
            if (!animeUrl && i < 1) {
                const link = $(el).attr('href')
                const image = $(el).find('img').attr('src') || $(el).find('img').attr('data-src')
                
                if (link) {
                    animeUrl = link.startsWith('http') ? link : `https://m.animeflv.net${link}`
                    img = image
                }
            }
        })

        if (!animeUrl) return null

        const episodeData = await getAnimeFLVDownloads(animeUrl, episode)
        if (!episodeData) return null

        return {
            title: episodeData.title,
            episode: episodeData.episodeText || `Capítulo ${episode}`,
            downloadLinks: episodeData.downloadLinks || {},
            img: img || episodeData.img,
            provider: 'AnimeFLV'
        }

    } catch (e) {
        console.error('Error en searchAnimeFLV:', e.message)
        return null
    }
}

async function getAnimeFLVDownloads(animeUrl, episode) {
    try {
        const { data } = await axiosInstance.get(animeUrl)
        const $ = cheerio.load(data)
        const title = $('h1').text().trim()
        const episodeNum = parseInt(episode)
        let episodeUrl = null
        let episodeText = null

        $('a').each((i, el) => {
            const text = $(el).text().toLowerCase().trim()
            const href = $(el).attr('href')
            
            if (href && (text.includes(episodeNum) || text.includes(`ep-${episodeNum}`))) {
                episodeUrl = href.startsWith('http') ? href : `https://m.animeflv.net${href}`
                episodeText = $(el).text().trim()
                return false
            }
        })

        if (!episodeUrl) return null

        const episodeRes = await axiosInstance.get(episodeUrl)
        const $ep = cheerio.load(episodeRes.data)
        const downloadLinks = {}

        // Buscar en botones de descarga
        $ep('a[class*="btn"], a[class*="download"]').each((i, el) => {
            const href = $ep(el).attr('href')
            const text = $ep(el).text().trim()
            
            if (href && text) {
                downloadLinks[text] = href
            }
        })

        // Buscar links directos
        $ep('a').each((i, el) => {
            const href = $ep(el).attr('href')
            const text = $ep(el).text().toLowerCase()
            
            if (href && (text.includes('mega') || text.includes('mediafire') || text.includes('drive'))) {
                const serverName = text.split(' ')[0].charAt(0).toUpperCase() + text.split(' ')[0].slice(1)
                if (!downloadLinks[serverName]) {
                    downloadLinks[serverName] = href
                }
            }
        })

        return {
            title,
            episodeText,
            downloadLinks,
            episodeUrl
        }

    } catch (e) {
        console.error('Error en getAnimeFLVDownloads:', e.message)
        return null
    }
}

// ================== BÚSQUEDA KATANIME ==================
async function searchKatanime(anime, episode) {
    try {
        const searchUrl = `https://katanime.net/?s=${encodeURIComponent(anime)}`
        const { data } = await axiosInstance.get(searchUrl)

        const $ = cheerio.load(data)
        let animeUrl = null
        let img = null

        $('[class*="anime"] a, .post a').each((i, el) => {
            if (!animeUrl && i < 1) {
                const link = $(el).attr('href')
                const image = $(el).find('img').attr('src')
                
                if (link && link.includes('katanime')) {
                    animeUrl = link
                    img = image
                }
            }
        })

        if (!animeUrl) return null

        const episodeData = await getKatanimeDownloads(animeUrl, episode)
        if (!episodeData) return null

        return {
            title: episodeData.title,
            episode: episodeData.episodeText || `Capítulo ${episode}`,
            downloadLinks: episodeData.downloadLinks || {},
            img: img || episodeData.img,
            provider: 'Katanime'
        }

    } catch (e) {
        console.error('Error en searchKatanime:', e.message)
        return null
    }
}

async function getKatanimeDownloads(animeUrl, episode) {
    try {
        const { data } = await axiosInstance.get(animeUrl)
        const $ = cheerio.load(data)
        const title = $('h1').text().trim()
        const episodeNum = episode.padStart(2, '0')
        let episodeUrl = null
        let episodeText = null

        $('a').each((i, el) => {
            const text = $(el).text().toLowerCase()
            const href = $(el).attr('href')
            
            if (href && (text.includes(`cap ${episodeNum}`) || text.includes(`${episodeNum}`))) {
                episodeUrl = href
                episodeText = $(el).text().trim()
                return false
            }
        })

        if (!episodeUrl) return null

        const episodeRes = await axiosInstance.get(episodeUrl)
        const $ep = cheerio.load(episodeRes.data)
        const downloadLinks = {}

        // Buscar botones de descarga
        $ep('a[class*="btn-descarg"], button').each((i, el) => {
            const href = $ep(el).attr('href') || $ep(el).data('href')
            const text = $ep(el).text().trim()
            
            if (href && text.includes('Descargar')) {
                const serverName = text.replace('Descargar por ', '').trim()
                downloadLinks[serverName] = href
            }
        })

        return {
            title,
            episodeText,
            downloadLinks,
            episodeUrl
        }

    } catch (e) {
        console.error('Error en getKatanimeDownloads:', e.message)
        return null
    }
}

// ================== BÚSQUEDA ANIMEDBS ==================
async function searchAnimeDBS(anime, episode) {
    try {
        const searchUrl = `https://www.animedbs.online/?s=${encodeURIComponent(anime)}`
        const { data } = await axiosInstance.get(searchUrl)

        const $ = cheerio.load(data)
        let animeUrl = null
        let img = null

        $('article a, .post-title a').each((i, el) => {
            if (!animeUrl && i < 1) {
                const link = $(el).attr('href')
                const image = $(el).closest('article').find('img').attr('src')
                
                if (link) {
                    animeUrl = link
                    img = image
                }
            }
        })

        if (!animeUrl) return null

        const episodeData = await getAnimeDBSDownloads(animeUrl, episode)
        if (!episodeData) return null

        return {
            title: episodeData.title,
            episode: episodeData.episodeText || `Capítulo ${episode}`,
            downloadLinks: episodeData.downloadLinks || {},
            img: img || episodeData.img,
            provider: 'AnimeDBS'
        }

    } catch (e) {
        console.error('Error en searchAnimeDBS:', e.message)
        return null
    }
}

async function getAnimeDBSDownloads(animeUrl, episode) {
    try {
        const { data } = await axiosInstance.get(animeUrl)
        const $ = cheerio.load(data)
        const title = $('h1').text().trim()
        const episodeNum = episode.padStart(2, '0')
        let episodeUrl = null
        let episodeText = null

        $('a').each((i, el) => {
            const text = $(el).text().toLowerCase()
            const href = $(el).attr('href')
            
            if (href && text.includes(episodeNum)) {
                episodeUrl = href
                episodeText = $(el).text().trim()
                return false
            }
        })

        if (!episodeUrl) return null

        const episodeRes = await axiosInstance.get(episodeUrl)
        const $ep = cheerio.load(episodeRes.data)
        const downloadLinks = {}

        $ep('a').each((i, el) => {
            const href = $ep(el).attr('href')
            const text = $ep(el).text().trim()
            
            if (href && (text.includes('Mega') || text.includes('Mediafire') || text.includes('Drive'))) {
                downloadLinks[text] = href
            }
        })

        return {
            title,
            episodeText,
            downloadLinks,
            episodeUrl
        }

    } catch (e) {
        console.error('Error en getAnimeDBSDownloads:', e.message)
        return null
    }
}

// ================== BÚSQUEDA ANIMEYTX ==================
async function searchAnimeYTX(anime, episode) {
    try {
        const searchUrl = `https://animeytx.net/?s=${encodeURIComponent(anime)}`
        const { data } = await axiosInstance.get(searchUrl)

        const $ = cheerio.load(data)
        let animeUrl = null
        let img = null

        $('a[href*="animeytx.net"]').each((i, el) => {
            if (!animeUrl && i < 1) {
                const link = $(el).attr('href')
                const image = $(el).find('img').attr('src')
                
                if (link) {
                    animeUrl = link
                    img = image
                }
            }
        })

        if (!animeUrl) return null

        const episodeData = await getAnimeYTXDownloads(animeUrl, episode)
        if (!episodeData) return null

        return {
            title: episodeData.title,
            episode: episodeData.episodeText || `Capítulo ${episode}`,
            downloadLinks: episodeData.downloadLinks || {},
            img: img || episodeData.img,
            provider: 'AnimeYTX'
        }

    } catch (e) {
        console.error('Error en searchAnimeYTX:', e.message)
        return null
    }
}

async function getAnimeYTXDownloads(animeUrl, episode) {
    try {
        const { data } = await axiosInstance.get(animeUrl)
        const $ = cheerio.load(data)
        const title = $('h1').text().trim()
        const episodeNum = episode.padStart(2, '0')
        let episodeUrl = null
        let episodeText = null

        $('a').each((i, el) => {
            const text = $(el).text().toLowerCase()
            const href = $(el).attr('href')
            
            if (href && (text.includes(`cap ${episodeNum}`) || text.includes(episodeNum))) {
                episodeUrl = href
                episodeText = $(el).text().trim()
                return false
            }
        })

        if (!episodeUrl) return null

        const episodeRes = await axiosInstance.get(episodeUrl)
        const $ep = cheerio.load(episodeRes.data)
        const downloadLinks = {}

        // Buscar íconos/logos de servidores
        $ep('a[href*="mega"], a[href*="mediafire"], a[href*="drive"], a[href*="gofile"]').each((i, el) => {
            const href = $ep(el).attr('href')
            const text = $ep(el).text().trim()
            const title = $ep(el).attr('title') || text
            
            if (href) {
                if (href.includes('mega')) downloadLinks['Mega'] = href
                else if (href.includes('mediafire')) downloadLinks['Mediafire'] = href
                else if (href.includes('drive')) downloadLinks['Google Drive'] = href
                else if (href.includes('gofile')) downloadLinks['Gofile'] = href
            }
        })

        return {
            title,
            episodeText,
            downloadLinks,
            episodeUrl
        }

    } catch (e) {
        console.error('Error en getAnimeYTXDownloads:', e.message)
        return null
    }
}

// ================== DESCARGA DE VIDEO ==================
async function downloadAnimeVideo(conn, chatId, animeData, servidor, m) {
    try {
        const downloadLink = animeData.downloadLinks[servidor]
        
        if (!downloadLink) {
            return m.reply(`❌ El servidor ${servidor} no está disponible.\n\nServidores: ${Object.keys(animeData.downloadLinks).join(', ')}`)
        }

        try {
            const response = await axiosInstance.get(downloadLink, {
                responseType: 'stream',
                timeout: 60000,
                maxRedirects: 5
            })

            const contentType = response.headers['content-type'] || ''
            
            if (!contentType.includes('video') && !contentType.includes('mp4') && !downloadLink.includes('mega')) {
                return m.reply(`🔗 *Link de descarga:*\n\n${downloadLink}`)
            }

            const fileName = `${animeData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${animeData.episode}.mp4`
            const tempPath = path.join(process.cwd(), 'temp', fileName)
            const dir = path.dirname(tempPath)

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }

            return new Promise((resolve, reject) => {
                const file = fs.createWriteStream(tempPath)
                response.data.pipe(file)

                file.on('finish', async () => {
                    try {
                        const fileSize = fs.statSync(tempPath).size
                        const sizeMB = (fileSize / (1024 * 1024)).toFixed(2)

                        await conn.sendMessage(chatId, {
                            document: fs.readFileSync(tempPath),
                            mimetype: 'video/mp4',
                            fileName: fileName,
                            caption: `✅ *${animeData.title}*\n📺 ${animeData.episode}\n📦 ${sizeMB} MB\n🌐 ${servidor}`
                        }, { quoted: m })

                        fs.unlinkSync(tempPath)
                        resolve()

                    } catch (err) {
                        console.error('Error enviando:', err)
                        fs.unlink(tempPath, () => {})
                        m.reply('⚠️ Error al enviar el archivo')
                        reject(err)
                    }
                })

                file.on('error', (err) => {
                    fs.unlink(tempPath, () => {})
                    reject(err)
                })
            })

        } catch (err) {
            console.error('Error descargando:', err.message)
            await m.reply(`🔗 *Link encontrado:*\n${downloadLink}`)
        }

    } catch (e) {
        console.error('Error:', e)
        await m.reply('⚠️ Error en la descarga')
    }
}

// ================== CONFIG ==================
handler.command = /^(animedownload|anidl|animedl|animedown)$/i
handler.tags = ['anime', 'descargas']
handler.help = [
    'animedownload <nombre>|<cap>',
    'anidl Oshi no Ko|05|mega'
]

export default handler
