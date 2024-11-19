let handler = async (m, { conn }) => {
m.reply(global.requisitos_eventos)}
handler.help = ['eventos']
handler.tags = ['grupo']
handler.command = /^(requisitos_evento)$/i
handler.group = true;
export default handler

global.requisitos_eventos = `*_SECCION REQUISITOS (EVENTO NAVIDAD)_*

⚠️REQUISITOS:
* NO usar IA/AI (Inteligencia Artificial).
* NO hacer uso de collages.
* La imagen debe tener un lienzo/dimension/tamaño de 500x500px o 1000x1000px (Esto es para que la imagen sea compatible con Whatsapp y otras redes, tambien para que encaje correctamente).
* La fuente de letra/texto tiene que decir la palabra "Futabu Club" o "Futabu Club!".
* Una vez envies tu diseño/edicion, tienes que brindar una captura/video del proceso que hiciste de tu imagen en el programa de edicion.`
