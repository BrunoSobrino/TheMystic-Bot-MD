import { fileTypeFromBuffer } from "file-type"

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

export default async (buffer) => {
 const f = await fileTypeFromBuffer(buffer)
 const file = new File([buffer], `${Date.now()}.${f.ext}`, { type: f.mime })
 const form = new FormData()
 form.append('upfile', file)
 const origin = 'https://uploadf.com'
 const r = await fetch(origin + '/upload.php', {
  'body': form,
  'method': 'post'
 })
 if(!r.ok) throw Error (`${r.status} ${r.statusText}`)
 const fileId = '/' + r.url.split("/").pop()
 const result = origin + '/file' + fileId;
 return result;
}
