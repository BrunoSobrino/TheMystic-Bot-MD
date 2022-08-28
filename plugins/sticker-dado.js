let handler = async (m, { conn }) => {
let dir = 'http://x17apis.herokuapp.com/api/randomimagem/dado?apikey=O6maaxfyXEhGuALcNvrp9z4bI'
conn.sendFile(m.chat, dir, 'error.webp', null, m, { asSticker: true })}
handler.command = ['dado', 'dados', 'dadu'] 
export default handler
