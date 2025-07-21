import axios from 'axios';

// Función para descargar el video como buffer
async function downloadVideoBuffer(videoUrl) {
  try {
    const response = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': 'https://www.youtube.com',
        'Referer': 'https://www.youtube.com/',
        'Cookie': 'VISITOR_INFO1_LIVE=wUugjRyz06k; VISITOR_PRIVACY_METADATA=CgJNWBIEGgAgJQ%3D%3D; LOGIN_INFO=AFmmF2swRQIhAPsZ7wVEHXqixaiMqnjwjO3romKnxQN1R_GdtxcNL5LZAiB5zmvqDM5KWSkCRwU4Thah6XIh2sraoZF8cSEf_kZN2g:QUQ3MjNmem1GUUQ3ai1yaGVCajVfRnJ2UlloMklZUFZlYnhxNC1rSXpuS3lZUU9LUHBDTEFBZW1Ga0tLa0xBendWdFBkQXV0aGtESWJ6ZEhxLUhnamRvYXZkVm9PVENkYUZGNVU5OEExZEdOTGFScThwVjNXNTY4bjVPMEE0ckNQY2NUYmFESkM5MEQ3eFlSdkNvVnRaVkpRazdPTkFZNjlB; PREF=tz=America.Mexico_City&f4=4000000&f6=40000000&f7=100; HSID=AvJSLUfwtUErH_HQX; SSID=AKKHkuzb7H_RtRo6d; APISID=OtKKcqwetIgtWs3I/Ab-7WQdIQWW8vgaqJ; SAPISID=PTSirvNL0pSiz_2Y/AR80b_-y3l6N-znFK; __Secure-1PAPISID=PTSirvNL0pSiz_2Y/AR80b_-y3l6N-znFK; __Secure-3PAPISID=PTSirvNL0pSiz_2Y/AR80b_-y3l6N-znFK; SID=g.a000zQiP0ucezBUNsofbbmbBI6s_VKfNeSkleQpFhy7nP-GIf2GeFGulTzpyaOpseCs7obOQggACgYKAbkSARESFQHGX2MikZnsGN00L4gYLnv_r2Mb1hoVAUF8yKrM8eAuWTeBHsdMu3jvHGfC0076; __Secure-1PSID=g.a000zQiP0ucezBUNsofbbmbBI6s_VKfNeSkleQpFhy7nP-GIf2Geonv-VBpePkgiVwgZ44QdNQACgYKAY8SARESFQHGX2MiPt6sgvRaMZJ1Z21loZsHjBoVAUF8yKpDfVKlUk3iuoSH_mVrVOU30076; __Secure-3PSID=g.a000zQiP0ucezBUNsofbbmbBI6s_VKfNeSkleQpFhy7nP-GIf2Ge6njvlDYHUKZwd2bnI3h18gACgYKAVgSARESFQHGX2MikpV5dWkayHmfdVqtUEg3_BoVAUF8yKpZVn41vnH8AsFRNOX_n84Z0076; YSC=CHm_FDU_ejA; __Secure-ROLLOUT_TOKEN=CK_Ik-OVnpbt9QEQkPPZodSejQMYuMb7r8zMjgM%3D; __Secure-1PSIDTS=sidts-CjIB5H03P5O9o9JPLGRKPpEz-UovpuEHhjB9EZSJn9G5RLkO3mKlbL9qb3WsWHuRUwePzBAA; __Secure-3PSIDTS=sidts-CjIB5H03P5O9o9JPLGRKPpEz-UovpuEHhjB9EZSJn9G5RLkO3mKlbL9qb3WsWHuRUwePzBAA; SIDCC=AKEyXzWwlsnsx40z588Qsom_OR7e8ZwnwL1c3kduUWSYkS3p_TSmpdgkhxV0MiOEpznd770fzt0; __Secure-1PSIDCC=AKEyXzXz8Za8i7IS-u3_yTfUKEoB5pr9Y-8kNQJsvvtypK9Tq0n5LVW8nbEY9LMdK7-fQTRYkBU; __Secure-3PSIDCC=AKEyXzWTtam-0q2Q1UjR0bEGGGq5W2e2bmKRxDjSTc6IZ3JOcauxUiXkZB7H6ZWo2EYGdMgX9xA; ST-xuwub9=session_logininfo=AFmmF2swRQIhAPsZ7wVEHXqixaiMqnjwjO3romKnxQN1R_GdtxcNL5LZAiB5zmvqDM5KWSkCRwU4Thah6XIh2sraoZF8cSEf_kZN2g%3AQUQ3MjNmem1GUUQ3ai1yaGVCajVfRnJ2UlloMklZUFZlYnhxNC1rSXpuS3lZUU9LUHBDTEFBZW1Ga0tLa0xBendWdFBkQXV0aGtESWJ6ZEhxLUhnamRvYXZkVm9PVENkYUZGNVU5OEExZEdOTGFScThwVjNXNTY4bjVPMEE0ckNQY2NUYmFESkM5MEQ3eFlSdkNvVnRaVkpRazdPTkFZNjlB'
      }
    });

    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('❌ Error al descargar el video:', error.message);
    throw error;
  }
}

