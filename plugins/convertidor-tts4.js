import { randomUUID } from "crypto";
let fetchear;
import("node-fetch").then(function ({ default: fetch }) {
    fetchear = fetch;
});
const fakeYouToken = "187b56b2217ac09dbe6ae610f19b35dfbc53cdd5857f818f03b45d048287b4bc";

const handler = async (m, { conn, isOwner, usedPrefix, command, args }) => {
    let ListVoice = await (await fetch("https://api.fakeyou.com/tts/list")).json();
    let lister = ListVoice.models.filter(model => 
        /latin|latino|spanish|español/i.test(model.title)
    );
    if (!lister.length) {
        return m.reply("No se encontraron voces relacionadas con 'latino' o 'español'.");
    }

    let readMore = String.fromCharCode(8206).repeat(4001);
    let query = `Consulta de entrada!\n\n*Ejemplo:*\n${usedPrefix + command} [número]|[texto]\n\n*Seleccione un número*\n` + readMore + lister.map((item, index) => "  " + (index + 1) + ". " + item.title).join("\n");
    let text;
    if (args.length >= 1) {
        text = args.slice(0).join(" ");
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text;
    } else {
        throw query;
    }

    let [atas, bawah] = text.split("|");
    if (!atas) return m.reply(query);
    if (!bawah) return m.reply(query);
    const { modelToken, title } = await getModelByIndex(lister, atas);
    m.reply("Espere por favor...\n" + title);
    try {
        let res = await requestSpeech(modelToken, bawah);
        if (res) {
            conn.sendFile(m.chat, res, 'audio.mp3', '', m, true, {
                mimetype: 'audio/mp4',
                ptt: true,
                waveform: [100, 0, 100, 0, 100, 0, 100]
            });
        }
    } catch (e) {
        m.reply(e.message);
    }
};

handler.help = ["ttsc *número|tu texto*"];
handler.tags = ["misc"];
handler.command = /^(ttsc)$/i;
export default handler;

async function getModelByIndex(arrayObject, index) {
    const model = arrayObject[index - 1];
    if (model) {
        const { model_token, title } = model;
        return { modelToken: model_token, title };
    } else {
        throw new Error('Índice inválido');
    }
}

/*
  Nombre: fetchPatiently(String url, Object params): Object
  Descripción: Envoltura para node-fetch que reintenta en caso de códigos de error 408 y 502
  Retorna: Respuesta HTTP
*/
async function fetchPatiently(url, params) {
    let response = await fetchear(url, params);
    while (response.status === 408 || response.status === 502) {
        // Espera tres segundos entre cada nueva solicitud
        await new Promise(res => setTimeout(res, 3000));
        response = await fetchear(url, params);
    }
    return response;
}

/*
  Nombre: poll(String token): String
  Descripción: Realiza encuestas hasta que se complete una solicitud de voz
  Retorna: URL en caso de éxito, cadena de error en caso de fallo
*/
function poll(token) {
    return new Promise(async (resolve, reject) => {
        // Espera un segundo entre cada solicitud de encuesta
        await new Promise(res => setTimeout(res, 1000));
        // Recupera el estado de la solicitud actual de voz
        const response = await fetchPatiently("https://api.fakeyou.com/tts/job/" + token, {
            method: "GET",
            headers: {
                "Authorization": fakeYouToken,
                "Accept": "application/json"
            }
        }).catch(error => {
            reject(`¡Error HTTP! ${error.name}`);
            console.error(error);
        });
        if (!response.ok) return;
        const json = await response.json().catch(error => {
            reject("¡Error al analizar JSON de encuesta!");
            console.error(error);
        });
        if (!json) return;
        if (!json.success) {
            reject(`¡Fallo en la encuesta! ${json.error_reason}`);
            console.error(json);
            return;
        }
        switch (json.state.status) {
            case "pending":
            case "started":
            case "attempt_failed": {
                // Continúa encuestando hasta el éxito
                await poll(token).then(resolve).catch(reject);
                return;
            }
            case "complete_success": {
                // Éxito, devuelve la URL del audio
                resolve("https://storage.googleapis.com/vocodes-public" + json.state.maybe_public_bucket_wav_audio_path);
                return;
            }
            case "complete_failure":
            case "dead":
            default: {
                // Fallo, detén la encuesta
                reject(`¡Fallo en la encuesta! ${json.state.status}`);
                console.error(json);
                return;
            }
        }
    });
}

/*
  Nombre: requestSpeech(String voice, String message): String
  Descripción: Solicita la voz y realiza encuestas hasta que se complete el trabajo
  Retorna: URL en caso de éxito, cadena de error en caso de fallo
*/
async function requestSpeech(voice, message) {
    return new Promise(async (resolve, reject) => {
        // Solicita la generación del discurso
        const response = await fetchPatiently("https://api.fakeyou.com/tts/inference", {
            method: "POST",
            body: JSON.stringify({
                tts_model_token: voice,
                uuid_idempotency_token: randomUUID(),
                inference_text: message
            }),
            headers: {
                "Authorization": fakeYouToken,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).catch(error => {
            reject(`¡Error HTTP! ${error.name}`);
            console.error(error);
        });
        if (!response.ok) return;
        const json = await response.json().catch(error => {
            reject("¡Error al analizar JSON de solicitud!");
            console.error(error);
        });
        if (!json) return;
        if (!json.success) {
            reject(`¡Fallo en la solicitud de voz! ${json.error_reason}`);
            console.error(json);
            return;
        }
        // Encuesta hasta que se haya cumplido la solicitud
        await poll(json.inference_job_token).then(resolve).catch(reject);
    });
}
