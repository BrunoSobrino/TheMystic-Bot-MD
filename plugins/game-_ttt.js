import {format} from 'util';


const debugMode = !1;
const winScore = 4999;
const playScore = 99;
export async function before(m) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.game__ttt

  let ok;
  let isWin = !1;
  let isTie = !1;
  let isSurrender = !1;
  this.game = this.game ? this.game : {};
  const room = Object.values(this.game).find((room) => room.id && room.game && room.state && room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender) && room.state == 'PLAYING');
  if (room) {
    if (!/^([1-9]|(me)?nyerah|\rendirse\|rendirse|RENDIRSE|surr?ender)$/i.test(m.text)) {
      return !0;
    }
    isSurrender = !/^[1-9]$/.test(m.text);
    if (m.sender !== room.game.currentTurn) {
      if (!isSurrender) {
        return !0;
      }
    }
    if (debugMode) {
      m.reply('[DEBUG]\n' + format({
        isSurrender,
        text: m.text}));
    }
    if (!isSurrender && 1 > (ok = room.game.turn(m.sender === room.game.playerO, parseInt(m.text) - 1))) {
      m.reply({
        '-3': tradutor.texto1[0],
        '-2': tradutor.texto1[1],
        '-1': tradutor.texto1[2],
        '0': tradutor.texto1[3],
      }[ok]);
      return !0;
    }
    if (m.sender === room.game.winner) {
      isWin = true;
    } else if (room.game.board === 511) {
      isTie = true;
    }
    const arr = room.game.render().map((v) => {
      return {
        X: '❎',
        O: '⭕',
        1: '1️⃣',
        2: '2️⃣',
        3: '3️⃣',
        4: '4️⃣',
        5: '5️⃣',
        6: '6️⃣',
        7: '7️⃣',
        8: '8️⃣',
        9: '9️⃣',
      }[v];
    });
    if (isSurrender) {
      room.game._currentTurn = m.sender === room.game.playerX;
      isWin = true;
    }
    const winner = isSurrender ? room.game.currentTurn : room.game.winner;
    const str = `
🎮 ${tradutor.texto2} 🎮

❎ = @${room.game.playerX.split('@')[0]}
⭕ = @${room.game.playerO.split('@')[0]}

        ${arr.slice(0, 3).join('')}
        ${arr.slice(3, 6).join('')}
        ${arr.slice(6).join('')}

${isWin ? `@${(isSurrender ? room.game.currentTurn : room.game.winner).split('@')[0]} ${tradutor.texto3}` : isTie ? tradutor.texto4 : `${tradutor.texto5} @${room.game.currentTurn.split('@')[0]}`}
`.trim();
    const users = global.db.data.users;
    if ((room.game._currentTurn ^ isSurrender ? room.x : room.o) !== m.chat) {
      room[room.game._currentTurn ^ isSurrender ? 'x' : 'o'] = m.chat;
    }
    if (room.x !== room.o) {
      await this.sendMessage(room.x, {text: str, mentions: this.parseMention(str)}, {quoted: m});
    }
    await this.sendMessage(room.o, {text: str, mentions: this.parseMention(str)}, {quoted: m});
    if (isTie || isWin) {
      // El registro del jugador puede no existir (p. ej. se borró la
      // DB a mitad de partida): sin guarda reventaba al terminar.
      const addExp = (jid, amount) => { if (users[jid]) users[jid].exp = (users[jid].exp || 0) + amount; };
      addExp(room.game.playerX, playScore);
      addExp(room.game.playerO, playScore);
      if (isWin) addExp(winner, winScore - playScore);
      if (debugMode) {
        m.reply('[DEBUG]\n' + format(room));
      }
      delete this.game[room.id];
    }
  }
  return !0;
}
