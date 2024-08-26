import fetch from "node-fetch";
let handler = async (m, {
    conn,
    isOwner,
    usedPrefix,
    command,
    text
}) => {
    conn.secmail = conn.secmail ? conn.secmail : {}
    let id = "secmail"

    let lister = [
        "اصنع",
        "الرسايل",
        "مسح"
    ]

    let [feature, inputs, inputs_, inputs__, inputs___] = text.split(" ")
    if (!lister.includes(feature)) return m.reply("*مثال:*\n" + usedPrefix + command + " اصنع\n\n*حدد نوعًا موجودًا*\n" + lister.map((v, index) => "  ○ " + v).join("\n"))

    if (lister.includes(feature)) {

        if (feature == "اصنع") {

            try {
                let eml = await random_mail()
                let info = eml[0].split('@')
                conn.secmail[id] = [
                    await m.reply("*EMAIL:*\n" + eml[0] + "\n\n" + "*Login:*\n" + info[0] + "\n\n*Domain:*\n" + info[1] + "\n\n_أكتب *\n" + usedPrefix + command + " الرسايل*\n\n للتحقق من البريد الوارد_"),
                    eml[0],
                    info[0],
                    info[1]
                ]
            } catch (e) {
                await m.reply(eror)
            }
        }

        if (feature == "الرسايل") {
            if (!conn.secmail[id]) return m.reply("لا توجد رسائل ، قم بإنشاء بريد إلكتروني أولاً\n من خلال كتابة \n*" + usedPrefix + command + " اصنع*")

            try {
                let eml = await get_mails(conn.secmail[id][2], conn.secmail[id][3])
                let teks = eml.map((v, index) => {
                    return `*EMAIL [ ${index + 1} ]*
*ID* : ${v.id}
*Dari* : ${v.from}

*Subjek* : ${v.subject}
*Date* : ${v.date}
   `.trim()
                }).filter(v => v).join("\n\n________________________\n\n")
                await m.reply(teks || "*فارغ*" + "\n\n_Ketik *" + usedPrefix + command + " حذف* لحذف رسائل البريد الإلكتروني_")
            } catch (e) {
                await m.reply(eror)
            }
        }
        if (feature == "حذف") {
            if (!conn.secmail[id]) return m.reply("لا تستخدم رسائل البريد الإلكتروني")

            try {
                delete conn.secmail[id]
                await m.reply("تم حذف البريد الإلكتروني بنجاح")
            } catch (e) {
                await m.reply(eror)
            }
        }

    }
}
handler.help = ["secmail"]
handler.tags = ["misc"]
handler.command = /^(فيك)$/i
export default handler

function msToTime(duration) {
    const milliseconds = parseInt((duration % 1000) / 100);
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    return `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`;
}

function formatSize(sizeInBytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let index = 0;

    while (sizeInBytes >= 1024 && index < units.length - 1) {
        sizeInBytes /= 1024;
        index++;
    }

    return sizeInBytes.toFixed(2) + " " + units[index];
}

async function random_mail() {
    const link = "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1"

    try {
        let response = await fetch(link);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

async function get_mails(id, domain) {
    const link = `https://www.1secmail.com/api/v1/?action=getMessages&login=${id}&domain=${domain}`;

    try {
        let response = await fetch(link);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
      }
