import fetch from 'node-fetch'
let handler = async (m, { conn, text, args }) => {
let virtex = await fetch('https://raw.githubusercontent.com/CyborgC4t/destrava/main/destrava2.txt').then(v => v.text());
let virtex2 = await fetch('https://raw.githubusercontent.com/CyborgC4t/destrava/main/destrava2.txt').then(v => v.text());
let virtex3 = await fetch('https://raw.githubusercontent.com/CyborgC4t/destrava/main/destrava.txt').then(v => v.text());
let virtex4 = await fetch('https://raw.githubusercontent.com/CyborgC4t/destrava/main/destrava2.txt').then(v => v.text());
let virtex5 = await fetch('https://raw.githubusercontent.com/CyborgC4t/destrava/main/destrava.txt').then(v => v.text());
conn.sendPresenceUpdate('recording', m.chat)
conn.fakeReply(m.chat, virtex, '0@s.whatsapp.net', '⛧𝕸𝖊𝖜𝖙𝖜𝖔 𝕭𝖔𝖙⛧', 'status@broadcast')
conn.fakeReply(m.chat, virtex2, '0@s.whatsapp.net', '⛧𝕸𝖊𝖜𝖙𝖜𝖔 𝕭𝖔𝖙⛧', 'status@broadcast')
conn.sendPresenceUpdate('recording', m.chat)
conn.fakeReply(m.chat, virtex3, '0@s.whatsapp.net', '⛧𝕸𝖊𝖜𝖙𝖜𝖔 𝕭𝖔𝖙⛧', 'status@broadcast')
conn.fakeReply(m.chat, virtex4, '0@s.whatsapp.net', '⛧𝕸𝖊𝖜𝖙𝖜𝖔 𝕭𝖔𝖙⛧', 'status@broadcast')
conn.fakeReply(m.chat, virtex5, '0@s.whatsapp.net', '⛧𝕸𝖊𝖜𝖙𝖜𝖔 𝕭𝖔𝖙⛧', 'status@broadcast')
conn.sendPresenceUpdate('recording', m.chat)}
handler.command = ['destrava', 'antitrabas', 'destraba', 'destrava2', 'anticrash', 'antibinario'] 
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.fail = null
export default handler 
