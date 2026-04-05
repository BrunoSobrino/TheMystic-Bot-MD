import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*⚠️ Ejemplo:* ${usedPrefix}${command} One Piece|01`
    
    const args = text.split('|').map(arg => arg.trim())
    const anime = args[0]
    const episode = args[1] || '01'
    
    await conn.sendMessage(m.chat, { 
        text: `✨ *Buscando:* _${anime} Cap ${episode}_\n🌐 *Fuente:* _Jkanime/Monoschinos_...` 
    }, { quoted: m })

    try {
        let animeData = null

        // Intentar con Jkanime primero
        animeData = await searchJkanime(anime, episode)
        
        if (!animeData) {
            // Si falla, intentar con Monoschinos
            animeData = await searchMonoschinos(anime, episode)
        }

        if (!animeData) {
            // Si falla, intentar con GoGoAnime
            animeData = await searchGogoAnime(anime, episode)
        }
        
        if (!animeData || !animeData.downloadLink) {
            return m.reply(`❌ *No se hallaron resultados para:* _${anime} Cap ${episode}_\n\n💡 *Intenta:*\n• Verificar el nombre del anime\n• Usar el nombre en inglés\n• Revisar si el capítulo existe`)
        }

        // Mostrar información del anime antes de descargar
        let infoCaption = `⭐ *ANIME ENCONTRADO* ⭐\n`
        infoCaption += `═══════════════════\n\n`
        infoCaption += `*🎬 Título:* ${animeData.title}\n`
        infoCaption += `*📺 Capítulo:* ${animeData.episode || episode}\n`
        infoCaption += `*🌐 Proveedor:* ${animeData.provider}\n\n`
        infoCaption += `📥 *Descargando...*`

        if (animeData.img) {
            await conn.sendMessage(m.chat, { 
                image: { url: animeData.img }, 
                caption: infoCaption 
            }, { quoted: m })
        } else {
            await m.reply(infoCaption)
        }

        // Descargar el video
        await downloadAnimeVideo(conn, m.chat, animeData, m)

    } catch (e) {
        console.error('Error en anime handler:', e)
        m.reply('⚠️ *Error de conexión.* Intenta de nuevo más tarde.')
    }
}

// ================== BÚSQUEDA JKANIME ==================
async function searchJkanime(anime, episode) {
    try {
        const searchUrl = `https://jkanime.net/directorio/?q=${encodeURIComponent(anime)}`
        const { data } = await axios.get(searchUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            },
            timeout: 15000
        })

        const $ = cheerio.load(data)
        let animeUrl = null
        let img = null

        // Buscar el primer resultado
        $('.container-capitulos a, .anime-link, [class*="anime"]').each((i, el) => {
            if (!animeUrl && i < 1) {
                const link = $(el).attr('href')
                const image = $(el).find('img').attr('src') || $(el).find('img').attr('data-src')
                
                if (link && (link.includes('jkanime.net') || link.startsWith('/'))) {
                    animeUrl = link.startsWith('http') ? link : `https://jkanime.net${link}`
                    img = image
                }
            }
        })

        if (!animeUrl) return null

        return await getJkanimeEpisodeLink(animeUrl, episode, img)

    } catch (e) {
        console.error('Error en searchJkanime:', e.message)
        return null
    }
}

