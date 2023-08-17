const handler = async (m, {conn, isPrems}) => {
  const hasil = Math.floor(Math.random() * 5000);
  const time = global.db.data.users[m.sender].lastwork + 600000;
  if (new Date - global.db.data.users[m.sender].lastwork < 600000) throw `⚔️ *¡Espera un momento aventurero!* ⚔️\n\n*Regresa a la travesía en ${msToTime(time - new Date())}* ⏳`;
  conn.sendMessage(m.chat, {text: `🏞️ *Te embarcas en una emocionante aventura:*\n\n🛠️ ${pickRandom(global.work)}\n\n💰 *¡Ganaste ${hasil} XP por tu valentía!* 💰`}, {quoted: m});
  global.db.data.users[m.sender].exp += hasil;
  global.db.data.users[m.sender].lastwork = new Date() * 1;
};
handler.help = ['work'];
handler.tags = ['xp'];
handler.command = ['work', 'trabajar'];
handler.fail = null;
export default handler;

function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;
  return minutes + ' m ' + seconds + ' s ';
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}

global.work = [
  "Eres un maestro alquimista y ganas",
  "Te conviertes en un intrépido cazador de tesoros y obtienes",
  "Diriges un negocio de transmutación de metales y ganas",
  "Exploras antiguas ruinas y encuentras una reliquia valiosa que te otorga",
  "Trabajas como mercenario en una guerra épica y ganas",
  "Eres un investigador de lo paranormal y recibes",
  "Entrenas dragones para carreras y ganas",
  "Te conviertes en el mejor herrero de la ciudad y obtienes",
  "Descubres un bosque encantado lleno de criaturas mágicas y recibes",
  "Eres un domador de bestias feroces y ganas",
  "Viajas en el tiempo y resuelves problemas históricos para ganar",
  "Eres un asesor real y obtienes",
  "Desarrollas tecnología futurista y ganas",
  "Eres un maestro en el arte de la persuasión y recibes",
  "Piloteas un mecha gigante en batallas épicas y ganas",
  "Diriges una granja de dragones y obtienes",
  "Eres un espía internacional y ganas",
  "Exploras el espacio y haces descubrimientos asombrosos que te otorgan",
  "Eres un mago de renombre y realizas trucos impresionantes para ganar",
  "Eres un científico loco y recibes",
  "Defiendes el reino contra un ejército invasor y ganas",
  "Eres un navegante audaz y encuentras una isla llena de tesoros, ganando",
  "Eres un maestro en el arte del sigilo y obtienes",
  "Eres un chef renombrado y ganas",
  "Investigas crímenes complejos como un detective hábil y recibes",
  "Eres un diplomático hábil y ganas",
  "Eres un chamán poderoso y recibes",
  "Desarrollas aplicaciones mágicas para dispositivos mágicos y ganas",
  "Eres un campeón en torneos de lucha y obtienes",
  "Eres un arquitecto visionario y ganas",
  "Eres un psíquico con habilidades sobrenaturales y recibes",
  "Eres un famoso director de cine y ganas",
  "Eres un astrónomo y descubres un nuevo planeta, obteniendo",
  "Eres un experto en supervivencia y ganas",
  "Eres un músico talentoso que toca en conciertos masivos y recibes",
  "Eres un explorador submarino y descubres tesoros hundidos, obteniendo",
  "Eres un diseñador de moda reconocido y ganas",
  "Eres un líder revolucionario y obtienes",
  "Eres un médico que descubre una cura para una enfermedad mortal, ganando",
  "Eres un hacker informático y recibes",
  "Eres un jardinero botánico que encuentra una planta rara, obteniendo",
  "Eres un cazador de mitos y ganas",
  "Eres un arqueólogo que desentierra una ciudad antigua y obtienes",
  "Eres un líder espiritual respetado y ganas",
  "Eres un jugador profesional y obtienes",
];
