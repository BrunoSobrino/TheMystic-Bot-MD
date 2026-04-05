import axios from 'axios'
import * as cheerio from 'cheerio'

const PRESET_FEEDS = {
  kudasai: 'https://somoskudasai.com/feed/',
  crunchyroll: 'https://feeds.feedburner.com/crunchyroll/rss/anime'
}

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin }) => {
  // Inicializar base de datos si no existe
  global.db.data.rss = global.db.data.rss || {}
  const chatId = m.chat
  if (!global.db.data.rss[chatId]) global.db.data.rss[chatId] = []
  const feeds = global.db.data.rss[chatId]

  const canManage = isOwner || isAdmin

  switch (command) {
    case 'rssadd':
      if (!canManage) return m.reply('❌ Solo administradores.')
      if (!text) return m.reply(`Uso: ${usedPrefix}rssadd <url|preset>`)
      
      let url = PRESET_FEEDS[text.trim().toLowerCase()] || text.trim()
      if (!url.startsWith('http')) return m.reply('❌ URL inválida.')

      await m.reply('⏳ Verificando feed...')
      try {
        const { data } = await axios.get(url, { timeout: 10000 })
        if (!data.includes('<rss') && !data.includes('<feed')) {
          return m.reply('⚠️ El enlace no parece ser un feed RSS válido.')
        }
        
        if (feeds.some(f => f.url === url)) return m.reply('⚠️ Ya está en la lista.')
        
        feeds.push({ url, label: text, seenGuids: [] })
        await global.db.write()
        m.reply(`✅ Feed agregado con éxito a este chat.`)
      } catch (e) {
        m.reply(`❌ Error al conectar: ${e.message}`)
      }
      break

    case 'rsslist':
      if (!feeds.length) return m.reply('❌ No hay feeds activos aquí.')
      let txt = '📋 *Feeds de este chat:*\n\n'
      feeds.forEach((f, i) => {
        txt += `*${i + 1}.* ${f.url}\n`
      })
      m.reply(txt)
      break

    case 'rssdel':
      if (!canManage) return m.reply('❌ Solo administradores.')
      let id = parseInt(text) - 1
      if (isNaN(id) || !feeds[id]) return m.reply(`Uso: ${usedPrefix}rssdel <número de la lista>`)
      feeds.splice(id, 1)
      await global.db.write()
      m.reply('🗑️ Feed eliminado.')
      break

    case 'rsscheck':
      m.reply('🔄 Forzando revisión manual...')
      // Aquí podrías disparar la función de checkAllFeeds si la tienes definida fuera
      break
  }
}

handler.command = /^(rssadd|rssdel|rsslist|rsscheck)$/i
handler.tags = ['tools']
handler.help = ['rssadd', 'rssdel', 'rsslist']

export default handler
