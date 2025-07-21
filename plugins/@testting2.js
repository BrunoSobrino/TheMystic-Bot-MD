import axios from 'axios';

async function downloadVideoBuffer(videoUrl, cookies) {
  try {
    const response = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': 'https://www.youtube.com',
        'Referer': 'https://www.youtube.com/',
        'Cookie': cookies,
        'X-Origin': 'https://www.youtube.com',
        'X-Goog-Visitor-Id': 'CgtwU3B4WEdNNVlNRSiIm5uKBg%3D%3D', // Ejemplo, reemplaza con tu visitor ID real
        'X-Youtube-Client-Name': '1',
        'X-Youtube-Client-Version': '2.20210721.00.00'
      },
      maxRedirects: 5,
      validateStatus: (status) => status === 200 || status === 302
    });

    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('❌ Error en downloadVideoBuffer:', error.message);
    throw new Error(`Fallo en la descarga: ${error.response?.status || 'Sin conexión'}`);
  }
}

const handler = async (m, { conn, args }) => {
  try {
    // Verificar URL
    if (!args[0] || !args[0].includes('googlevideo.com')) {
      return m.reply('❌ Proporciona una URL válida de googlevideo.com');
    }

    // Cookies COMPLETAS (actualízalas con tus cookies recientes)
    const youtubeCookies = [
      'VISITOR_INFO1_LIVE=wUugjRyz06k',
      'VISITOR_PRIVACY_METADATA=CgJNWBIEGgAgJQ%3D%3D',
      'LOGIN_INFO=AFmmF2swRQIhAPsZ7wVEHXqixaiMqnjwjO3romKnxQN1R_GdtxcNL5LZAiB5zmvqDM5KWSkCRwU4Thah6XIh2sraoZF8cSEf_kZN2g:QUQ3MjNmem1GUUQ3ai1yaGVCajVfRnJ2UlloMklZUFZlYnhxNC1rSXpuS3lZUU9LUHBDTEFBZW1Ga0tLa0xBendWdFBkQXV0aGtESWJ6ZEhxLUhnamRvYXZkVm9PVENkYUZGNVU5OEExZEdOTGFScThwVjNXNTY4bjVPMEE0ckNQY2NUYmFESkM5MEQ3eFlSdkNvVnRaVkpRazdPTkFZNjlB',
      'PREF=tz=America.Mexico_City&f4=4000000&f6=40000000&f7=100',
      'HSID=AvJSLUfwtUErH_HQX',
      'SSID=AKKHkuzb7H_RtRo6d',
      'APISID=OtKKcqwetIgtWs3I/Ab-7WQdIQWW8vgaqJ',
      'SAPISID=PTSirvNL0pSiz_2Y/AR80b_-y3l6N-znFK',
      '__Secure-1PAPISID=PTSirvNL0pSiz_2Y/AR80b_-y3l6N-znFK',
      '__Secure-3PAPISID=PTSirvNL0pSiz_2Y/AR80b_-y3l6N-znFK',
      'SID=g.a000zQiP0ucezBUNsofbbmbBI6s_VKfNeSkleQpFhy7nP-GIf2GeFGulTzpyaOpseCs7obOQggACgYKAbkSARESFQHGX2MikZnsGN00L4gYLnv_r2Mb1hoVAUF8yKrM8eAuWTeBHsdMu3jvHGfC0076',
      '__Secure-1PSID=g.a000zQiP0ucezBUNsofbbmbBI6s_VKfNeSkleQpFhy7nP-GIf2Geonv-VBpePkgiVwgZ44QdNQACgYKAY8SARESFQHGX2MiPt6sgvRaMZJ1Z21loZsHjBoVAUF8yKpDfVKlUk3iuoSH_mVrVOU30076',
      '__Secure-3PSID=g.a000zQiP0ucezBUNsofbbmbBI6s_VKfNeSkleQpFhy7nP-GIf2Ge6njvlDYHUKZwd2bnI3h18gACgYKAVgSARESFQHGX2MikpV5dWkayHmfdVqtUEg3_BoVAUF8yKpZVn41vnH8AsFRNOX_n84Z0076',
      'YSC=CHm_FDU_ejA',
      '__Secure-ROLLOUT_TOKEN=CK_Ik-OVnpbt9QEQkPPZodSejQMYuMb7r8zMjgM%3D',
      '__Secure-1PSIDTS=sidts-CjIB5H03P5O9o9JPLGRKPpEz-UovpuEHhjB9EZSJn9G5RLkO3mKlbL9qb3WsWHuRUwePzBAA',
      '__Secure-3PSIDTS=sidts-CjIB5H03P5O9o9JPLGRKPpEz-UovpuEHhjB9EZSJn9G5RLkO3mKlbL9qb3WsWHuRUwePzBAA',
      'SIDCC=AKEyXzWwlsnsx40z588Qsom_OR7e8ZwnwL1c3kduUWSYkS3p_TSmpdgkhxV0MiOEpznd770fzt0',
      '__Secure-1PSIDCC=AKEyXzXz8Za8i7IS-u3_yTfUKEoB5pr9Y-8kNQJsvvtypK9Tq0n5LVW8nbEY9LMdK7-fQTRYkBU',
      '__Secure-3PSIDCC=AKEyXzWTtam-0q2Q1UjR0bEGGGq5W2e2bmKRxDjSTc6IZ3JOcauxUiXkZB7H6ZWo2EYGdMgX9xA'
    ].join('; ');

    // Descargar buffer
    const videoBuffer = await downloadVideoBuffer(args[0], youtubeCookies);
    
    // Enviar video
    await conn.sendMessage(m.chat, {
      video: videoBuffer,
      caption: '⬇️ Video descargado desde YouTube',
      mimetype: 'video/mp4'
    }, { quoted: m });

  } catch (error) {
    console.error('❌ Error en handler:', error);
    await m.reply(`*Error:* ${error.message}\n\n⚠️ Posibles causas:\n• Cookies inválidas/vencidas\n• URL expirada\n• Bloqueo de Google`);
  }
};

handler.command = ['descargarvideo'];
handler.help = ['descargarvideo <url>'];
handler.tags = ['downloader'];
export default handler;
