import axios from 'axios';
import cheerio from 'cheerio';
import FormData from 'form-data';
import fs from 'fs';

/**
 * Upload file to UploadF
 * Supported mimetypes:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * - `video/mp4`
 * @param {Buffer} buffer File Buffer
 * @return {Promise<string>}
 */

export default async buffer => {
  const formData = new FormData();
  formData.append('upfile', buffer);
  const response = await axios.post('https://uploadf.com/upload.php', formData, {
    headers: formData.getHeaders()
  });
  const $ = cheerio.load(response.data);
  const image = $('meta[property="og:image"]').attr('content');
  return image;
};