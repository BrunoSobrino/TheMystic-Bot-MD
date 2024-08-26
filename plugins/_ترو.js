

const canal2 = 'https://whatsapp.com/channel/0029VaJxI9uJkK7BedTH0D11'; 
// COMBINACIÓN DE MENSAJES
// Adaptar el simple.js
let handler = async (m, { conn, usedPrefix, command, text }) => {

// MENSAJE CARUSEL CON TODOS LOS BOTONES DISPONIBLES
// Si las ids no te funciona con usedPrefix, tendrás que definirlas, ejemplo /menu
const sections = [{
title: `Título de la sección`,
rows: [
{ header: 'الخيار 1', title: "Título1", description: 'الوصف 1', id: usedPrefix + "menu" }, 
{ header: 'الخيار 2', title: "Título2", description: 'الوصف2', id: "play" }, 
{ header: 'الخيار3', title: "Título3", description: '3 الخيار', id: "play2" }, 
{ header: 'Encabezado4', title: "Título4", description: 'Descripción4', id: "بين" }, 
]},]  
const messages = [[ // CARRUSEL 1
'Descripción de Carrusel 1', 
'Footer de Carrusel 1',
'https://telegra.ph/file/547c1e749ac2d3f12320b.jpg',
[['.menu', usedPrefix + 'menu'], ['.اوامر', 'menu'] /* etc... */],
[['.بين'], ['.play'] /* etc... */],
[['لنك القناه', canal2], ['Enlace2', 'https://telegra.ph/file/547c1e749ac2d3f12320b.jpg'] /* etc... */],
[['Botón Lista 1', sections], ['Botón Lista 2', sections] /* etc... */]
], [ // CARRUSEL 2
'Descripción de Carrusel 2',
'Footer de Carrusel 2',
'https://https://telegra.ph/file/04c90789c67308398c3a3.jpg',
[['Botón1', 'Id1'], ['Botón2', 'Id2']],
[['Texto para copiar 1'], ['Texto para copiar 2']],
[['Enlace1', 'https://example.com/link1'], ['Enlace2', 'https://whatsapp.com/channel/0029VaJxI9uJkK7BedTH0D11']],
[['Botón Lista 1', sections], ['Botón Lista 2', sections]]
], [ // CARRUSEL 3
'Descripción de Carrusel 3',
'Footer de Carrusel 3',
'https://telegra.ph/file/2adc31f08bb602e9a3357.jpg',
[['Botón1', 'Id1'], ['Botón2', 'Id2']],
[['Texto para copiar 1'], ['Texto para copiar 2']],
[['لنك القناه 🔥', 'https://whatsapp.com/channel/0029VaJxI9uJkK7BedTH0D11'], ['لنك القناه 🔥', 'https://whatsapp.com/channel/0029VaJxI9uJkK7BedTH0D11']],
[['Botón Lista 1', sections], ['Botón Lista 2', sections]]
], [ // CARRUSEL 4
'Descripción de Carrusel 4',
'Footer de Carrusel 4',
'https://telegra.ph/file/b3873e69a8a8a1b1ce478.jpg',
[['Botón1', 'Id1'], ['Botón2', 'Id2']],
[['Texto para copiar 1'], ['Texto para copiar 2']],
[['Enlace1', 'https://example.com/link1'], ['Enlace2', 'https://example.com/link2']],
[['Botón Lista 1', sections], ['Botón Lista 2', sections]]
]] /* etc... */
await conn.sendCarousel(m.chat, 'Texto', 'Footer', 'Titulo de Carrusel', messages, m)            

}
handler.command = /^(ترو)$/i
export default handler
