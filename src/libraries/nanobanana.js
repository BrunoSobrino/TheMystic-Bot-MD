/**
 * Ai Image Editing - Nano Banana
 * Author  : gienetic
 * Base    : https://play.google.com/store/apps/details?id=com.codergautamyt.photogpt
 * Note    : biar apk nya gak karam , makanya kalo recode tetep kasih tag author / sumber ya bab :v
 */

import axios from "axios";
import FormData from "form-data";
import crypto from "crypto";

const BASE_URL = "https://ai-apps.codergautam.dev";

function acakName(len = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function autoregist() {
  const uid = crypto.randomBytes(12).toString("hex");
  const email = `gienetic${Date.now()}@gmail.com`;

  const payload = {
    uid,
    email,
    displayName: acakName(),
    photoURL: "https://i.pravatar.cc/150",
    appId: "photogpt"
  };

  const res = await axios.post(`${BASE_URL}/photogpt/create-user`, payload, {
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
      "user-agent": "okhttp/4.9.2"
    }
  });

  if (res.data.success) return uid;
  throw new Error("❌ Error al registrar usuario: " + JSON.stringify(res.data));
}

export async function img2img(imageBuffer, prompt, pollInterval = 3000, pollTimeout = 2 * 60 * 1000) {
  const uid = await autoregist();

  const form = new FormData();
  form.append("image", imageBuffer, { filename: "input.jpg", contentType: "image/jpeg" });
  form.append("prompt", prompt);
  form.append("userId", uid);

  const uploadRes = await axios.post(`${BASE_URL}/photogpt/generate-image`, form, {
    headers: {
      ...form.getHeaders(),
      "accept": "application/json",
      "user-agent": "okhttp/4.9.2",
      "accept-encoding": "gzip"
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 120000
  });

  if (!uploadRes.data.success) throw new Error("❌ Error al subir la imagen: " + JSON.stringify(uploadRes.data));

  const pollingUrl = uploadRes.data.pollingUrl || (uploadRes.data.jobId ? `${BASE_URL}/photogpt/job/${uploadRes.data.jobId}` : null);
  if (!pollingUrl) throw new Error("⚠️ No se encontró la URL de polling.");

  let status = "pending";
  let resultUrl = null;
  const startTime = Date.now();

  while (true) {
    if (Date.now() - startTime > pollTimeout) throw new Error("⏳ Tiempo de espera agotado durante el polling.");

    const pollRes = await axios.get(pollingUrl, {
      headers: {
        "accept": "application/json",
        "user-agent": "okhttp/4.9.2",
        "accept-encoding": "gzip"
      }
    });

    status = (pollRes.data.status || "").toLowerCase();
    if (status === "ready" || status === "complete" || status === "success") {
      resultUrl = pollRes.data.result?.url || pollRes.data.url;
      if (!resultUrl) throw new Error("⚠️ La tarea finalizó pero no se encontró la URL de la imagen.");
      break;
    }

    await new Promise(r => setTimeout(r, pollInterval));
  }

  const resultImg = await axios.get(resultUrl, { responseType: "arraybuffer", headers: { "accept-encoding": "gzip" } });
  return Buffer.from(resultImg.data);
}
