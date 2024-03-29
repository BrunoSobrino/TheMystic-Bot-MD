import {search, download} from 'aptoide-scraper';
const handler = async (m, {conn, usedPrefix: prefix, command, text}) => {
 if (!text) throw `*📥╎اكـتـب اسـم تـطـبـيـق لـتـنـزيـلـه🖇️*`;
  try {    
    const searchA = await search(text);
    const data5 = await download(searchA[0].id);
    let response = `*〖📲┇تـحـمـيـل الـتـطـبـيـقـات┇📲〗*\n\n֎╎اسـم الـتـطبـيـق📌┇ ${data5.name}\n֎╎اسـم الـطـرد📦┇ ${data5.package}\n֎╎الانـتـاج🕒┇ ${data5.lastup}\n֎╎الـحـجـم📥┇ ${data5.size}`
    await conn.sendMessage(m.chat, {image: {url: data5.icon}, caption: response}, {quoted: m});
 if (data5.size.includes('GB') || data5.size.replace(' MB', '') > 999) {
      return await conn.sendMessage(m.chat, {text: '*֎╎حـجـم الـمـلـف كـبـيـر جـدا لـذا لـن يـتـم ارسـالـه⛔*'}, {quoted: m});
    }
    await conn.sendMessage(m.chat, {document: {url: data5.dllink}, mimetype: 'application/vnd.android.package-archive', fileName: data5.name + '.apk', caption: null}, {quoted: m});
  } catch {
    throw `֎╎ايـرور❗`;
  }    
};
handler.command = /^(apkmod|apk|apek|تطبيق)$/i;
export default handler;