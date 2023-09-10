/* creditos del código a @darlyn1234 */
/* FAVOR DE DEJAR LOS CREDITOS */
import ytdl from "ytdl-core";
import readline from "readline";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { randomBytes } from "crypto";

const ytIdRegex =
  /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/;

class YT {
  constructor() {}

  /**
   * is Youtube URL?
   * @param {string|URL} url youtube url
   * @returns Returns true if the given YouTube URL.
   */
  static isYTUrl = (url) => {
    return ytIdRegex.test(url);
  };

  /**
   * get video id from url
   * @param {string|URL} url the youtube url want to get video id
   * @returns
   */
  static getVideoID = (url) => {
    if (!this.isYTUrl(url)) throw new Error("is not YouTube URL");
    return ytIdRegex.exec(url)[1];
  };

  /**
   * Download YouTube to mp3
   * @param {string|URL} url YouTube link want to download to mp3
   * @copyright Darlyn1234
   * @returns
   */
  static mp3 = async (url) => {
    try {
      if (!url) throw new Error("Video ID or YouTube Url is required");
      url = this.isYTUrl(url) ? "https://www.youtube.com/watch?v=" + this.getVideoID(url) : url;
      const { videoDetails } = await ytdl.getInfo(url, { lang: "id" });
      let stream = ytdl(url, { requestOptions: {
       headers: { cookie: "ISITOR_INFO1_LIVE=C0N8P8YKBPA; PREF=tz=America.Bogota&f5=20000; VISITOR_PRIVACY_METADATA=CgJQRRICGgA%3D; YSC=F124HPwH5Tk; HSID=ANMLlrOaE0U-Y9XCx; SSID=A7jofnRgyop0pJcA8; APISID=n6SY-W-U79WMcMi5/ANLbUtthWezCHSl58; SAPISID=7I0Je63HDw5qNtsd/A6kfwXpaWpL9oWNCS; __Secure-1PAPISID=7I0Je63HDw5qNtsd/A6kfwXpaWpL9oWNCS; __Secure-3PAPISID=7I0Je63HDw5qNtsd/A6kfwXpaWpL9oWNCS; YTSESSION-1b=ANPz9Kj3kneHXWVd/cloLDglSZTXhG+rbQ+5A7pXe4ThWYQ8rHRQr/mpDnEVOIc4PEpOo34pArbBqPItpFUmcRF7rBrbvY8o3qIyjm7pPyQcuuM=; GPS=1; SID=aQizKdEFw5-p5KcnHIHgPWALDWZSyYJmFsyl7wWOi7fu_X8gTdvx6Oug-zMeHzNA-0hvLw.; __Secure-1PSID=aQizKdEFw5-p5KcnHIHgPWALDWZSyYJmFsyl7wWOi7fu_X8gzfBOB25007gw93sW0fZZBw.; __Secure-1PSIDTS=sidts-CjIBSAxbGSjJ0ofY2vRCVz8xqU2RHXjyE-VqNeez6nkw8jvOZ5xtUFTPzutu1nM3OvSrJxAA; __Secure-3PSIDTS=sidts-CjIBSAxbGSjJ0ofY2vRCVz8xqU2RHXjyE-VqNeez6nkw8jvOZ5xtUFTPzutu1nM3OvSrJxAA; __Secure-3PSID=aQizKdEFw5-p5KcnHIHgPWALDWZSyYJmFsyl7wWOi7fu_X8g6hK1AfHBNbTFevBaBQPuvA.; LOGIN_INFO=AFmmF2swRQIhAIuauIKMJskoIcXPzomtvy4859ECXJjXKwIL4Fwqi8M-AiBi3HsuFHlV7lQ1cmm3p0MA9MZSsdNDL3RLqyb_aLrKMw:QUQ3MjNmemZrTWlwS2dIcm81YnNzTFRwVVFlLUF6bGh1TzV0ZWpMSFRRYm9XdHdMYnFVUV9kcWNVTVF2QXpzSWROYzE4YkM1RzU2ZjdjUk1BWTFRTm5FS1lFVHpkVXplUzF1ZGhmMTJvZW9Ca2x1Y24zTDl3bG1tSEFILWlWX2ZNRDBCVm9RSm9EZnJPMkFyMUJqaE9uR2xoM3hyVXJWbWtn; CONSISTENCY=AKreu9spRAFkKxEWfUje5J-netwXc64KTkz8ZxGkb2fS0jSkvw7HS3ZlNxyUNMoWb1_0Kzj4kSS6Wb0tulfITpFGHwYqDQyEvRz4lyfhoJV4U9Pa1V7XYEzG5c8QhUyn-KE21gCuwrCyYoLt295cpHM; SIDCC=APoG2W_12yoyWkHPHg7DjiiKJB01vkwulDW9v2gIuS0mUCIpDl7SGkQ8ywiYcwBXal5jnLxZ01s; __Secure-1PSIDCC=APoG2W9XogiNUjt9CjAlbVSb0YTrBJlo_rvOXGqodWmCwyDW_3SPyDLi9b1Co99YVhvhXvlWWPY; __Secure-3PSIDCC=APoG2W8Koq32WwziWG7m1gPuRhj8dxVpdIFrjbUM6rA2vH7wUY-cE16wy6XKz8QfLOuyKshzVjJa" },
      }, filter: "audioonly", quality: 140 });
      let songPath = `./tmp/${randomBytes(3).toString("hex")}.mp3`;

      let starttime;
      stream.once("response", () => {
        starttime = Date.now();
      });
      stream.on("progress", (chunkLength, downloaded, total) => {
        const percent = downloaded / total;
        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
        const estimatedDownloadTime =
          downloadedMinutes / percent - downloadedMinutes;
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
        process.stdout.write(
          `(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(
            total /
            1024 /
            1024
          ).toFixed(2)}MB)\n`,
        );
        process.stdout.write(
          `running for: ${downloadedMinutes.toFixed(2)}minutes`,
        );
        process.stdout.write(
          `, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `,
        );
        readline.moveCursor(process.stdout, 0, -1);
      });
      stream.on("end", () => process.stdout.write("\n\n"));
      stream.on("error", (err) => console.log(err));

      const file = await new Promise((resolve) => {
        ffmpeg(stream)
          .audioFrequency(44100)
          .audioChannels(2)
          .audioBitrate(128)
          .audioCodec("libmp3lame")
          .audioQuality(5)
          .toFormat("mp3")
          .save(songPath)
          .on("end", () => {
            resolve(songPath);
          });
      });
      return {
        meta: {
          channelUrl: videoDetails.author.channel_url,
          views: videoDetails.viewCount,
          category: videoDetails.category,
          id: videoDetails.videoId,
          url: videoDetails.video_url,
          publicDate: videoDetails.publishDate,
          uploadDate: videoDetails.uploadDate,
          keywords: videoDetails.keywords,
          title: videoDetails.title,
          channel: videoDetails.author.name,
          seconds: videoDetails.lengthSeconds,
          image: videoDetails.thumbnails.slice(-1)[0].url,
        },
        path: file,
        size: fs.statSync(songPath).size,
      };
    } catch (error) {
      throw error;
    }
  };
    
