


const handler = async (m, {conn, usedPrefix: _p}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.menu_audios

  try {
    const pp = imagen4;
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    const str = `╭═══〘 ✯✯✯✯✯✯✯✯✯ 〙══╮
║    ◉— *𝐓𝐡𝐞 𝐌𝐲𝐬𝐭𝐢𝐜 - 𝐁𝐨𝐭* —◉
║≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡║
║➤ *𝗛ola, ${taguser}*
║≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡║
╰═══╡✯✯✯✯✯✯✯✯✯╞═══╯



┏━━━━━━━━━━━━━━━━┓
┃ *<𝐌𝐄𝐍𝐔 𝐀𝐔𝐃𝐈𝐎𝐒/>*
┃≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡┃
┣ *- ${_translate.plugins.menu_audios.texto1}*
┣ ඬ⃟🔊 _Quien es tu sempai botsito 7w7_
┣ ඬ⃟🔊 _Te diagnostico con gay_
┣ ඬ⃟🔊 _No digas eso papu_
┣ ඬ⃟🔊 _A nadie le importa_
┣ ඬ⃟🔊 _Fiesta del admin_
┣ ඬ⃟🔊 _Fiesta del administrador_ 
┣ ඬ⃟🔊 _Vivan los novios_
┣ ඬ⃟🔊 _Feliz cumpleaños_
┣ ඬ⃟🔊 _Noche de paz_
┣ ඬ⃟🔊 _Buenos dias_
┣ ඬ⃟🔊 _Buenos tardes_
┣ ඬ⃟🔊 _Buenos noches_
┣ ඬ⃟🔊 _Audio hentai_
┣ ඬ⃟🔊 _Chica lgante_
┣ ඬ⃟🔊 _Feliz navidad_
┣ ඬ⃟🔊 _Vete a la vrg_
┣ ඬ⃟🔊 _Pasa pack Bot_
┣ ඬ⃟🔊 _Atencion grupo_
┣ ඬ⃟🔊 _Marica quien_
┣ ඬ⃟🔊 _Murio el grupo_
┣ ඬ⃟🔊 _Oh me vengo_
┣ ඬ⃟🔊 _tio que rico_
┣ ඬ⃟🔊 _Viernes_
┣ ඬ⃟🔊 _Baneado_
┣ ඬ⃟🔊 _Sexo_
┣ ඬ⃟🔊 _Hola_
┣ ඬ⃟🔊 _Un pato_
┣ ඬ⃟🔊 _Nyanpasu_
┣ ඬ⃟🔊 _Te amo_
┣ ඬ⃟🔊 _Yamete_
┣ ඬ⃟🔊 _Bañate_
┣ ඬ⃟🔊 _Es puto_
┣ ඬ⃟🔊 _La biblia_
┣ ඬ⃟🔊 _Onichan_
┣ ඬ⃟🔊 _Mierda de Bot_
┣ ඬ⃟🔊 _Siuuu_
┣ ඬ⃟🔊 _Epico_
┣ ඬ⃟🔊 _Shitpost_
┣ ඬ⃟🔊 _Rawr_
┣ ඬ⃟🔊 _UwU_
┣ ඬ⃟🔊 _:c_
┣ ඬ⃟🔊 _a_
┗━━━━━━━━━━━━━━━━┛`.trim();
    if (m.isGroup) {
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: global.fkontak});
    } else {
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: global.fkontak});
    }
  } catch {
    conn.reply(m.chat, tradutor.texto2, m);
  }
};
handler.command = /^(menu2|audios|menú2|memu2|menuaudio|menuaudios|memuaudios|memuaudio|audios|keyaudio|keyaudios)$/i;
handler.exp = 50;
handler.fail = null;
export default handler;
function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(':');
}
