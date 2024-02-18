import axios from "axios";
// import cheerio from "cheerio";
import { tiktokdl } from "@bochilteam/scraper-sosmed";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";

var handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    throw `*التحميل من منصة التيك توك\n مثال:\n\n ${
      usedPrefix + command
    } https://www.tiktok.com/@tuanliebert/video/7313159590349212934?is_from_webapp=1&sender_device=pc`;
  }

  try {
    await conn.reply(
      m.chat,
      "انتظر لحظة ، جارٍ تنزيل الفيديو... الخادم 1",
      m,
    );

    const tiktokData = await tryServer1(args[0]);

    if (!tiktokData) {
      throw "فشل  في تنزيل الفيديو!";
    }

    const videoURL = tiktokData.video.noWatermark;

    const videoURLWatermark = tiktokData.video.watermark;

    // let ppTiktok = '';
    // if (tiktokData.author && tiktokData.author.avatar) {
    //   ppTiktok = tiktokData.author.avatar;
    // }

    const infonya_gan = `عنوان: ${tiktokData.title}\nتاريخ الرفع: ${
      tiktokData.created_at
    }\n\الحالة:\n=====================\nالاعجابات = ${
      tiktokData.stats.likeCount
    }\nالتعليقات = ${tiktokData.stats.commentCount}\nالمشاركات = ${
      tiktokData.stats.shareCount
    }\nالمشاهدات = ${tiktokData.stats.playCount}\nاحتفاظات = ${
      tiktokData.stats.saveCount
    }\n=====================\n\nالرفع: ${
      tiktokData.author.name || "لا توجد معلومات عن صاحب الفيديو"
    }\n(${tiktokData.author.unique_id} - https://www.tiktok.com/@${
      tiktokData.author.unique_id
    } )\nمعلومات: ${tiktokData.author.signature}\nرابط تحميله على شكل mp3:\n ${
      tiktokData.music.play_url
    }\nجودة الفيديو: ${tiktokData.video.ratio}\n`;
    // Foto Profile: ${ppTiktok}

    if (videoURL || videoURLWatermark) {
      // if (ppTiktok) {
      //   await conn.sendFile(m.chat, ppTiktok, 'profile.png', 'ini foto profilenya', m);
      // }
      await conn.sendFile(
        m.chat,
        videoURL,
        "tiktok.mp4",
        `اذا كنت تحب بوبيزة فتابع صاحبها 😄\ninstagram.com/noureddine_ouafy`,
        m,
      );
      setTimeout(async () => {
        await conn.sendFile(
          m.chat,
          videoURLWatermark,
          "tiktokwm.mp4",
          `اذا كنت تحب بوبيزة فتابع صاحبها 😄\ninstagram.com/noureddine_ouafy`,
          m,
        );
        await conn.sendFile(
          m.chat,
          `${tiktokData.music.play_url}`,
          "lagutt.mp3",
          "هذه هي الاغنية",
          m,
        );
        conn.reply(
          m.chat,
          "اذا كنت تحب بوبيزة فتابع صاحبها 😄\ninstagram.com/noureddine_ouafy",
          m,
        );
      }, 1500);
    } else {
      throw "لا يتوفر رابط فيديو.";
    }
  } catch (error1) {
    // Server 1 failed, try Server 2
    try {
      await conn.reply(
        m.chat,
        "انتظر لحظة ، جارٍ تنزيل الفيديو... الخادم 2",
        m,
      );
      const tiktokData2 = await tiktokdl(args[0]);

      if (!tiktokData2.success) {
        throw "فشل في تنزيل الفيديو!";
      }

      const { author, video } = tiktokData2;
      const { unique_id, nickname, avatar } = author;
      const { no_watermark, no_watermark_hd } = video;

      const avatarURL =
        avatar ||
        "https://i.pinimg.com/564x/56/2e/be/562ebed9cd49b9a09baa35eddfe86b00.jpg";

      const infonya_gan2 = `ID Unik: ${unique_id}\nNickname: ${nickname}`;

      // Lakukan apa yang Anda perlukan dengan tiktokData2 dari Server 2 di sini
      await conn.sendFile(
        m.chat,
        avatarURL,
        "thumbnail.jpg",
        `الصورة المصغرة\n\n${infonya_gan2}`,
        m,
      );
      await conn.sendFile(
        m.chat,
        no_watermark,
        "tiktok2.mp4",
        "وهذا فيديو من السيرفر 2",
        m,
      );
      await conn.sendFile(
        m.chat,
        no_watermark_hd,
        "tiktokhd2.mp4",
        "هذا هو الفيديو من Server 2 وهو أكثر دقة",
        m,
      );

      const audioURL2 = `suaratiktok.mp3`;
      await convertVideoToMp3(no_watermark, audioURL2);
      if (audioURL2) {
        // Send the MP3 file
        await conn.sendFile(
          m.chat,
          mp3FileName,
          mp3FileName,
          `هذا هو صوتها\n @${sender} version MP3`,
          m,
        );

        // Remove the temporary MP3 file
        await fs.unlink(mp3FileName);
      }

      await conn.reply(
        m.chat,
        "اذا كنت تحب بوبيزة فتابع صاحبها 😄\ninstagram.com/noureddine_ouafy",
        m,
      );
    } catch (error2) {
      // Jika server kedua juga gagal, tangani error di sini
      conn.reply(m.chat, `Error: ${error2}`, m);
    }
  }
};

async function convertVideoToMp3(videoUrl, outputFileName) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoUrl)
      .toFormat("mp3")
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(outputFileName);
  });
}

handler.help = ["tt"]
handler.tags = ["downloader"];
handler.command = /^tt$/i;

export default handler;

async function tryServer1(url) {
  // Try using tiklydown.eu.org API first
  let tiklydownAPI = `https://api.tiklydown.eu.org/api/download?url=${url}`;
  let response = await axios.get(tiklydownAPI);
  return response.data;
}
