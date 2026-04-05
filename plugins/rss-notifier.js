import axios from 'axios'
import * as cheerio from 'cheerio'

const POLL_INTERVAL_MS = 10 * 60 * 1000
const MAX_FEEDS_PER_CHAT = 10
const MAX_SEEN_GUIDS = 50
const REQUEST_TIMEOUT = 15_000

const PRESET_FEEDS = {
  kudasai: 'https://somoskudasai.com/feed/',
  crunchyroll: 'https://feeds.feedburner.com/crunchyroll/rss/anime'
}

// --- Helpers ---
function initDB() {
  if (!global.db?.data) return
  if (!global.db.data.rss) global.db.data.rss = {}
}

async function fetchFeed(url) {
  try {
    const { data } = await axios.get(url, {
      timeout: REQUEST_TIMEOUT,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const $ = cheerio.load(data, { xmlMode: true })
    const items = []

    $('item').each((_, el) => {
      const title = $(el).find('title').text().trim()
      const link = $(el).find('link').text().trim()
      const guid = $(el).find('guid').text().trim() || link
      const pubDate = $(el).find('pubDate').text().trim()
      const desc = $(el).find('description').text()
      const img = $(el).find('enclosure').attr('url') || extractFirstImgSrc(desc)
      if (title && link) items.push({ title, link, guid, pubDate, img })
    })

    if (items.length === 0) {
      $('entry').each((_, el) => {
        const title = $(el).find('title').text().trim()
        const link = $(el).find('link[rel="alternate"]').attr('href') || $(el).find('link').attr('href')
        const guid = $(el).find('id').text().trim() || link
        if (title && link) items.push({ title, link, guid })
      })
    }
    return items
  } catch { return [] }
}

function extractFirstImgSrc(html = '') {
  const m = html.match(/<img[^>]+src=["']([^"'>]+)["']/i)
  return m ? m[1] : null
}

// --- Comandos ---
let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin }) => {
  initDB()
  const chatId = m.chat
  if (!global.db.data.rss[chatId]) global.db.data.rss[chatId] = []
  const feeds = global.db.data.rss[chatId]

  switch (command) {
    case 'rssadd':
      if (!(isAdmin || isOwner)) return m.reply('❌ Solo admins.')
      if (feeds.length >= MAX_FEEDS_PER_CHAT) return m.reply('Límite alcanzado.')
      let url = PRESET_FEEDS[text.trim().toLowerCase()] || text.trim()
      if (!url.startsWith('http')) return m.reply(`Uso: ${usedPrefix + command} <url|preset>`)
      
      m.reply('⏳ Verificando...')
      const items = await fetchFeed(url)
      if (!items.length) return m.reply('No se encontraron artículos.')
      
      feeds.push({ url, label: text, seenGuids: items.map(i => i.guid) })
      m.reply('✅ Agregado con éxito.')
      break

    case 'rsslist':
      if (!feeds.length) return m.reply('No hay feeds.')
      let list = feeds.map((f, i) => `*${i + 1}.* ${f.url}`).join('\n')
      m.reply(`📋 *Feeds:*\n${list}`)
      break

    case 'rssdel':
      if (!(isAdmin || isOwner)) return m.reply('❌ Solo admins.')
      let idx = parseInt(text) - 1
      if (!feeds[idx]) return m.reply('Número inválido.')
      feeds.splice(idx, 1)
      m.reply('🗑️ Eliminado.')
      break
      
    case 'rsscheck':
      m.reply('🔄 Revisando...')
      // Aquí podrías llamar a la función de verificación manual
      break
  }
}

handler.command = ['rssadd', 'rssdel', 'rsslist', 'rsscheck', 'rssrecientes']
export default handler
