//let media = './media/menus/telegramfutabuclub.jpg'
let handler = async (m, { conn, command }) => {
let str = `
----------Futabu Club----------
📝| Reglas:
• *Respeto* (Respeta a toda la comunidad y a los admins, Si son insultos argentinos como hablamos acá no pasa nada, pero si estas insultando a gente de otros países que no son de argentina no lo hagas muchos no entienden nuestros insultos)

• *No Peleas o Discusiones* (Esta totalmente prohibido las peleas o discusiones entre los miembros o admins, si llegan a pelear o a discutir que sea en privado no metan al grupo en sus asuntos de discusion o pelea)

• *No Pedofilia* (Ser pedofilo es acosar a alguien de manera sexual o con intenciones sexuales,como adultos acosando de manera sexual a menores)

• *No Doxeo* (Prohibido compartir información privada de alguien, como dirección, dni o datos personales, etc)

• *No Toxicidad* (Nada de insultos o humor muy negro hacia esa X persona si el/ella no le gusta ese comportamiento)

• *No Uso de Comandos RPG* (No usar los comandos RPG del bot, Solo se permite los siguientes comandos .work, .level, .balance y todo lo que sea de transferir está permitido en el grupo lo otro todo al Privado)

• *No Spam* (No spam de links, stickers o redes sociales, almenos que un admin te dio su permiso)

• *No Binarios o Inmune* (Nada de binarios o inmune que llegara a crashear WhatsApp por un archivo multimedia)

• *No Gore* (Nada de sangre o stickers sangriento o subidos de tono)

• *No CP* (No se permite el CP [Children Porn o Porno de niños])

• *No Acoso* (Nada de estar acosando a los miembros/admins por privado)

• *No Mandar Packs* (No se permite mandar packs de alguien o propios, como lo puede ser packs de tetas o pene) [Eso si packs de transexuales si se permite pero no propios]

• *Uso de comandos +18 del Bot* (Se permite el uso de comandos +18 del bot solo que algunos tiene limites de uso en el caso de booty, pechos, randomxxx y tetas, tiene un total de uso de 10 veces, pero para uso de trapido o futanari tiene uso infinito, mientras no sea molesto para los miembros o admins todo bien)

• *No Scat* (Esta totalmente prohibido el pasar contenido Scat, en pocas palabras es porno de 💩) [Literalmente]

• *No Earfuck* (No se permite esto ya que a muchos no le llegan a gustar, es que le meten el pene por la oreja y se lo follan eso es Earfuck)

• *No Flood* (No se permite el flood que es enviar mil veces esa misma letra explotando el chat con tanta repetición de esa misma acción)

✅| Se permite hentai/porno de transexuales pero la temática tiene que ser más de Futanari.
`.trim()
  
conn.sendHydrated(m.chat, str, wm, null, 'https://github.com/ColapsusHD/AsakuraMaoBotV2-MD', 'AsakuraMao Bot', null, null, [
['𝙑𝙤𝙡𝙫𝙚𝙧 𝙖𝙡 𝙈𝙚𝙣𝙪́ | 𝘽𝙖𝙘𝙠 𝙩𝙤 𝙈𝙚𝙣𝙪 ☘️', '/menu']
], m,)}

handler.command = /^reglas|rules|reglasgrupo|rulesgrupo|rulesgroup$/i
handler.exp = 35
export default handler
