//CREADO POR @gata_dios
 
let fila, columna, sopaNube, sopaPalabra, sopaDir, userSP, cambioLetra, diamante = null
let intentos = 0
let handler = async (m, { conn, text, usedPrefix, command}) => {

if (!userSP) {
userSP = m.sender.split("@")[0]
await conn.reply(m.chat, `*@${m.sender.split("@")[0]} REGISTRADO EN EL JUEGO* ✅`, m, { mentions: [m.sender] })
}
  
async function generarSopaDeLetras() {
const LADO = 16 // Si es alto o bajo, puede dar error, deja como esta
let sopaDeLetras = new Array(LADO);
  
for (let i = 0; i < LADO; i++) {
sopaDeLetras[i] = new Array(LADO)
}
  
const PALABRAS = ['ALGORITMOS', 'ANDROID', 'ANIME', 'ARQUITECTO', 'ARTE', 'ASTRONOMIA', 'AVATAR', 'BIOLOGIA', 'CARTOGRAFIA', 'CINEMATICA', 'CIENCIA', 'CODIFICAR', 'CRUCIGRAMA', 'CRUCIVERBA', 'CUADRO', 'DISENADOR', 'ECONOMIA', 'EINSTEIN', 'ENCICLOPEDIA', 'ESTADOS', 'STUDIOS', 'SUDOKU', 'TAICHI', 'TECNOLOGIA', 'TERMINATOR', 'TETRIS', 'LEGENDZELDA', 'TIKTOK', 'TURING', 'UNIVERSO', 'VIDEOJUEGOS', 'VIRUS', 'WARCRAFT', 'WHATSAPP', 'XBOX', 'XENOVERSE', 'YOGA', 'YOUTUBE', 'ZELDA', 'ZENON', 'ANATOMIA', 'ATLETISMO', 'BACTERIA', 'BOTANICA', 'CATALOGAR', 'DANZA', 'DETECCION', 'DRAGONBALL', 'ELECTRONICA', 'ESPACIO', 'EVOLUCION', 'FANTASMAS', 'FICCION', 'FOTOGRAFIA', 'GATABOT', 'GEOGRAFIA', 'GITHUB', 'HIPHOP', 'HISTORIA', 'INNOVACION', 'JARDINERIA', 'KARATE', 'LENGUAJE', 'LITERATURA', 'MAGIA', 'MARVEL', 'MATRICES', 'MUSICA', 'NATACION', 'NEUROLOGIA', 'NUMEROLOGIA', 'ORNITOLOGIA', 'PAINTBALL', 'PIZZA', 'POLITICA', 'QUIZAS', 'RELOJERIA', 'ROBOTICA', 'SALUD', 'SCIFI', 'SEXOLOGIA', 'SIMPSONS', 'SISTEMAS', 'TALENTO', 'TAROT', 'TOPOGRAFIA', 'TRADICION', 'TRIVIAL', 'URBANISMO', 'UTOPICO', 'VETERINARIA', 'VIAJES', 'ZOOLOGIA', 'NARUTO', 'DRAGONBALL', 'ONEPIECE', 'ATTACKTITAN', 'DEATHNOTE', 'BLEACH', 'FULLMETAL', 'SWORDONLINE', 'FAIRYTAIL', 'HEROACADEMIA', 'DEMONSLAYER', 'BLACKCLOVER', 'HUNTER', 'TOKYO', 'BOKUNOHERO', 'COWBOYBEBOP', 'CODEGEASS', 'EVANGELION', 'KIMETSU', 'STEINS', 'GINTAMA', 'YUYUHAKUSHO', 'GURREN', 'JOJOBIZARRE', 'ONEPUNCHMAN', 'KON', 'CLANNAD', 'HAIKYUU', 'AKIRA', 'GHOSTSHELL', 'YOURLIE', 'SAILORMOON', 'POKEMON', 'DIGIMON', 'PRINCESS', 'SPIRITED', 'MOCASTLE', 'MYTOTORO',
'PINTURA', 'DIBUJAR', 'ESBOZAR', 'ACUARELA', 'ESCULTURA', 'RETRATO', 'ABSTRACTO', 'PAISAJE', 'ARTESANIA', 'ESTAMPAR', 'TALLERES', 'CERAMICA', 'ESTAMPAR', 'DIBUJANT', 'GALERIAS', 'FOTOGRAF', 'ESTAMPAD', 'MUSEOS', 'ARTISTAS', 'COMICS', 'OBRASART', 'ESCENOGRA', 'ACRILICO', 'GRABADOS', 'HISTORIA', 'BELLASART', 'PINTORES', 'RETRATOS', 'FIGURATIV', 'IMPRESION', 'OLEO', 'PAPERCUT', 'PINCELES', 'ESCULTORE', 'BARRO', 'FOTOGRAFO', 'ACRILICOS', 'AEROGRAFO', 'ESCULTURAS', 'RELIEVES', 'PIGMENTOS', 'CARBONCIL', 'ESTAMPADO', 'FOTOGRAFI', 'RETRATIST', 'VINILO', 'EPOXICO', 'FOTOGRAFIA', 'ARTESANAS', 'TALLERIST', 'ARTENEGRO', 'ARTISTICA', 'PINTARRON', 'GISELLES', 'ESTATUAS', 'BODEGONES', 'RETRATAR', 'ACUARELAS', 'ESCULTORI', 'TRIPTICOS', 'FOTOMURAL', 'RETABLOS', 'BODEGONIS', 'GRABADORA', 'CURSOARTE', 'MANUALIDA', 'DIBUJANTE', 'LAMINADOS', 'ESCULTORAS', 'PINCELAZO', 'CARTONERA', 'ESTARCIDO', 'HUELLISTA', 'IMPRESORA', 'PINCELETA', 'PUNTILLIS', 'LITOGRAFO', 'OLEOSOBRE', 'TEJEDURIA', 'TINTOREAS', 'TIZIANOVA', 'ARTEFLOR', 'BELLASARTS', 'BRONCESOB', 'FOTOGRAFAS', 'MUSEOGRAFO', 'PINTURAEN', 'RETRATARO', 'TRAMPANTO', 'ZONAARTE', 'ACRILICASS', 'ESCULTURAS', 'ESTAMPACION', 'FOTOMONTAJE', 'MURALISTAS', 'PAISAJISMO', 'PINTORAS', 'PREHISTORIC', 'RETRATANDO', 'TEMPELATES', 'ACUARELIST', 'AEROGRAFOS', 'BARROCOS', 'BODEGONIST', 'CARBONCILS', 'CARTONERAS', 'CURSOSARTE', 'DIBUJANTES', 'ESTARCIDOS', 'FOTOGRAFOS', 'GRABADORES', 'LAMINADORA', 'LITOGRAFOS', 'OLEOGRAFIA', 'PAPELMAKIS', 'PINTARRONES', 'PINCELAZOS', 'PUNTILLISM', 'RETABLISTA', 'TALLERISTAS', 'TEJEDURIAS', 'TIZIANOS', 'VANGUARDIS', 'VINILOSADH', 'ESTATUILLA',
'PASARELA', 'VESTIDOS', 'MODELOS', 'ESTAMPADO', 'CALZADO', 'BISUTERIA', 'COMPLEMENTO', 'BOUTIQUE', 'TENDENCIA', 'AGUJA', 'HILO', 'FASHION', 'MARCAS', 'TEXTIL', 'CORTE', 'ESTAMPADO', 'LOOK', 'CONFECCION', 'COSTURA', 'ACCESORIO', 'ESTAMPADO', 'FASHIONISTA', 'GLAMOUR', 'GAMA', 'BRILLO', 'ESTAMPADO', 'TELA', 'ESTAMPADO', 'PASION', 'TIENDA', 'VESTUARIO', 'ZAPATO', 'DESFILE', 'COSER', 'MODISTA', 'CHAQUETA', 'PIEL', 'CAMISA', 'ESTAMPADO', 'CAMISETA', 'PEINADO', 'MAQUILLAJE', 'ESTILO', 'OUTFIT', 'MAGAZINE', 'FORTNITE', 'OVERWATCH', 'LEAGUEOFLEG', 'DOTA', 'WARFRAME', 'DESTINY', 'MINECRAFT', 'HEARTHSTONE', 'WORLDWART', 'COUNTERSTRK', 'ROBLOX', 'RUNESCAPE', 'TERRARIA', 'PALADINS', 'SMITE', 'ARCHEAGE', 'GUILDWARS', 'BLACKDESERT', 'TERA', 'ALBIONONLIN', 'BRAWLHALLA', 'APEXLEGEND', 'VALORANT', 'TEAMFIGHT', 'PUBG', 'HALOGUARD', 'SEAOFTHIEVE', 'STARCRAFT', 'HEROESSTOR', 'WOWCLASSIC', 'OLDSCROLLO', 'DIABLO', 'FINALFANTASY', 'ESCAPEFROM', 'RUST', 'AMONGUS', 'IMPOSTER', 'FALLGUYS', 'PHASMOPHOB', 'ROCKETLEAG', 'FORHONOR', 'MEXICO', 'BRASIL', 'FRANCIA', 'ALEMANIA', 'ITALIA', 'JAPON', 'CHINA', 'RUSIA', 'CANADA', 'AUSTRALIA', 'SPAIN', 'ARGENTINA', 'COLOMBIA', 'PORTUGAL', 'SUIZA', 'SUECIA', 'NORUEGA', 'HOLANDA', 'BELGICA', 'DINAMARCA', 'POLONIA', 'HUNGRIA', 'AUSTRIA', 'CROACIA', 'SERBIA', 'RUMANIA', 'BULGARIA', 'GRECIA', 'TURQUIA', 'EGIPTO', 'MARRUECOS', 'SUDAFRICA', 'NIGERIA', 'KENIA', 'ETIOPIA', 'CHILE', 'PERU', 'ECUADOR', 'BOLIVIA', 'PARAGUAY', 'URUGUAY', 'CUBA', 'JAMAICA', 'HAITI', 'PUERTORICO', 'REPDOMINICANA', 'VENEZUELA', 'NICARAGUA', 'GUATEMALA', 'ELSALVADOR', 'HONDURAS', 'PANAMA', 'COSTARICA', 'BELICE', 'IRLANDA', 'INGLATERRA', 'ESCOCIA', 'GALES', 'USA', 'RUMANIA', 'UCRANIA', 'NUEVAZELANDA', 'FIJIS', 'SAMOA', 'TONGA', 'VANUATU', 'KIRIBATI', 'MICRONESIA', 'PALAU', 'NAURU', 'TUVALU', 'SALOMON', 'TUVALU', 'SURINAM', 'GUYANA', 'PERU', 'BRAZIL', 'MEXICO', 'ARGENTINA', 'COLOMBIA', 'VENEZUELA', 'CHILE', 'ECUADOR', 'BOLIVIA', 'URUGUAY', 'PARAGUAY', 'COSTARICA', 'HONDURAS', 'NICARAGUA', 'PANAMA', 'GUATEMALA', 'ELSALVADOR',
'MERCADO', 'EMPLEO', 'INFLACION', 'PRODUCTO', 'CONSUMO', 'IMPUESTO', 'MONEDA', 'BANCA', 'FISCALIDAD', 'CREDITO', 'FINANZAS', 'NEGOCIOS', 'COMERCIO', 'EXPORTACION', 'IMPORTACION', 'DEVALUACION', 'DEMANDA', 'OFERTA', 'RECESION', 'DEFLACION', 'INVERSION', 'CRECIMIENTO', 'DEUDA', 'DEFICIT', 'ESTIMULO', 'BOLSAMX', 'DIVISA', 'TARIFA', 'SUBSIDIO', 'EXCEDENTE', 'CICLO', 'FONDO', 'VALOR', 'GANANCIA', 'SALARIO', 'MONOPOLIO', 'OLIGOPOLIO', 'MERCADEO', 'COMERCIAL', 'BALANZA', 'PATRONAL', 'MERCANTIL', 'PROTECCION', 'MULTINACIONAL', 'ARANCEL', 'EMPRENDEDOR', 'CAPITALISMO', 'SOCIALISMO', 'GLOBAL', 'NEOLIBERAL', 'COOPERATIVA', 'MUNDO', 'ECONOMIA', 'COMPETENCIA', 'ESTADO', 'SOSTENIBLE', 'INNOVACION', 'INCENTIVO', 'MARKETING', 'INVERSION', 'FABRICANTE', 'MERCADOTECNIA', 'DISTRIBUCION', 'PRESTAMO', 'NEGOCIACION', 'SUPERAVIT', 'DEVALUAR', 'DEVALOR', 'CRISIS', 'EMPRENDER', 'VENTA', 'RENTA', 'UTILIDAD', 'BANCARIO', 'FINANCIAR', 'COTIZACION', 'REMESA', 'SEGURO', 'FIDUCIARIO', 'HACIENDA', 'COMISION', 'PRODUCCION', 'ECONOMISTA', 'COMPRAR', 'VENDEDOR', 'MONETARIO', 'DESCUENTO', 'CONTRABANDO', 'CATASTRO', 'SINDICALISMO', 'CUBRIR', 'CAPITAL', 'AHORRO', 'GASTO', 'BANQUERO', 'CAJA', 'EMPRESARIO', 'COMERCIAL', 'GASTOS', 'INGRESO', 'ECONOMETRIA', 'FUSION', 'COMPRAVENTA', 'REMATE', 'COMISIONISTA', 'SUBASTA', 'EQUILIBRIO', 'OFERTANTE', 'DEMANDANTE', 'EMPRESA', 'ETICA', 'CONTRATO', 'TASA', 'COSTO', 'INDUSTRIA', 'PROVEEDOR', 'PAGARE', 'CICLOPE', 'CONSUMIDOR', 'PRODUCCION', 'VENDER', 'DEVALUACION', 'ABARATAR', 'INSOLVENCIA', 'LIQUIDACION', 'AMORTIZACION', 'ACCIONISTA', 'INTERES', 'PRODUCTOR', 'PRECIOS', 'ESPECULACION', 'MATERIA', 'PRIMA', 'IMPORTADOR', 'EXPORTADOR', 'IMPORTE', 'EXPORTA', 'CONTABLE',
'ESTADIO', 'MUNDIAL', 'GOLEADOR', 'TROPICAL', 'CANGURO', 'TIGRILLO', 'NEBULOSA', 'ANDROMEDA', 'SELVA', 'SATELITE', 'COLISEO', 'AMAZONAS', 'PUMA', 'CAMELLO', 'MAGALLANES', 'LUNA', 'COMETA', 'ORION', 'JUPITER', 'ARCOIRIS', 'ELEFANTE', 'CROACIA', 'TORRE', 'GALAXIA', 'BALON', 'ATLANTICO', 'CORDILLERA', 'CEBRA', 'TIGRE', 'ROCA', 'METEORITO', 'GATO', 'HIPODROMO', 'LEOPARDO', 'MARTE', 'VENUS', 'POLVO', 'BURJKHALIFA', 'TORREEIFFEL', 'TORREDEPISA', 'ABUDHABI', 'NAIROBI', 'PAISESBAJOS', 'ISRAEL', 'SINGAPUR', 'SUECIA', 'BRASIL', 'BALEARES', 'MONTANA', 'GLACIAR', 'RIO', 'LAGO', 'CAVERNA', 'LIMON', 'MANZANA', 'NARANJA', 'COCODRILO', 'RINOCERONTE', 'ESCARABAJO', 'PINGUINO', 'TUCAN', 'TORTUGA', 'CHIMPANCE', 'JIRAFA', 'KANGAROO', 'WALLABY', 'MURCIELAGO', 'SABANA', 'DUNA', 'GALLO', 'CONEJO', 'MARISCAL', 'ZAFIRO', 'RUBI', 'ESMERALDA', 'ASTEROIDE', 'ESTRELLA', 'PLANETA', 'COMPUTADORA', 'INTERNET', 'ROBOT', 'SATELITE', 'ALIENIGENA', 'NASA', 'SPACEX', 'ELONMUSK', 'NEPTUNO', 'URANO', 'MERCURIO', 'PLUTON', 'ESPACIAL', 'AGUJERONEGRO', 'CONSTELACION', 'VIOLONCHELO', 'GUITARRA', 'PIANO', 'CONCIERTO', 'COMPOSITOR', 'MUSICA', 'SONIDO', 'VOZ', 'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'SPOTIFY', 'APPLEMUSIC', 'SOUNDCLOUD', 'DEEZER', 'TIDAL', 'PANDORA', 'NETFLIX', 'AMAZONPRIME', 'DISNEY', 'HBO', 'HULU', 'YOUTUBETV', 'ESPN', 'TWITCH', 'REDDIT', 'LINKEDIN', 'SNAPCHAT', 'TELEGRAM', 'SKYPE', 'ZOOM', 'TIKTOPDANCE', 'STORIES', 'TRENDS', 'FILTERS', 'VLOGS', 'PLAYLISTS', 'TAYLORSWIFT', 'ARIANAGRANDE', 'LADYGAGA', 'BILLIEEILISH', 'DUALIPA', 'HARRYSTYLES', 'POSTMALONE', 'JUSTINBIEBER', 'EDSHEERAN', 'SHAWNMENDES', 'LEWISCAPALDI', 'JONAS', 'KATYPERRY', 'RIHANNA', 'ADELE', 'LIZZO', 'CARDIB', 'MILEYCYRUS', 'SELENAGOMEZ', 'JENNIFERLOPEZ', 'DICAPRIO', 'TOMHANKS', 'ANGELINA', 'BRADPITT', 'MERYLSTREEP', 'NICOLEKIDMAN', 'EMMASTONE', 'JOHNTRAVOLTA', 'TOMCRUISE', 'JULIAROBERTS', 'CHRIS', 'SCARLETT', 'ROBERTDOWNEY', 'DWAYNE', 'JIMPARSONS', 'SOFIAVERGARA', 'HARINGTON', 'EMILIACLARKE', 'PETER', 'VIOLADAVIS', 'BRIELARSON', 'TOMHOLLAND', 'DAISYRIDLEY', 'JOHNBOYEGA', 'DAVIDHARBOUR', 'BOBBYBROWN', 'THEGODFATHER', 'GOODFELLAS', 'PULPFICTION', 'THESHINING', 'JAWS', 'STARWARS', 'HARRYPOTTER', 'LORDOFTHERINGS', 'THEMATRIX', 'FIGHTCLUB', 'FORRESTGUMP', 'THETERMINATOR', 'THELIONKING', 'FROZEN', 'COCO', 'TOYSTORY', 'AVENGERS', 'IRONMAN', 'BLACKPANTHER', 'SPIDERMAN', 'CAPTAINAMERICA', 'THOR', 'BATMAN', 'SUPERMAN', 'WONDERWOMAN', 'BREAKINGBAD', 'THECROWN', 'STRANGER', 'WALKINGDEAD', 'WESTWORLD', 'MANDALORIAN', 'TIGERKING', 'THEOFFICE']
const PALABRA = PALABRAS[Math.floor(Math.random() * PALABRAS.length)]
  
let filaInicial = Math.floor(Math.random() * LADO)
let columnaInicial = Math.floor(Math.random() * LADO)
const DIRECCIONES = ["horizontal", "vertical", "diagonalDerecha", "diagonalIzquierda"]
const DIRECCION = DIRECCIONES[Math.floor(Math.random() * DIRECCIONES.length)]

let palabraAgregada = false
while (!palabraAgregada) {
filaInicial = Math.floor(Math.random() * LADO)
columnaInicial = Math.floor(Math.random() * LADO)

// Algoritmo para garantizar la palabra 
let palabraEntra = true;
for (let i = 0; i < PALABRA.length; i++) {
if (DIRECCION === "horizontal" && (columnaInicial + i >= LADO)) {
palabraEntra = false
break;
} else if (DIRECCION === "vertical" && (filaInicial + i >= LADO)) {
palabraEntra = false
break;
} else if (DIRECCION === "diagonalDerecha" && (filaInicial + i >= LADO || columnaInicial + i >= LADO)) {
palabraEntra = false
break;
} else if (DIRECCION === "diagonalIzquierda" && (filaInicial + i >= LADO || columnaInicial - i < 0)) {
palabraEntra = false
break;
}
}

// Si la palabra entra, agregar a la sopa de letras
if (palabraEntra) {
for (let i = 0; i < PALABRA.length; i++) {
if (DIRECCION === "horizontal") {
sopaDeLetras[filaInicial][columnaInicial + i] = PALABRA.charAt(i)
} else if (DIRECCION === "vertical") {
sopaDeLetras[filaInicial + i][columnaInicial] = PALABRA.charAt(i)
} else if (DIRECCION === "diagonalDerecha") {
sopaDeLetras[filaInicial + i][columnaInicial + i] = PALABRA.charAt(i)
} else {
sopaDeLetras[filaInicial + i][columnaInicial - i] = PALABRA.charAt(i)
}
}
palabraAgregada = true;
}
}

// Diseño 
const LETRAS_POSIBLES = "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓜⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ"
const numerosUni = ["⓿", "❶", "❷", "❸", "❹", "❺", "❻", "❼", "❽", "❾", "❿", "⓫", "⓬", "⓭", "⓮", "⓯", "⓰", "⓱", "⓲", "⓳", "⓴"]
let sopaDeLetrasConBordes = ""
sopaDeLetrasConBordes += "     " + [...Array(LADO).keys()].map(num => numerosUni[num]).join(" ") + "\n"
//sopaDeLetrasConBordes += "   *╭" + "┄".repeat(LADO) + '┄┄' + "╮*\n"

for (let i = 0; i < LADO; i++) {
let fila = numerosUni[i] + " "

for (let j = 0; j < LADO; j++) {
if (sopaDeLetras[i][j]) {
fila += sopaDeLetras[i][j] + " "
} else {
let letraAleatoria = LETRAS_POSIBLES.charAt(Math.floor(Math.random() * LETRAS_POSIBLES.length))
fila += letraAleatoria + " "
}
}
fila += ""
sopaDeLetrasConBordes += fila + "\n"
}
//sopaDeLetrasConBordes += "   *╰" + "┄".repeat(LADO) + '┄┄' + "╯*"
sopaDeLetrasConBordes = sopaDeLetrasConBordes.replace(/[a-zA-Z]/g, letra => LETRAS_POSIBLES[letra.charCodeAt() - 65] || letra)

await m.reply(`🔠 *SOPA DE LETRAS* 🔠
*PALABRA:* \`\`\`"${PALABRA}"\`\`\`
*TIENE 3 MINUTOS PARA ENCONTRAR LA RESPUESTA CORRECTA!!*

*ESCRIBA EL NÚMERO DE FILA Y COLUMNA DEL COMIENZO DE LA PRIMERA LETRA _"${PALABRA.charAt(0)}"_ DE LA PALABRA _"${PALABRA}"_ TIENE _${intentos}_ INTENTOS!!*

*EJEMPLO:*
❇️ \`\`\`${usedPrefix + command} 28\`\`\`
➡️ \`\`\`FILA 2\`\`\`    ⬇️ \`\`\`COLUMNA 8\`\`\``.trim())
await m.reply(`🔠 *${PALABRA.split("").join(" ")}* 🔠\n\n` + sopaDeLetrasConBordes.trimEnd())
fila = filaInicial 
columna = columnaInicial
sopaNube = sopaDeLetrasConBordes
sopaPalabra = PALABRA 
sopaDir = DIRECCION.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())
}

// Condiciones del juego
cambioLetra = sopaDir
let tagUser = userSP + '@s.whatsapp.net'
if (userSP != m.sender.split("@")[0]) {
await conn.reply(m.chat, `*@${tagUser.split("@")[0]} ESTA JUGANDO SOPA DE LETRAS 🔠 ACTUALEMENTE*`, m, { mentions: [tagUser] })
return
}
if (intentos === 0) {
intentos = 3  
generarSopaDeLetras()
resetUserSP(sopaDir)

async function resetUserSP() {
await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000)) // 2 min
if (intentos !== 0) {
await conn.reply(m.chat, `*@${m.sender.split("@")[0]} TE QUEDA UN MINUTO!!* 😨`, m, { mentions: [m.sender] })
}
await new Promise((resolve) => setTimeout(resolve, 3 * 60 * 1000)) // 3 min
if (intentos !== 0) {
await conn.reply( m.chat, `*@${m.sender.split("@")[0]} EL TIEMPO SE HA ACABADO!!* 😧\n\n*LA PALABRA _"${sopaPalabra}"_ SE ENCONTRABA EN LA DIRECCIÓN _${sopaDir}_ DE LA FILA _${fila}_ Y COLUMNA _${columna}_*`, m, { mentions: [m.sender] })
fila = null, columna = null, sopaNube = null, sopaPalabra = null, sopaDir = null, userSP = null, cambioLetra = null
intentos = 0
}
}}else {
if (`${fila}${columna}` == text) {
if (sopaPalabra.length <= 4) {
diamante = 4
} else if (sopaPalabra.length <= 8) {
diamante = 8
} else if (sopaPalabra.length <= 11) {
diamante = 24
} else {
diamante = 32
}
global.db.data.users[m.sender].limit += diamante

await m.reply(`\`\`\`🎊 HAS GANADO ${diamante} ${rpgshop.emoticon('limit')}!!\`\`\`\n\n*CORRECTO!! LA PALABRA _"${sopaPalabra}"_ SE ENCONTRABA EN LA DIRECCIÓN _${cambioLetra}_ DE LA FILA _${fila}_ Y COLUMNA _${columna}_*`)
fila = null, columna = null, sopaNube = null, sopaPalabra = null, sopaDir = null, userSP = null, cambioLetra = null
intentos = 0
return
}else{
if (intentos === 1) {
fila = null, columna = null, sopaNube = null, sopaPalabra = null, sopaDir = null, userSP = null, cambioLetra = null
intentos = 0
await m.reply(`🫡 *AGOTASTE LOS INTENTOS!! LA PALABRA _"${sopaPalabra}"_ SE ENCONTRABA EN LA DIRECCIÓN _${cambioLetra}_ DE LA FILA _${fila}_ Y COLUMNA _${columna}_*`)
return  
} else {
intentos -= 1
await m.reply(`😮‍💨 *INCORRECTO. TE QUEDAN _${intentos}_ INTENTOS!!*${intentos === 1 ? '' : `\n*PALABRA A ENCONTRAR:* \`\`\`${sopaPalabra}\`\`\``}\n\n${intentos === 1 ? `\`\`\`💡 PISTA!!\`\`\`\n*LA PALABRA _${sopaPalabra}_ SE ENCUENTRA EN LA DIRECCIÓN _"${cambioLetra}"_*\n\n` : ''}${sopaNube}`)
return
}}
}}

handler.command = /^(buscarpalabra|sopa|soup|wordsearch|wordfind|spdeletras|spletras|sppalabras|spalabras|spdepalabras)$/i
export default handler
