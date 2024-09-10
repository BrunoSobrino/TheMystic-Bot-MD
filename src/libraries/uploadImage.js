import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Upload file to qu.ax
 * Supported mimetypes:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * - `video/mp4`
 * - `video/webm`
 * - `audio/mpeg`
 * - `audio/wav`
 * @param {Buffer} buffer File Buffer
 * @return {Promise<string>}
 */
export default async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer);
  const form = new FormData();
  const blob = new Blob([buffer.toArrayBuffer()], { type: mime });
  form.append('files[]', blob, 'tmp.' + ext);
  const res = await fetch('https://qu.ax/upload.php', { method: 'POST', body: form });
  const result = await res.json();
  if (result && result.success) {
    return result.files[0].url;
  } else {
    throw new Error('Failed to upload the file to qu.ax');
  }
};

/*import fetch from 'node-fetch';
import {FormData, Blob} from 'formdata-node';
import {fileTypeFromBuffer} from 'file-type';
export default async (buffer) => {
  const {ext, mime} = await fileTypeFromBuffer(buffer);
  const form = new FormData();
  const blob = new Blob([buffer.toArrayBuffer()], {type: mime});
  form.append('file', blob, 'tmp.' + ext);
  const res = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: form,
  });
  const img = await res.json();
  if (img.error) throw img.error;
  return 'https://telegra.ph' + img[0].src;
};*/