// Handler de Baileys
const handler = async (m, { conn }) => {
  try {
    const videoUrl = 'https://r3---sn-p5qs7nzk.googlevideo.com/videoplayback?expire=1753074306&ei=InZ9aJT-GdaWhcIP9tvR2Qc&ip=176.1.130.233&id=o-AAqjetwH_yzNg8IGaMtz61KbkocC0n2N36ap9wVF8fgN&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&bui=AY1jyLPPn2VBySw4oZo_A8a_QD2Lrd2ovjtLGsGMadl-_n2vCwnLdJDMzerAvr45xXcfqKJXSCA4_Q9B&spc=l3OVKX_EsiY_6DjUzO5tVNtHclIWhsI-J0aiIJV8m301XwszNC9DhXE&vprv=1&svpuc=1&mime=video%2Fmp4&ns=8qkd6GtaKB991YMP2SSO3-oQ&rqh=1&gir=yes&clen=11702417&ratebypass=yes&dur=191.703&lmt=1726267750809111&fexp=24350590,24350737,24350827,24351316,24351318,24351528,24351907,24352220,24352274,24352278,24352297,24352299,24352313,24352315,24352336,24352402,24352404,24352452,24352454,24352456,24352460,24352466,24352517,24352519,24352535,24352537,24352558,24352568,24352572,24352573,24352574,24352593,24352595,24352639,24352641,51331020&c=MWEB&sefc=1&txp=5538434&n=st0jOGwtsViL9g&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRAIgYpQ4NLIzdI2dB_EIRxKRzxgVd9UAdRBpDL3dCyBDzxICIG9HYotelRg2lc4QozrzM36vKqACETojY9l9phdhff27&pot=MnQDEMvDtyNJOgMsaqUyidsnJCYr1fe1vvMa-dsEMsxCh-u4jVHv0wuRrc-E9JVwXS9NABT5IaHTm_Ctr545oB6Ay71IBv_Xuj1ZxRlScTE7OcapxHqI3Jq43JAiElHY1rqC3BQtwAGXHX7sB7TioS6ZkKYIxw==&rm=sn-2xgnvo5a2t-5n067e,sn-j5cax8pnpvo-x1xls7z,sn-x1xly7z&rrc=79,79,104&req_id=68a76b10fb6fa3ee&rms=nxu,au&redirect_counter=3&cms_redirect=yes&cmsv=e&ipbypass=yes&met=1753062916,&mh=VR&mip=187.155.156.80&mm=30&mn=sn-p5qs7nzk&ms=nxu&mt=1753062611&mv=u&mvi=3&pl=19&lsparams=ipbypass,met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=APaTxxMwRgIhAMS-VKVq-kXk1JyXL_TuRfKLcrtakWDB4lYNgJ1_GIzcAiEA6JQNHUNQTppPXU6k94uS-66ie0mgiFQ5-Ru0fNAnLac%3D';
    
    // Descargar el buffer del video
    const videoBuffer = await downloadVideoBuffer(videoUrl);
    
    // Enviar el video (fuera de la función de descarga)
    await conn.sendMessage(m.chat, {
      video: videoBuffer,
      caption: '🎥 Video descargado desde YouTube',
      mimetype: 'video/mp4'
    }, { quoted: m });

    console.log('✅ Video enviado correctamente');
  } catch (error) {
    console.error('❌ Error en el handler:', error.message);
    await m.reply('*[❗] Ocurrió un error al descargar el video*');
  }
};

handler.command = ['descargarvideo'];
handler.help = ['descargarvideo <url>'];
handler.tags = ['downloader'];
export default handler;