  /**
   * Download YouTube to mp4
   * @param {string|URL} url YouTube link want to download to mp4
   * @copyright Darlyn1234
   * @returns
   */
  static mp4 = async (url) => {
    try {
      if (!url) throw new Error("Video ID or YouTube Url is required");
      url = this.isYTUrl(url) ? "https://www.youtube.com/watch?v=" + this.getVideoID(url) : url;
      const { videoDetails } = await ytdl.getInfo(url, { lang: "id" });
      console.log(videoDetails)  
      let stream = ytdl(url, { requestOptions: {
      headers: { cookie: "ISITOR_INFO1_LIVE=C0N8P8YKBPA; PREF=tz=America.Bogota&f5=20000; VISITOR_PRIVACY_METADATA=CgJQRRICGgA%3D; YSC=F124HPwH5Tk; HSID=ANMLlrOaE0U-Y9XCx; SSID=A7jofnRgyop0pJcA8; APISID=n6SY-W-U79WMcMi5/ANLbUtthWezCHSl58; SAPISID=7I0Je63HDw5qNtsd/A6kfwXpaWpL9oWNCS; __Secure-1PAPISID=7I0Je63HDw5qNtsd/A6kfwXpaWpL9oWNCS; __Secure-3PAPISID=7I0Je63HDw5qNtsd/A6kfwXpaWpL9oWNCS; YTSESSION-1b=ANPz9Kj3kneHXWVd/cloLDglSZTXhG+rbQ+5A7pXe4ThWYQ8rHRQr/mpDnEVOIc4PEpOo34pArbBqPItpFUmcRF7rBrbvY8o3qIyjm7pPyQcuuM=; GPS=1; SID=aQizKdEFw5-p5KcnHIHgPWALDWZSyYJmFsyl7wWOi7fu_X8gTdvx6Oug-zMeHzNA-0hvLw.; __Secure-1PSID=aQizKdEFw5-p5KcnHIHgPWALDWZSyYJmFsyl7wWOi7fu_X8gzfBOB25007gw93sW0fZZBw.; __Secure-1PSIDTS=sidts-CjIBSAxbGSjJ0ofY2vRCVz8xqU2RHXjyE-VqNeez6nkw8jvOZ5xtUFTPzutu1nM3OvSrJxAA; __Secure-3PSIDTS=sidts-CjIBSAxbGSjJ0ofY2vRCVz8xqU2RHXjyE-VqNeez6nkw8jvOZ5xtUFTPzutu1nM3OvSrJxAA; __Secure-3PSID=aQizKdEFw5-p5KcnHIHgPWALDWZSyYJmFsyl7wWOi7fu_X8g6hK1AfHBNbTFevBaBQPuvA.; LOGIN_INFO=AFmmF2swRQIhAIuauIKMJskoIcXPzomtvy4859ECXJjXKwIL4Fwqi8M-AiBi3HsuFHlV7lQ1cmm3p0MA9MZSsdNDL3RLqyb_aLrKMw:QUQ3MjNmemZrTWlwS2dIcm81YnNzTFRwVVFlLUF6bGh1TzV0ZWpMSFRRYm9XdHdMYnFVUV9kcWNVTVF2QXpzSWROYzE4YkM1RzU2ZjdjUk1BWTFRTm5FS1lFVHpkVXplUzF1ZGhmMTJvZW9Ca2x1Y24zTDl3bG1tSEFILWlWX2ZNRDBCVm9RSm9EZnJPMkFyMUJqaE9uR2xoM3hyVXJWbWtn; CONSISTENCY=AKreu9spRAFkKxEWfUje5J-netwXc64KTkz8ZxGkb2fS0jSkvw7HS3ZlNxyUNMoWb1_0Kzj4kSS6Wb0tulfITpFGHwYqDQyEvRz4lyfhoJV4U9Pa1V7XYEzG5c8QhUyn-KE21gCuwrCyYoLt295cpHM; SIDCC=APoG2W_12yoyWkHPHg7DjiiKJB01vkwulDW9v2gIuS0mUCIpDl7SGkQ8ywiYcwBXal5jnLxZ01s; __Secure-1PSIDCC=APoG2W9XogiNUjt9CjAlbVSb0YTrBJlo_rvOXGqodWmCwyDW_3SPyDLi9b1Co99YVhvhXvlWWPY; __Secure-3PSIDCC=APoG2W8Koq32WwziWG7m1gPuRhj8dxVpdIFrjbUM6rA2vH7wUY-cE16wy6XKz8QfLOuyKshzVjJa" },
      }, filter: "audioandvideo", quality: 'highestvideo' });
      let videoPath = `./tmp/${randomBytes(3).toString("hex")}.mp4`;

      let starttime;
      stream.once("response", () => {
        starttime = Date.now();
      });
      stream.on("progress", (chunkLength, downloaded, total) => {
        const percent = downloaded / total;
        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
        const estimatedDownloadTime =
          downloadedMinutes / percent - downloadedMinutes;
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
        process.stdout.write(
          `(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(
            total /
            1024 /
            1024
          ).toFixed(2)}MB)\n`,
        );
        process.stdout.write(
          `running for: ${downloadedMinutes.toFixed(2)}minutes`,
        );
        process.stdout.write(
          `, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `,
        );
        readline.moveCursor(process.stdout, 0, -1);
      });
      stream.on("end", () => process.stdout.write("\n\n"));
      stream.on("error", (err) => console.log(err));

    const file = await new Promise((resolve) => {
      ffmpeg(stream)
        .toFormat("mp4") 
        .save(videoPath)
        .on("end", () => {
          resolve(videoPath);
        });
    });
      return {
        meta: {
          channelUrl: videoDetails.author.channel_url,
          views: videoDetails.viewCount,
          category: videoDetails.category,
          id: videoDetails.videoId,
          url: videoDetails.video_url,
          publicDate: videoDetails.publishDate,
          uploadDate: videoDetails.uploadDate,
          keywords: videoDetails.keywords,
          title: videoDetails.title,
          channel: videoDetails.author.name,
          seconds: videoDetails.lengthSeconds,
          image: videoDetails.thumbnails.slice(-1)[0].url,
        },
        path: file,
        size: fs.statSync(videoPath).size,
      };
    } catch (error) {
      throw error;
    }
  };    
}

export default YT;
