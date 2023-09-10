import {stat} from 'fs';
import fetch from 'node-fetch';
const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const bestFormat = (url, type) => new Promise(async (resolve, reject) => {
  const at = await fetch('https://srvcdn8.2convert.me/api/json?url=' + url, {
    method: 'GET',
    headers: {
      'origin': 'https://en1.y2mate.is',
      'referer': 'https://en1.y2mate.is/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 OPR/99.0.0.0',
    },
  });
  const json = await at.json();
  if (json.error == true) reject(false);
  const formats = json.formats;
  if (type == 'audio') {
    const formatau = formats.audio;
    let format = formatau.find((format) => format.quality == 192);
    if (!format) format = formatau.find((format) => format.quality == 128);
    if (!format) format = formatau.find((format) => format.quality == 64);
    if (!format) format = formatau.find((format) => format.quality == 48);
    if (!format) return reject(false);
    return resolve(format);
  }
  if (type == 'video') {
    if (formats.video.length == 0) return reject(false);
    const format = formats.video[formats.video.length - 1];
    return resolve(format);
  }
});

const getUrlDl = (url) => new Promise(async (resolve, reject) => {
  const taskid = await fetch('https://srvcdn8.2convert.me/api/json', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'origin': 'https://en1.y2mate.is',
      'referer': 'https://en1.y2mate.is/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 OPR/99.0.0.0',
    },
    body: 'hash=' + encodeURIComponent(url),
  });
  const json = await taskid.json();
  if (json.error) return reject(false);
  // nsole.log(taskid)
  /* ask for status every 1 second */
  let status = false;
  while (status == false) {
    await sleep(1000);
    const statusid = await fetch('https://srvcdn8.2convert.me/api/json/task', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'origin': 'https://en1.y2mate.is',
        'referer': 'https://en1.y2mate.is/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 OPR/99.0.0.0',
      },
      body: 'taskId=' + json.taskId,
    });
    const json2 = await statusid.json();
    if (json2.error) return reject(false);
    if (json2.status == 'finished') {
      status = true;
      resolve(json2);
      break;
    }
    if (json2.status == 'error') return reject(false);
  }
});

export {
  bestFormat,
  getUrlDl,
};
