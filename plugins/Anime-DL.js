import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*⚠️ Ejemplo:* ${usedPrefix}${command} One Piece|01|sub`
    
    const args = text.split('|').map(arg => arg.trim())
    const anime = args[0]
    const episode = args[1] || '01'
    const type = args[2]?.toLowerCase() || 'sub' // sub o lat
    
    let isLat = type.includes('lat') || command.toLowerCase().includes('lat')
    let providerName = isLat ? 'AnimeDBS (Latino)' : 'TioAnime (Sub)'
    
    await conn.sendMessage(m.chat, { 
        text: `✨ *Buscando:* _${anime} Cap ${episode}_\n🌐 *Fuente:* _${providerName}_...` 
    }, { quoted: m })

    try {
        let animeData
        
        if (isLat) {
            animeData = await searchAnimeDBS(anime, episode)
        } else {
            animeData = await searchTioAnime(anime, episode)
        }
        
        if (!animeData || !animeData.downloadLink) {
            return m.reply(`❌ *No se hallaron resultados para:* _${anime} Cap ${episode}_`)
        }

        // Mostrar información del anime antes de descargar
        let infoCaption = `⭐ *ANIME ENCONTRADO* ⭐\n`
        infoCaption += `═══════════════════\n\n`
        infoCaption += `*🎬 Título:* ${animeData.title}\n`
        infoCaption += `*📺 Capítulo:* ${animeData.episode || episode}\n`
        infoCaption += `*🌐 Proveedor:* ${providerName}\n`
        infoCaption += `*⏱️ Duración:* ${animeData.duration || 'No disponible'}\n\n`
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

// ================== BÚSQUEDA ANIMEDBS ==================
async function searchAnimeDBS(anime, episode) {
    try {
        const searchUrl = `https://www.animedbs.online/?s=${encodeURIComponent(anime)}`
        const { data } = await axios.get(searchUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        })

        const $ = cheerio.load(data)
        let animeUrl = null

        // Buscar el primer resultado
        $('article').each((i, el) => {
            if (!animeUrl && i < 1) {
                animeUrl = $(el).find('h2.entry-title a, .title a').attr('href')
            }
        })

        if (!animeUrl) return null

        // Obtener detalles del anime
        return await getAnimeDBSEpisodeLink(animeUrl, episode)

    } catch (e) {
        console.error('Error en searchAnimeDBS:', e)
        return null
    }
}

async function getAnimeDCSEpisodeLink(animeUrl, episode) {
    try {
        const { data } = await axios.get(animeUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })

        const $ = cheerio.load(data)
        const title = $('h1.entry-title').text().trim()
        const img = $('img.attachment-post-thumbnail').attr('src')
        
        // Buscar el capítulo especificado
        let downloadLink = null
        let episodeText = null

        $('a').each((i, el) => {
            const text = $(el).text().toLowerCase()
            const href = $(el).attr('href')
            
            // Buscar por número de capítulo
            if (text.includes(`capitulo ${episode}`) || text.includes(`cap ${episode}`) || text.includes(`ep ${episode}`)) {
                downloadLink = href
                episodeText = $(el).text().trim()
                return false
            }
        })

        return {
            title: title || 'Anime',
            episode: episodeText || `Capítulo ${episode}`,
            downloadLink,
            img,
            duration: 'No disponible'
        }

    } catch (e) {
        console.error('Error en getAnimeDCSEpisodeLink:', e)
        return null
    }
}

