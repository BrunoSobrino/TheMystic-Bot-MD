let handler = async (m, { conn }) => {
m.reply(global.reglas)}
handler.help = ['reglas']
handler.tags = ['grupo']
handler.command = /^(reglas|rules|reglasgrupo|rulesgrupo|rulesgroup)$/i
handler.group = true;
export default handler

global.reglas = `----------Futabu Club----------
📝| Reglas:
❖ Respeto 
         ➥ Se debe respetar a todos en el grupo, evitando insultos hacia personas de otros países.
`
