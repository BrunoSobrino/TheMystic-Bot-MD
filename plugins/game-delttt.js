import MessageType from 'baileys';

const handler = async (m, {conn, usedPrefix, command}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.game_delttt;

  const room = Object.values(conn.game).find((room) => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender));
  if (room == undefined) return conn.sendButton(m.chat, tradutor.texto1, wm, null, [[tradutor.texto2, `${usedPrefix}ttt ${tradutor.texto3}`]], m);
  delete conn.game[room.id];
  await m.reply(tradutor.texto4);
};
handler.command = /^(delttt|deltt|delxo|deltictactoe)$/i;
handler.fail = null;
export default handler;