async function getJkanimeEpisodeLink(animeUrl, episode, img) {
    try {
        const { data } = await axios.get(animeUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        })

        const $ = cheerio.load(data)
        const title = $('h1').text().trim() || $('title').text().split('|')[0].trim()
        
        let downloadLink = null
        let episodeText = null

        // Buscar el capítulo en los links
        $('a').each((i, el) => {
            const text = $(el).text().toLowerCase().trim()
            const href = $(el).attr('href')
            
            const episodeNum = episode.padStart(2, '0')
            const patterns = [
                `capitulo ${episodeNum}`,
                `cap ${episodeNum}`,
                `episodio ${episodeNum}`,
                `episode ${episodeNum}`,
                `ep ${episodeNum}`,
                `${episodeNum}`
            ]
            
            if (href && patterns.some(p => text.includes(p))) {
                const fullUrl = href.startsWith('http') ? href : `https://jkanime.net${href}`
                downloadLink = fullUrl
                episodeText = $(el).text().trim()
                return false
            }
        })

        if (downloadLink) {
            // Obtener link de descarga real
            const episodeData = await getJkanimeDownloadLink(downloadLink)
            if (episodeData.downloadUrl) {
                downloadLink = episodeData.downloadUrl
            }
        }

        return {
            title: title || 'Anime',
            episode: episodeText || `Capítulo ${episode}`,
            downloadLink,
            img,
            provider: 'Jkanime',
            duration: 'No disponible'
        }

    } catch (e) {
        console.error('Error en getJkanimeEpisodeLink:', e.message)
        return null
    }
}

async function getJkanimeDownloadLink(episodeUrl) {
    try {
        const { data } = await axios.get(episodeUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        })

        const $ = cheerio.load(data)
        let downloadUrl = null

        // Buscar links de descarga
        $('a').each((i, el) => {
            const href = $(el).attr('href')
            const text = $(el).text().toLowerCase()
            
            if (href && (
                href.includes('mediafire') || 
                href.includes('mega.nz') || 
                href.includes('drive.google') ||
                href.includes('dropbox') ||
                text.includes('descargar') ||
                text.includes('download')
            )) {
                downloadUrl = href
                return false
            }
        })

        return { downloadUrl }

    } catch (e) {
        console.error('Error en getJkanimeDownloadLink:', e.message)
        return { downloadUrl: null }
    }
}

// ================== BÚSQUEDA MONOSCHINOS ==================
async function searchMonoschinos(anime, episode) {
    try {
        const searchUrl = `https://monoschinos2.com/search?q=${encodeURIComponent(anime)}`
        const { data } = await axios.get(searchUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        })

        const $ = cheerio.load(data)
        let animeUrl = null
        let img = null

        $('[class*="item"], .anime-item, a[href*="/anime/"]').each((i, el) => {
            if (!animeUrl && i < 1) {
                const link = $(el).find('a').attr('href') || $(el).attr('href')
                const image = $(el).find('img').attr('src') || $(el).find('img').attr('data-src')
                
                if (link && link.includes('monoschinos')) {
                    animeUrl = link.startsWith('http') ? link : `https://monoschinos2.com${link}`
                    img = image
                }
            }
        })

        if (!animeUrl) return null

        return await getMonoschinosEpisodeLink(animeUrl, episode, img)

    } catch (e) {
        console.error('Error en searchMonoschinos:', e.message)
        return null
    }
}

async function getMonoschinosEpisodeLink(animeUrl, episode, img) {
    try {
        const { data } = await axios.get(animeUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        })

        const $ = cheerio.load(data)
        const title = $('h1').text().trim() || $('[class*="title"]').text().trim()
        
        let downloadLink = null
        let episodeText = null

        // Buscar capítulo
        $('a').each((i, el) => {
            const text = $(el).text().toLowerCase().trim()
            const href = $(el).attr('href')
            
            const episodeNum = episode.padStart(2, '0')
            if (href && (text.includes(`ep ${episodeNum}`) || text.includes(`capitulo ${episodeNum}`) || text.includes(episodeNum))) {
                downloadLink = href.startsWith('http') ? href : `https://monoschinos2.com${href}`
                episodeText = $(el).text().trim()
                return false
            }
        })

        return {
            title: title || 'Anime',
            episode: episodeText || `Capítulo ${episode}`,
            downloadLink,
            img,
            provider: 'Monoschinos',
            duration: 'No disponible'
        }

    } catch (e) {
        console.error('Error en getMonoschinosEpisodeLink:', e.message)
        return null
    }
}

