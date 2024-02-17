import fetch from "node-fetch"
let handler = async (m, { conn }) => {

  let data = await (await fetch('https://raw.githubusercontent.com/Afghhjjkoo/GURU-BOT/main/lib/5%D8%AA%D8%B7%D9%82%D9%8A%D9%85.json')).json()
  let cita = data[Math.floor(Math.random() * data.length)]
  
  let cowi = await(await fetch(cita.cowo)).buffer()
  await conn.sendFile(m.chat, cowi, '', '*ولد*🧑', m)
  let ciwi = await(await fetch(cita.cewe)).buffer()
  await conn.sendFile(m.chat, ciwi, '', '*ولد*🧑🏻', m)
}
handler.help = ['𝑁𝐴𝑇𝑺𝑈 bot']
handler.tags = ['𝑁𝐴𝑇𝑺𝑈 bot']
handler.command = /^طقم2|تطقيم_اولاد$/i
handler.limit = true

export default handler