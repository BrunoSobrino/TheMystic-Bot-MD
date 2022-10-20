/* Creditos a https://github.com/FG98F */

let handler = m => m
handler.before = async function (m, {conn, isAdmin, isBotAdmin} ) {
	
if (!m.isGroup) return !1
let chat = global.db.data.chats[m.chat]

if (isBotAdmin && chat.antiArab) {
		
if (m.sender.startsWith('77' || '77')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('90' || '90')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('92' || '92')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('93' || '93')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('94' || '94')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('98' || '98')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('212' || '212')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('229' || '229')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('233' || '233')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('234' || '234')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('244' || '244')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('265' || '265')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')} 
   
if (m.sender.startsWith('963' || '963')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('964' || '964')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('966' || '966')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('967' || '967')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('971' || '971')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('994' || '994')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
if (m.sender.startsWith('998' || '998')) {
global.db.data.users[m.sender].banned = true
m.reply(`✳️ Anti árabes está activo para evitar spam\n\nAdiós`)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
   
}}
export default handler
