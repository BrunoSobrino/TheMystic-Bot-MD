let handler = m => m
handler.all = async function (m) {
    let chat = global.db.data.chats[m.chat]
    global.db.data.users[m.sender].money += 50
    global.db.data.users[m.sender].exp += 50

    const audioResponses = [
        { trigger: /^ايتاتشي$/i, file: './media/Ara.mp3' },
        { trigger: /لايت/gi, file: './media/animevoice (2).mp3' },
        { trigger: /ليفاي/gi, file: './media/animevoice (3).mp3' },
        // القوالب الأخرى...
    ];

    for (const response of audioResponses) {
        if (chat.audios && response.trigger.test(m.text)) {
            let vn = response.file;
            this.sendPresenceUpdate('recording', m.chat);
            this.sendFile(m.chat, vn, 'error.mp3', null, m, true, { type: 'audioMessage', ptt: true });
            return;
        }
    }

    return !0;
}
export default handler;
