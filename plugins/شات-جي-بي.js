import fetch from 'node-fetch';
import axios from 'axios';
import translate from '@vitalets/google-translate-api';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({ organization: global.openai_org_id, apiKey: global.openai_key });
const openaiii = new OpenAIApi(configuration);

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (usedPrefix === 'a' || usedPrefix === 'A') return;
    if (!text) throw `من فضلك أدخل طلباً أو سؤالاً لاستخدام وظيفة ChatGPT.\n\n❏ أمثلة على الطلبات:\n❏ ${usedPrefix + command} اقترح لي أفضل 10 أفلام أكشن\n❏ ${usedPrefix + command} كود بلغة جافاسكريبت للعبة بطاقات`;

    if (command.match(/^(آي|اي|بوت)$/i)) {
        try {
            conn.sendPresenceUpdate('composing', m.chat);
            let gpt = await fetch(`https://deliriusapi-official.vercel.app/ia/gptweb?text=${encodeURIComponent(text)}`);
            let res = await gpt.json();
            let translatedText = await translate(res.gpt, { to: 'ar' });
            await m.reply(translatedText.text);
        } catch (e1) {
            try {
                let gpt = await fetch(`https://deliriusapi-official.vercel.app/ia/chatgpt?q=${encodeURIComponent(text)}`);
                let res = await gpt.json();
                let translatedText = await translate(res.data, { to: 'ar' });
                await m.reply(translatedText.text);
            } catch (e2) {
                console.error(e2);
                await m.reply('حدث خطأ أثناء استرجاع الرد. حاول مرة أخرى لاحقاً.');
            }
        }
    }

    if (command.match(/^(openai|ia2|chatgpt2)$/i)) {
        conn.sendPresenceUpdate('composing', m.chat);
        try {
            let gpt = await fetch(`https://deliriusapi-official.vercel.app/ia/gptweb?text=${encodeURIComponent(text)}`);
            let res = await gpt.json();
            let translatedText = await translate(res.gpt, { to: 'ar' });
            await m.reply(translatedText.text);
        } catch (e) {
            console.error(e);
            await m.reply('حدث خطأ أثناء استرجاع الرد. حاول مرة أخرى لاحقاً.');
        }
    }
};

handler.command = /^(آي|اي|بوت)$/i;

export default handler;
