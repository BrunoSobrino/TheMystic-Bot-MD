import axios from 'axios';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
const handler = async (m, {conn, args, usedPrefix, command}) => {
  if (!args[0]) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴 𝚄𝙽 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴 𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼, 𝙴𝙹𝙴𝙼𝙿𝙻𝙾: ${usedPrefix + command} luisitocomunica*`;
  const res = await igstalk(args[0].replace(/^@/, ''));
  const res2 = await fetch(`https://api.lolhuman.xyz/api/stalkig/${args[0].replace(/^@/, '')}?apikey=${lolkeysapi}`);
  const res3 = await res2.json();
  const json = JSON.parse(JSON.stringify(res));
  const iggs = `
▢ *Username:* ${json.username}
▢ *Nickname:* ${json.fullname}
▢ *Followers:* ${json.followers}
▢ *Following:* ${json.following}
▢ *Posting:* ${json.post}
▢ *Link:* https://instagram.com/${json.username.replace(/^@/, '')}
▢ *Bio:* ${json.bio}`.trim();
  const aa = `${res3.result.photo_profile || res.profile}`;
  await conn.sendFile(m.chat, aa, 'error.jpg', iggs, m);
};
handler.help = ['igstalk <username>'];
handler.tags = ['internet'];
handler.command = /^(igstalk)$/i;
export default handler;

async function igstalk(Username) {
  return new Promise((resolve, reject) => {
    axios.get('https://dumpor.com/v/'+Username, {
      headers: {'cookie': '_inst_key=SFMyNTY.g3QAAAABbQAAAAtfY3NyZl90b2tlbm0AAAAYWGhnNS1uWVNLUU81V1lzQ01MTVY2R0h1.fI2xB2dYYxmWqn7kyCKIn1baWw3b-f7QvGDfDK2WXr8', 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'}}).then((res) => {
      const $ = cheerio.load(res.data);
      const result = {
        profile: $('#user-page > div.user > div.row > div > div.user__img').attr('style').replace(/(background-image: url\(\'|\'\);)/gi, ''),
        fullname: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > a > h1').text(),
        username: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > h4').text(),
        post: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(1)').text().replace(' Posts', ''),
        followers: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(2)').text().replace(' Followers', ''),
        following: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(3)').text().replace(' Following', ''),
        bio: $('#user-page > div.user > div > div.col-md-5.my-3 > div').text()};
      resolve(result);
    });
  });
}
