import fetch from "node-fetch"
let handler = async (m, { conn }) => {

  let data = await (await fetch('https://raw.githubusercontent.com/Afghhjjkoo/GURU-BOT/main/lib/miku54.json')).json()
  let cita = data[Math.floor(Math.random() * data.length)]
  
  let cowi = await(await fetch(cita.cowo)).buffer()
  await conn.sendFile(m.chat, cowi, '', '*بنت*👧🏻', m)
  let ciwi = await(await fetch(cita.cewe)).buffer()
  await conn.sendFile(m.chat, ciwi, '', '*بنت*👧', m)
}
handler.help = ['Miku bot']
handler.tags = ['Miku bot']
handler.command = /^طقمي|تطقيم_بنات$/i
handler.limit = true

export default handler