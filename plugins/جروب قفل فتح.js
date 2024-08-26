let handler = async (m, { conn, args, usedPrefix, command }) => {
  let isClose = { // Switch Case Like :v
      'فتح': 'not_announcement',
      'قفل': 'announcement',
  }[(args[0] || '')]
  if (isClose === undefined)
      throw `
*❒ أخــتر :*
*❒ ${usedPrefix + command} قفل*
*❒ ${usedPrefix + command} فتح*
`.trim()
  await conn.groupSettingUpdate(m.chat, isClose)
}
handler.help = ['group *open/close*']
handler.tags = ['group']
handler.command = ['group', 'جروب'] 
handler.admin = true
handler.botAdmin = true

export default handler
