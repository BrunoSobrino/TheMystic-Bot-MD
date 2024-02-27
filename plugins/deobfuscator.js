import fs from 'fs';
import { webcrack } from 'webcrack';
let handler = async (m ,{ conn, text }) => {

  if (!text) throw `اكتب الأمر متبوع بالكود الذي تود فك تشفيره`
  try {
    let result = await webcrack(text);
    m.reply(result.code)
  } catch (e) {
    console.log(e)
    throw "*هذا الكود غير موجود او فيه خطأ*"
  }
}
handler.help = ["deobfuscator"]
handler.tags = ["tools"]
handler.command =/^deobfuscator$/i
export default handler
