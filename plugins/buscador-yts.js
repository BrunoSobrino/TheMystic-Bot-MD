/*

- Agradecimiento a la comunidad de "WSApp • Developers"
- Agradecimiento especial a Carlos (PT) por los codigos de interactiveMessage (botones)
- Agradecimiento a Darlyn por la estructura de uso en este codigo
- Adaptacion y funcionamiento por BrunoSobrino

*/
import { getDevice } from '@whiskeysockets/baileys'
import yts from 'yt-search';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix: prefijo }) => {
    const datas = global;
    const idioma = datas.db.data.users[m.sender].language;
    const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`));
    const traductor = _translate.plugins.buscador_yts;
    const device = await getDevice(m.key.id);
    
  if (!text) throw `⚠️ *${traductor.texto1}*`;
    
  if (device !== 'desktop') {      
    
  const results = await yts(text);
  const videos = results.videos.slice(0, 20);
  const randomIndex = Math.floor(Math.random() * videos.length);
  const randomVideo = videos[randomIndex];

  const interactiveMessage = {
    header: { title: `*</ YouTube Search >*\n` },
    body: { text: `*—◉ Resultados obtenidos:* ${results.videos.length}\n*—◉ Video aleatorio:*\n*-› Title:* ${randomVideo.title}\n*-› Author:* ${randomVideo.author.name}\n*-› Views:* ${randomVideo.views}\n*-› Url:* ${randomVideo.url}\n*-› Imagen:* ${randomVideo.thumbnail}` },
    nativeFlowMessage: {
      buttons: [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: 'OPCIONES DISPONIBLES',
            sections: videos.map((video) => ({
              title: video.title,
              rows: [
                {
                  header: video.title,
                  title: video.author.name,
                  description: 'Descargar MP3',
                  id: `${prefijo}play.1 ${video.url}`
                },
                {
                  header: video.title,
                  title: video.author.name,
                  description: 'Descargar MP4',
                  id: `${prefijo}play.2 ${video.url}`
                }
              ]
            }))
          })
        }
      ],
      messageParamsJson: ''
    }
  };

  function _0x3fa5(_0x2e160d,_0x502356){const _0x296218=_0x2962();return _0x3fa5=function(_0x3fa59a,_0x2037f3){_0x3fa59a=_0x3fa59a-0xef;let _0x236f8b=_0x296218[_0x3fa59a];return _0x236f8b;},_0x3fa5(_0x2e160d,_0x502356);}(function(_0x3e2c76,_0x314c31){const _0x50a59a=_0x3fa5,_0x50d890=_0x3e2c76();while(!![]){try{const _0x3630b5=-parseInt(_0x50a59a(0xf1))/0x1+parseInt(_0x50a59a(0xf5))/0x2+-parseInt(_0x50a59a(0xf6))/0x3+-parseInt(_0x50a59a(0xf3))/0x4+parseInt(_0x50a59a(0xf4))/0x5+parseInt(_0x50a59a(0xef))/0x6*(-parseInt(_0x50a59a(0xf0))/0x7)+parseInt(_0x50a59a(0xf2))/0x8;if(_0x3630b5===_0x314c31)break;else _0x50d890['push'](_0x50d890['shift']());}catch(_0x56a982){_0x50d890['push'](_0x50d890['shift']());}}}(_0x2962,0x651e4));const message={'interactiveMessage':interactiveMessage};function _0x2962(){const _0x2b05b8=['2008908ezDpVV','2187460dHvVJY','657348rniUfn','1556004iNKQTN','4632XAajPd','1561vMaQgD','477100lUeqAa','10545320WyDJIZ'];_0x2962=function(){return _0x2b05b8;};return _0x2962();}

  conn.relayMessage(m.chat, { viewOnceMessage: { message } }, {});
      
  } else {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language;
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`));
  const traductor = _translate.plugins.buscador_yts;      
  const results = await yts(text);
  const tes = results.all;
  const teks = results.all.map((v) => {
    switch (v.type) {
      case 'video': return `
° *_${v.title}_*
↳ 🫐 *_${traductor.texto2[0]}_* ${v.url}
↳ 🕒 *_${traductor.texto2[1]}_* ${v.timestamp}
↳ 📥 *_${traductor.texto2[2]}_* ${v.ago}
↳ 👁 *_${traductor.texto2[3]}_* ${v.views}`;
    }
  }).filter((v) => v).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');
  conn.sendFile(m.chat, tes[0].thumbnail, 'yts.jpeg', teks, m);      
  }    
};
handler.help = ['ytsearch <texto>'];
handler.tags = ['search'];
handler.command = /^(ytsearch|yts|searchyt|buscaryt|videosearch)$/i;
export default handler;

/*import yts from 'yt-search';
import fs from 'fs';

const handler = async (m, {conn, text}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.buscador_yts

  if (!text) throw `⚠️ *${tradutor.texto1}*`;
  const results = await yts(text);
  const tes = results.all;
  const teks = results.all.map((v) => {
    switch (v.type) {
      case 'video': return `
° *_${v.title}_*
↳ 🫐 *_${tradutor.texto2[0]}_* ${v.url}
↳ 🕒 *_${tradutor.texto2[1]}_* ${v.timestamp}
↳ 📥 *_${tradutor.texto2[2]}_* ${v.ago}
↳ 👁 *_${tradutor.texto2[3]}_* ${v.views}`;
    }
  }).filter((v) => v).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');
  conn.sendFile(m.chat, tes[0].thumbnail, 'yts.jpeg', teks, m);
};
handler.help = ['ytsearch *<texto>*'];
handler.tags = ['search'];
handler.command = ['ytsearch', 'yts'];
export default handler;*/
