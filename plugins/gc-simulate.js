let handler = async (m, { conn, usedPrefix, command, args: [event], text }) => {
if (!event) return await conn.sendButton(m.chat, `*EJEMPLO:*

${usedPrefix + command} welcome @user
${usedPrefix + command} bye @user
${usedPrefix + command} promote @user
${usedPrefix + command} demote @user`.trim(), wm, null, [['WELCOME', '#simulate welcome'], ['BYE', '#simulate bye']])
let mentions = text.replace(event, '').trimStart()
let who = mentions ? conn.parseMention(mentions) : []
let part = who.length ? who : [m.sender]
let act = false
m.reply(`*Simulando ${event}...*`)
switch (event.toLowerCase()) {
case 'add':
case 'invite':
case 'welcome':
case 'bienvenida':       
act = 'add'
break
case 'bye':
case 'kick':
case 'leave':
case 'remove':
case 'sacar':
act = 'remove'
break
case 'promote':
case 'daradmin':
case 'darpoder':
act = 'promote'
break
case 'demote':
case 'quitaradmin':
case 'quitarpoder':
act = 'demote'
break
default:
throw 'error, ingrese una opcion valida'
}
if (act) return conn.participantsUpdate({
id: m.chat,
participants: part,
action: act
})}
handler.help = ['simulate <event> [@mention]','simular <event>'] 
handler.tags = ['owner']
handler.command = /^simulate|simular$/i
handler.group = true
export default handler
