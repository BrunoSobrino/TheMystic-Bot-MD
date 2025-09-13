/**
 *** ᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁
 *** - Dev: FongsiDev
 *** - Adaptado para WhatsApp Bot (plugin nanobanana)
 *** - Contact: t.me/dashmodz
 *** - Github: github.com/Fgsi-APIs/RestAPIs
 *** ᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁
 */

import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import fs from "fs";

function generateFakeIpHeaders() {
  const ipv4 = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  return {
    "X-Forwarded-For": ipv4,
    "X-Originating-IP": ipv4,
    "X-Remote-IP": ipv4,
    "X-Remote-Addr": ipv4,
    "X-Host": ipv4,
    "X-Forwarded-Host": ipv4,
    "X-Connecting-IP": ipv4,
    "Client-IP": ipv4,
    "X-Client-IP": ipv4,
    "CF-Connecting-IP": ipv4, // Cloudflare
    "Fastly-Client-IP": ipv4, // Fastly CDN
    "True-Client-IP": ipv4,   // Akamai / CloudFront
    "X-Real-IP": ipv4,
    Forwarded: `for=${ipv4};proto=http;by=${ipv4}`,
    "X-Cluster-Client-IP": ipv4,
    Via: `1.1 ${ipv4}`,
    Fgsi: `ap-${ipv4}`,
    "X-ProxyUser-IP": ipv4,
    "X-Forwarded-For-Original": ipv4,
    "X-Forwarded": ipv4,
    "X-Original-Forwarded-For": ipv4,
    "X-Spoofed-IP": ipv4,
  };
}

export class NanoBananaClient {
  constructor() {
    this.jar = new CookieJar();
    this.api = wrapper(
      axios.create({
        baseURL: "https://nanobanana.ai",
        headers: {
          "accept": "*/*",
          "accept-language": "en-US,en;q=0.9,id;q=0.8",
          "content-type": "application/json",
          "origin": "https://nanobanana.ai",
          "referer": "https://nanobanana.ai/",
          "user-agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
          ...generateFakeIpHeaders(),
        },
        jar: this.jar,
        withCredentials: true,
      })
    );
  }

  async initSession() {
    const res = await this.api.get("/api/auth/session");
    return res.data;
  }

  async getUploadUrl(filePath, filename = "upload.jpg") {
    const file = fs.readFileSync(filePath);
    const res = await this.api.post("/api/get-upload-url", {
      fileName: filename,
      contentType: "image/jpeg",
      fileSize: file.length,
    });
    return { ...res.data, file };
  }

  async uploadFile(uploadUrl, file, contentType = "image/jpeg") {
    await axios.put(uploadUrl, file, {
      headers: { "content-type": contentType },
    });
  }

  async generateImage(prompt, styleId, publicUrl) {
    const res = await this.api.post("/api/generate-image", {
      prompt,
      styleId,
      mode: "image",
      imageUrl: publicUrl,
      imageUrls: [publicUrl],
    });
    return res.data;
  }

  async checkStatus(taskId) {
    const res = await this.api.get("/api/generate-image/status", {
      params: { taskId },
    });
    return res.data;
  }

  async waitForResult(taskId, interval = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        try {
          const status = await this.checkStatus(taskId);
          if (status.status === "completed") {
            clearInterval(timer);
            resolve(status);
          } else if (status.status === "failed") {
            clearInterval(timer);
            reject(new Error("❌ La tarea falló"));
          }
        } catch (err) {
          clearInterval(timer);
          reject(err);
        }
      }, interval);
    });
  }
}

// Cliente listo para usar
export const nanoBanana = new NanoBananaClient();