// ================== BÚSQUEDA GOGOANIME ==================
async function searchGogoAnime(anime, episode) {
    try {
        const searchUrl = `https://gogoanime.gg/?s=${encodeURIComponent(anime)}`
        const { data } = await axios.get(searchUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        })

        const $ = cheerio.load(data)
        let animeUrl = null
        let img = null

        $('.last-episodes a, .items a').each((i, el) => {
            if (!animeUrl && i < 1) {
                const link = $(el).attr('href')
                const image = $(el).find('img').attr('src') || $(el).find('img').attr('data-src')
                
                if (link && link.includes('gogoanime')) {
                    animeUrl = link
                    img = image
                }
            }
        })

        if (!animeUrl) return null

        return await getGogoAnimeEpisodeLink(animeUrl, episode, img)

    } catch (e) {
        console.error('Error en searchGogoAnime:', e.message)
        return null
    }
}

async function getGogoAnimeEpisodeLink(animeUrl, episode, img) {
    try {
        const { data } = await axios.get(animeUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        })

        const $ = cheerio.load(data)
        const title = $('h2').text().trim() || $('title').text().split('-')[0].trim()
        
        let downloadLink = null
        let episodeText = null

        const episodeNum = episode.padStart(2, '0')
        $('a').each((i, el) => {
            const text = $(el).text().toLowerCase().trim()
            const href = $(el).attr('href')
            
            if (href && (text.includes(`episode ${episodeNum}`) || text.includes(`ep ${episodeNum}`))) {
                downloadLink = href.startsWith('http') ? href : `https://gogoanime.gg${href}`
                episodeText = $(el).text().trim()
                return false
            }
        })

        return {
            title: title || 'Anime',
            episode: episodeText || `Capítulo ${episode}`,
            downloadLink,
            img,
            provider: 'GoGoAnime',
            duration: 'No disponible'
        }

    } catch (e) {
        console.error('Error en getGogoAnimeEpisodeLink:', e.message)
        return null
    }
}

// ================== DESCARGA DE VIDEO ==================
async function downloadAnimeVideo(conn, chatId, animeData, m) {
    try {
        if (!animeData.downloadLink) {
            return m.reply('❌ No se encontró enlace de descarga disponible')
        }

        const link = animeData.downloadLink.toLowerCase()
        const fileName = `${animeData.title.replace(/[^a-zA-Z0-9]/g, '_')}_Cap_${animeData.episode}.mp4`

        try {
            const response = await axios.get(animeData.downloadLink, {
                responseType: 'stream',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://jkanime.net/'
                }
            })

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
                            caption: `✅ *${animeData.title}*\n📺 Capítulo: ${animeData.episode}\n📦 Tamaño: ${sizeMB} MB\n🌐 Proveedor: ${animeData.provider}`
                        }, { quoted: m })

                        fs.unlinkSync(tempPath)
                        resolve()

                    } catch (err) {
                        console.error('Error enviando archivo:', err)
                        fs.unlink(tempPath, () => {})
                        reject(err)
                    }
                })

                file.on('error', (err) => {
                    fs.unlink(tempPath, () => {})
                    reject(err)
                })

                response.data.on('error', reject)
            })

        } catch (err) {
            console.error('Error descargando:', err)
            await m.reply(`🔗 *Enlace de descarga encontrado:*\n\n${animeData.downloadLink}\n\n_Intenta descargar manualmente desde el navegador_`)
        }

    } catch (e) {
        console.error('Error en downloadAnimeVideo:', e)
        await m.reply('⚠️ *Error descargando el anime.* Intenta de nuevo más tarde.')
    }
}

// ================== CONFIGURACIÓN DEL HANDLER ==================
handler.command = /^(animedownload|anidl|animedl)$/i
handler.tags = ['anime', 'descargas']
handler.help = [
    'animedownload <nombre>|<cap>',
    'anidl One Piece|01',
    'animedl Oshi no Ko|05'
]

export default handler
            
