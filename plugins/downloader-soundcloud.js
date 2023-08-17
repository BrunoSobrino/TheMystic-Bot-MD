import fetch from 'node-fetch';
const handler = async (m, {conn, text}) => {
  if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝙰𝙻𝙶𝚄𝙽𝙰 𝙲𝙰𝙽𝙲𝙸𝙾𝙽 𝙰 𝙱𝚄𝚂𝙲𝙰𝚁*`;
  try {
    const res = await fetch(`https://api-v2.soundcloud.com/search/tracks?q=${text}&client_id=iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX`);
    const json2 = await res.json();
    let permalinkUrl;
    if (json2.collection.length > 0) {
      const randomIndex = Math.floor(Math.random() * json2.collection.length);
      const randomObject = json2.collection[randomIndex];
      permalinkUrl = randomObject.permalink_url;
    } else {
      permalinkUrl = await json2.collection[0].permalink_url;
    }
    const res2 = await fetch(`https://api.akuari.my.id/downloader/scdl?link=${permalinkUrl}`);
    const json = await res2.json();
    const shortUrl = await (await fetch(`https://tinyurl.com/api-create.php?url=${json.link}`)).text();
    const soundcloudt = `❒═══❬ 𝐒𝐎𝐔𝐍𝐃𝐂𝐋𝐎𝐔𝐃 ❭═══╾❒\n┬\n├‣✨ *𝚃𝙸𝚃𝚄𝙻𝙾:* ${json.title}\n┴\n┬\n├‣💚 *𝚄𝚁𝙻 𝙳𝙸𝚁𝙴𝙲𝚃𝙾:* ${shortUrl}\n┴\n┬\n├‣ *- 𝙴𝚗𝚟𝚒𝚊𝚗𝚍𝚘 𝚖𝚞𝚜𝚒𝚌𝚊...*\n├‣ _﹫ᴛʜᴇ ᴍʏsᴛɪᴄ ﹣ ʙᴏᴛ_\n┴`;
    await conn.sendFile(m.chat, json.thumb, '', soundcloudt, m);
    await conn.sendMessage(m.chat, {audio: {url: json.link}, fileName: `${json.title}.mp3`, mimetype: 'audio/mpeg'}, {quoted: m});
  } catch {
    throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚁𝚁𝙾𝚁, 𝙽𝙾 𝚂𝙴 𝙻𝙾𝙶𝚁𝙾 𝙱𝚄𝚂𝙲𝙰𝚁 𝙻𝙰 𝙲𝙰𝙽𝙲𝙸𝙾𝙽 𝙾 𝙻𝙰 𝙿𝙰𝙶𝙸𝙽𝙰 𝙳𝙴 𝙰𝚈𝚄𝙳𝙰 𝙿𝙰𝚁𝙰 𝙱𝚄𝚂𝙲𝙰𝚁 𝙻𝙰 𝙲𝙰𝙽𝙲𝙸𝙾𝙽 𝙴𝚂𝚃𝙰 𝙲𝙰𝙸𝙳𝙰, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝚁𝙽𝚃𝙰𝚁𝙻𝙾 𝙼𝙰𝚂 𝚃𝙰𝚁𝙳𝙴*';
  }
};
handler.command = /^(soundcloud|cover)$/i;
export default handler;