// ================== BÚSQUEDA TIOANIME ==================
async function searchTioAnime(anime, episode) {
    try {
        const searchUrl = `https://tioanime.com/directorio?q=${encodeURIComponent(anime)}`
        const { data } = await axios.get(searchUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        })

        const $ = cheerio.load(data)
        let animeUrl = null
        let img = null

        // Buscar el primer resultado
        $('.anime').each((i, el) => {
            if (!animeUrl && i < 1) {
                let link = $(el).find('a').attr('href')
                img = $(el).find('img').attr('src')
                
                if (link && !link.startsWith('http')) link = 'https://tioanime.com' + link
                if (img && !img.startsWith('http')) img = 'https://tioanime.com' + img
                
                animeUrl = link
            }
        })

        if (!animeUrl) return null

        // Obtener detalles del anime
        return await getTioAnimeEpisodeLink(animeUrl, episode, img)

    } catch (e) {
        console.error('Error en searchTioAnime:', e)
        return null
    }
}

async function getTioAnimeEpisodeLink(animeUrl, episode, img) {
    try {
        const { data } = await axios.get(animeUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })

        const $ = cheerio.load(data)
        const title = $('h1').text().trim() || $('title').text().trim()
        
        let downloadLink = null
        let episodeText = null

        // Buscar links de descargas
        $('a').each((i, el) => {
            const text = $(el).text().toLowerCase().trim()
            const href = $(el).attr('href')
            
            // Patrones de búsqueda
            const patterns = [
                `capitulo ${episode}`,
                `cap ${episode}`,
                `episode ${episode}`,
                `ep ${episode}`,
                `${episode.padStart(2, '0')}`
            ]
            
            if (patterns.some(p => text.includes(p)) && href && (href.includes('mega') || href.includes('mediafire') || href.includes('drive'))) {
                downloadLink = href
                episodeText = $(el).text().trim()
                return false
            }
        })

        return {
            title: title || 'Anime',
            episode: episodeText || `Capítulo ${episode}`,
            downloadLink,
            img,
            duration: 'No disponible'
        }

    } catch (e) {
        console.error('Error en getTioAnimeEpisodeLink:', e)
        return null
    }
}

// ================== DESCARGA DE VIDEO ==================
async function downloadAnimeVideo(conn, chatId, animeData, m) {
    try {
        if (!animeData.downloadLink) {
            return m.reply('❌ No se encontró enlace de descarga disponible')
        }

        // Detectar tipo de proveedor
        const link = animeData.downloadLink.toLowerCase()
        const fileName = `${animeData.title.replace(/[^a-zA-Z0-9]/g, '_')}_Cap_${animeData.episode}.mp4`

        let downloadUrl = animeData.downloadLink

        // Si es un enlace de descarga directo
        if (link.includes('mega') || link.includes('mediafire') || link.includes('drive')) {
            // Intentar descargar desde el enlace
            try {
                const response = await axios.get(downloadUrl, {
                    responseType: 'stream',
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
                                caption: `✅ *${animeData.title}*\n📺 Capítulo: ${animeData.episode}\n📦 Tamaño: ${sizeMB} MB`
                            }, { quoted: m })

                            // Limpiar archivo temporal
                            fs.unlinkSync(tempPath)
                            resolve()

                        } catch (err) {
                            console.error('Error enviando archivo:', err)
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
                await m.reply(`⚠️ Error descargando de ${new URL(downloadUrl).hostname}\n\n🔗 *Enlace directo:*\n${downloadUrl}\n\nIntenta descargar desde el navegador.`)
            }
        } else {
            // Si no es un enlace directo, proporcionar el link
            await m.reply(`🔗 *Enlace de descarga encontrado:*\n\n${downloadUrl}\n\n_El archivo se descargará desde el navegador_`)
        }

    } catch (e) {
        console.error('Error en downloadAnimeVideo:', e)
        await m.reply('⚠️ *Error descargando el anime.* Intenta de nuevo más tarde.')
    }
}

// ================== CONFIGURACIÓN DEL HANDLER ==================
handler.command = /^(animedlsub|animedllat|animedownload)$/i
handler.tags = ['anime']
handler.help = [
    'animedlsub <nombre>|<cap>|sub',
    'animedllat <nombre>|<cap>|lat',
    'animedownload <nombre>|<cap>|<tipo>'
]

export default handler
            
