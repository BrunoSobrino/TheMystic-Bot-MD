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

export async function img2img(imageBuffer, prompt) {
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

  if (!uploadRes.data.success) {
    throw new Error("❌ Error al subir la imagen: " + JSON.stringify(uploadRes.data));
  }

  const resultUrl = uploadRes.data.result?.url || uploadRes.data.url;

  if (!resultUrl) {
    throw new Error("⚠️ No se encontró la URL de la imagen en la respuesta.");
  }

  return resultUrl;
}
