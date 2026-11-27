const handler = async (m, {conn, text, participants}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_fantasmas

  const member = participants.map((u) => u.id);
  // El número pedido se limita a los miembros del grupo: antes un
  // número mayor (o no numérico) recorría índices inexistentes y
  // reventaba al leer las propiedades del participante undefined.
  const sum = !text ? member.length : Math.min(parseInt(text) || 0, member.length);
  let total = 0;
  const sider = [];
  for (let i = 0; i < sum; i++) {
    const users = m.isGroup ? participants.find((u) => u.id == member[i]) || {} : {};
    // En Baileys 7 el participante trae `admin` ('admin' /
    // 'superadmin' / null), no .isAdmin/.isSuperAdmin (siempre
    // undefined, así que hasta el creador salía como fantasma).
    if ((typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) && !users.admin) {
      if (typeof global.db.data.users[member[i]] !== 'undefined') {
        if (global.db.data.users[member[i]].whitelist == false) {
          total++;
          sider.push(member[i]);
        }
      } else {
        total++;
        sider.push(member[i]);
      }
    }
  }
  if (total == 0) return conn.reply(m.chat, tradutor.texto1, m);
  m.reply(`${tradutor.texto2[0]} ${await conn.getName(m.chat)}\n${tradutor.texto2[1]} ${sum}\n\n${tradutor.texto2[2]}\n${sider.map((v) => '  👉🏻 @' + v.replace(/@.+/, '')).join('\n')}\n\n${tradutor.texto2[3]}`, null, {mentions: sider});
};
handler.help = ['fantasmas'];
handler.tags = ['group'];
handler.command = /^(verfantasmas|fantasmas|sider)$/i;
handler.admin = true;
handler.botAdmin = true;
export default handler;
