global.fakes = ['212' || '265' || '92' || '84' || '62' || '7' || '213' || '48' || '371' || '98' || '377']

let handler = m => m
handler.before = async function (m) {
  
if (m.sender.startsWith(global.fakes)) {
this.reply('Antifake activado en este grupo, lo siento seras expulsado.. tu numero parece algo fake 😄')
this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
  
}}
export default handler
