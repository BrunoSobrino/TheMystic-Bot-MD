let handler = async (m, { conn }) => {
m.reply(global.reglas)}
handler.help = ['reglas']
handler.tags = ['grupo']
handler.command = /^(reglas|rules|reglasgrupo|rulesgrupo|rulesgroup)$/i
handler.group = true;
export default handler

global.reglas = `╰Futabu Club╯

📝| Reglas:
❖ Respeto 
➥ Se debe respetar a todos en el grupo, evitando insultos hacia personas de otros países.

❖ Peleas o Discusiones
➥ Cualquier conflicto debe resolverse en privado, sin afectar al grupo.

❖ Pedofilia
➥ Queda estrictamente prohibido acosar sexualmente a menores.

❖ Doxeo
➥ No se puede compartir información privada de ningún miembro.

❖ Toxicidad
➥ Se prohíben los insultos y el humor inapropiado hacia personas no receptivas.

❖ Uso de Comandos RPG
➥ Solo se permiten ciertos comandos en el grupo, el resto solo en privado o en el grupo de Futabu Casino.

❖ Spam
➥ No se puede enviar muy seguido enlaces, stickers o promociones sin permiso de un administrador.

❖ Binarios o Inmune
➥ Está prohibido enviar archivos multimedia que puedan causar cierres inesperado o crasheos a Whatsapp.

❖ Acoso
➥ No se permite acosar a miembros o administradores en privado.

❖ Mandar Packs
➥ No se permiten mandar packs de alguien o tuyos, sean tetas/pene/trasero o vagina.

❖ Uso de comandos +18 del Bot
➥ Se permiten ciertos comandos con límites de uso específicos.

❖ Flood
➥ Se prohíbe enviar múltiples mensajes idénticos para evitar inundar el chat.
`
