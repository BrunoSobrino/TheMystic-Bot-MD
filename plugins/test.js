// TEST Y CREDITOS A: GABRIEL OFC : (github.com/glytglobal)

import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  if (!text) throw '[❗️] INGRESA EL NOMBRE PARA BUSCAR LOS RESULTADOS EN TIKTOK\n\n_*DEMOSTRACION:* ${Prefix + Command} *<TEXTO>*_\n\n_*EJEMPLO:* ${Prefix + Command} *GL YT MX*_';

  try {
    let response = await fetch(`https://deliriusapi-official.vercel.app/search/tiktoksearch?query=${encodeURIComponent(text)}`);
    let data = await response.json();

    if (data.status === 200) {
      let result = data.meta.slice(0, 4);

      let messages = videos.map((video, index) => [
        `${video.title}`,
        `ESTOS SON LOS RESULTADOS DE: ${text}`,
        video[index],
        [
          ['.·:*¨𝙀𝙣𝙫𝙞𝙖𝙧 𝙈𝙚𝙣𝙪¨*:·.', usedPrefix + 'menu']
        ],
        [
          ['.·:*¨𝙈𝙞𝙧𝙖𝙧 𝙚𝙣 𝙏𝙞𝙠𝙩𝙤𝙠¨*:·.', video.url],
          ['.·:*¨𝙏𝙝𝙚𝙈𝙮𝙨𝙩𝙞𝙘-𝘽𝙤𝙩-𝙈𝘿¨*:·.', 'https://whatsapp.com/channel/0029Vaein6eInlqIsCXpDs3y']
        ]
      ]);
      await conn.sendCarousel(m.chat, `> RESULTADOS ENCOBTRADOS PARA: *${text}*`, '三 ㄒ丨ҜㄒㄖҜ丂乇卂尺匚卄 三\n三 Ꮆ卂乃尺丨乇ㄥ ㄖ千匚 三', 'RESULTADOS', messages, m);
    } else {
      throw '*[❗️] NO SE LOGRO ENCONTRAR LOS RESULTADOS DE SU BUSQUEDA*';
    }
  } catch (e) {
    await m.reply(`ERROR AL EJECUTAR ESTE COMANDO:\n\n${e.message || e}`);
  }
};

handler.command = ['test'];
handler.register = true;

export default handler;
