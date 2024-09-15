global.math = global.math ? global.math : {};


const handler = async (m, {conn, args, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.juegos_matemicas?.texto1 ? _translate.plugins.juegos_matemicas : _translate.plugins.juegos_matematicas

  const mat =`${tradutor.texto1} _${usedPrefix + command} medium_\n\n${tradutor.texto2} ${Object.keys(modes).join(' | ')}`.trim();
  if (args.length < 1) return await conn.reply(m.chat, mat, m);
  /* conn.sendButton(m.chat, mat, wm, null, [
['𝙼𝙰𝚃𝙴𝚂 𝙴𝙰𝚂𝚈', `${usedPrefix + command} easy`],
['𝙼𝙰𝚃𝙴𝚂 𝙼𝙴𝙳𝙸𝚄𝙼', `${usedPrefix + command} medium`],
['𝙼𝙰𝚃𝙴𝚂 𝙷𝙰𝚁𝙳', `${usedPrefix + command} hard`]], m)

conn.sendHydrated(m.chat, mat, author, null, null, null, null, null, [
['𝙼𝙰𝚃𝙴𝚂 𝙴𝙰𝚂𝚈', `${usedPrefix + command} easy`],
['𝙼𝙰𝚃𝙴𝚂 𝙼𝙴𝙳𝙸𝚄𝙼', `${usedPrefix + command} medium`],
['𝙼𝙰𝚃𝙴𝚂 𝙷𝙰𝚁𝙳', `${usedPrefix + command} hard`]], m)*/

  const mode = args[0].toLowerCase();
  if (!(mode in modes)) return await conn.reply(m.chat, mat, m);

  /* conn.sendHydrated(m.chat, mat, author, null, null, null, null, null, [
['𝙼𝙰𝚃𝙴𝚂 𝙴𝙰𝚂𝚈', `${usedPrefix + command} easy`],
['𝙼𝙰𝚃𝙴𝚂 𝙼𝙴𝙳𝙸𝚄𝙼', `${usedPrefix + command} medium`],
['𝙼𝙰𝚃𝙴𝚂 𝙷𝙰𝚁𝙳', `${usedPrefix + command} hard`]], m)*/

  const id = m.chat;
  if (id in global.math) return conn.reply(m.chat, tradutor.texto3, global.math[id][0]);
  const math = genMath(mode);
  global.math[id] = [
    await conn.reply(m.chat, `${tradutor.texto4[0]} ${math.str}\n\n${tradutor.texto4[1]} ${(math.time / 1000).toFixed(2)}s\n\n${tradutor.texto4[2]} ${math.bonus} XP\n\njrU022n8Vf`, m),
    math, 4,
    setTimeout(() => {
      if (global.math[id]) {
        conn.reply(m.chat, `${tradutor.texto5} ${math.result}`, m),
        // conn.sendButton(m.chat, `*[❗𝐈𝐍𝐅𝐎❗] 𝚂𝙴 𝙰𝙷 𝙵𝙸𝙽𝙰𝙻𝙸𝚉𝙰𝙳𝙾 𝙴𝙻 𝚃𝙸𝙴𝙼𝙿𝙾 𝙿𝙰𝚁𝙰 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙴𝚁*\n\n*𝙻𝙰 𝚁𝙴𝚂𝙿𝚄𝙴𝚂𝚃𝙰 𝙴𝚂 ${math.result}*`, author, null, [['𝚅𝙾𝙻𝚅𝙴𝚁 𝙰 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝚁', `${usedPrefix + command} ${math.mode}`]], global.math[id][0])
        delete global.math[id];
      }
    }, math.time),
  ];
};

handler.command = /^math|mates|matemáticas/i;
export default handler;

const modes = {
  noob: [-3, 3, -3, 3, '+-', 15000, 10],
  easy: [-10, 10, -10, 10, '*/+-', 20000, 40],
  medium: [-40, 40, -20, 20, '*/+-', 40000, 150],
  hard: [-100, 100, -70, 70, '*/+-', 60000, 350],
  extreme: [-999999, 999999, -999999, 999999, '*/', 99999, 9999],
  impossible: [-99999999999, 99999999999, -99999999999, 999999999999, '*/', 30000, 35000],
  impossible2: [-999999999999999, 999999999999999, -999, 999, '/', 30000, 50000],
};

const operators = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
};

function genMath(mode) {
  const [a1, a2, b1, b2, ops, time, bonus] = modes[mode];
  let a = randomInt(a1, a2);
  const b = randomInt(b1, b2);
  const op = pickRandom([...ops]);
  let result = (new Function(`return ${a} ${op.replace('/', '*')} ${b < 0 ? `(${b})` : b}`))();
  if (op == '/') [a, result] = [result, a];
  return {
    str: `${a} ${operators[op]} ${b}`,
    mode,
    time,
    bonus,
    result,
  };
}

function randomInt(from, to) {
  if (from > to) [from, to] = [to, from];
  from = Math.floor(from);
  to = Math.floor(to);
  return Math.floor((to - from) * Math.random() + from);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
