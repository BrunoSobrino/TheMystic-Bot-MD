import puppeteer from "puppeteer"
import fetch from "node-fetch"
import carbon from "carbon-now-scraper"
import fs from "fs"

let handler = async (m, {
    conn,
    isOwner,
    usedPrefix,
    command,
    args
}) => {
    let query = "اكتب الكود يا مبرجم 😝 :\n.carbon console.log('bobiza bot is the 1st whatsapp bot in the middle east ')"
    let text
    if (args.length >= 1) {
        text = args.slice(0).join(" ")
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else throw query
    
    await m.reply(wait)
    try {
        let result = await CarbonifyV1(text)
        await conn.sendFile(m.chat, result, "", "*V1 by:*\n" + m.name, m)
    } catch (e) {
        try {
            let result = await CarbonifyV2(text)
            await conn.sendFile(m.chat, result, "", "*V2 by:*\n" + m.name, m)
        } catch (e) {
            try {
                let result = await CarbonifyV3(text)
                await conn.sendFile(m.chat, result, "", "*V3 by:*\n" + m.name, m)
            } catch (e) {
            try {
            let result = await CarbonifyV4(text, "./images/auto.png")
                await conn.sendFile(m.chat, fs.readFileSync("./images/auto.png"), "", "*V4 by:*\n" + m.name, m)
            } catch (e) {
                throw eror
            }
        }
    }
 }
    
}
handler.help = ["carbon"]
handler.tags = ["logo"]
handler.command = /^carbon?$/i
export default handler

const config = {
    bg: "rgba(255, 255, 255, 1)",
    t: "seti",
    wt: "none",
    l: "auto",
    // width: 680,
    ds: true,
    dsyoff: "20px",
    dsblur: "68px",
    wc: true,
    wa: true,
    pv: "56px",
    ph: "56px",
    //ln: false,
    // fl: 1,
    fm: "Hack",
    fs: "14px",
    // lh: "133%",
    si: false,
    es: "2x",
    wm: false
};

function convertToParams(myData) {
    var out = [];
    for (var key in myData) {
        if (myData.hasOwnProperty(key)) {
            out.push(key + "=" + encodeURIComponent(myData[key]));
        }
    }
    return out.join("&");
};

async function CarbonifyV1(teks) {
    const snippets = [{
        name: "Carbonify",
        code: teks
    }];
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 800,
        height: 800,
        deviceScaleFactor: 2
    });
    let index = 1;
    for (const snippet of snippets) {
        console.log(`Carbonifying snippet ${index} of ${snippets.length}`);
        await page.goto(
            `https://carbon.now.sh?${convertToParams(config)}&code=${encodeURI(snippet.code)}`
        );

        const codeContainer = await page.$("#export-container");
        await page.addStyleTag({
            content: ".CodeMirror-sizer{min-height: 0!important}"
        });

        const screenshotBuffer = await codeContainer.screenshot({ type: 'png' });
        const filename = `./images/${snippet.name.split(".")[0]}.png`;
        fs.writeFileSync(filename, screenshotBuffer);

        index++;
    }
    await browser.close();
    return screenshotBuffer;
}

async function CarbonifyV2(input) {
    let Blobs = await fetch("https://carbonara.solopov.dev/api/cook", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "code": input
            })
        })
        .then(response => response.blob())
    let arrayBuffer = await Blobs.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    return buffer
}

async function CarbonifyV3(input) {
    let Blobs = await fetch("https://carbon-api.vercel.app/api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "code": input
            })
        })
        .then(response => response.blob())
    let arrayBuffer = await Blobs.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    return buffer
}

async function CarbonifyV4(input, output) {
let options = {
    lang: "auto",
    theme: "a11y-dark"
}

let result = await carbon(input, output, options)
return result
}
