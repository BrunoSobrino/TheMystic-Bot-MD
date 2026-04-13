import axios from 'axios';
import fs from 'fs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Verificación de seguridad inicial
  if (!m || !conn) return;

  // Manejo de traducciones robusto
  const datas = global;
  const userDB = datas.db?.data?.users?.[m.sender] || {};
  const idioma = userDB.language || global.defaultLenguaje || 'es';
  
  let tradutor;
  try {
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
    tradutor = _translate.plugins.downloader_tiktokstalk;
  } catch (e) {
    // Fallback por si falla el archivo de idioma
    tradutor = { 
      texto1: '⚠️ Ingrese el nombre de usuario.', 
      texto2: ['Usuario:', 'Nickname:', 'Seguidores:', 'Siguiendo:', 'Likes:', 'Videos:', 'Bio:'], 
      texto3: '❌ Error al buscar el perfil.' 
    };
  }

  if (!text) return conn.reply(m.chat, tradutor.texto1, m);

  try {
    // API de Delirius (muy estable para stalk)
    const response = await axios.get("https://delirius-apiofc.vercel.app/tools/tiktokstalk", {
      params: { q: text }
    });

    const data = response.data;
    if (data.status && data.result) {
      const user = data.result.users;
      const stats = data.result.stats;

      // Construcción del mensaje
      const body = `
${tradutor.texto2[0]} ${user.username || '-'}
${tradutor.texto2[1]} ${user.nickname || '-'}
${tradutor.texto2[2]} ${stats.followerCount || '-'}
${tradutor.texto2[3]} ${stats.followingCount || '-'}
${tradutor.texto2[4]} ${stats.likeCount || '-'}
${tradutor.texto2[5]} ${stats.videoCount || '-'}
${tradutor.texto2[6]} ${user.signature || '-'}
`.trim();

      const imageUrl = user.avatarLarger;
      
      // Enviamos la imagen directamente por URL (es más rápido que Buffer en Termux)
      await conn.sendFile(m.chat, imageUrl, 'profile.jpg', body, m);
    } else {
      throw tradutor.texto3;
    }
  } catch (e) {
    console.error(e);
    throw tradutor.texto3;
  }
};

handler.help = ['tiktokstalk'];
handler.tags = ['tools'];
handler.command = ['ttstalk', 'tiktokstalk'];

export default handler;
    const $ = cheerio.load(html);
    const links = [];
    $('a.btn[href^="http"]').each((_, el) => { links.push($(el).attr('href')); });
    return links;
  } catch { return null; }
}
    if (!html) return null;

    const $ = cheerio.load(html);
    const links = [];
    $('a.btn[href^="http"]').each((_, el) => {
      const link = $(el).attr('href');
      if (link) links.push(link);
    });
    return links;
  } catch {
    return null;
  }
}
