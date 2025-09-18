/**
 * Ai Image Editing - Nano Banana (Versión Actualizada)
 * Author  : gienetic & FongsiDev
 * Base    : https://nanobanana.ai
 * Adaptado para mantener compatibilidad con img2img
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
    "CF-Connecting-IP": ipv4,
    "Fastly-Client-IP": ipv4,
    "True-Client-IP": ipv4,
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

class NanoBananaClient {
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
          "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
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

  async getUploadUrl(file, filename = "upload.jpg") {
    const fileSize = Buffer.isBuffer(file) ? file.length : file.size;
    const res = await this.api.post("/api/get-upload-url", {
      fileName: filename,
      contentType: "image/jpeg",
      fileSize: fileSize,
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

  async waitForResult(taskId, pollInterval = 5000, pollTimeout = 2 * 60 * 1000) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        try {
          // Verificar timeout
          if (Date.now() - startTime > pollTimeout) {
            clearInterval(timer);
            reject(new Error("⏳ Tiempo de espera agotado durante el polling."));
            return;
          }

          const status = await this.checkStatus(taskId);
          
          if (status.status === "completed") {
            clearInterval(timer);
            resolve(status);
          } else if (status.status === "failed") {
            clearInterval(timer);
            reject(new Error("❌ La tarea falló en el servidor."));
          }
          // Si está pending/processing, continúa el polling
        } catch (err) {
          clearInterval(timer);
          reject(new Error("❌ Error durante el polling: " + err.message));
        }
      }, pollInterval);
    });
  }
}

// Función principal compatible con tu código original
export async function img2img(imageBuffer, prompt, pollInterval = 5000, pollTimeout = 2 * 60 * 1000) {
  try {
    const client = new NanoBananaClient();
    
    // Inicializar sesión
    await client.initSession();
    
    // Generar nombre único para la imagen
    const filename = `img_${Date.now()}.jpg`;
    
    // Obtener URL de subida
    const { uploadUrl, publicUrl } = await client.getUploadUrl(imageBuffer, filename);
    
    // Subir imagen
    await client.uploadFile(uploadUrl, imageBuffer);
    
    // Generar imagen editada (usando estilo "realistic" por defecto)
    const task = await client.generateImage(prompt, "realistic", publicUrl);
    
    if (!task.taskId) {
      throw new Error("❌ No se pudo iniciar la tarea de generación de imagen.");
    }
    
    // Esperar resultado
    const result = await client.waitForResult(task.taskId, pollInterval, pollTimeout);
    
    // Verificar que tengamos una URL de resultado
    const resultUrl = result.result?.url || result.imageUrl || result.url;
    if (!resultUrl) {
      throw new Error("⚠️ La tarea finalizó pero no se encontró la URL de la imagen.");
    }
    
    // Descargar la imagen resultado
    const resultImg = await axios.get(resultUrl, { 
      responseType: "arraybuffer",
      headers: { 
        "accept-encoding": "gzip",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36"
      }
    });
    
    return Buffer.from(resultImg.data);
    
  } catch (error) {
    // Manejo de errores más descriptivo
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 429) {
        throw new Error("❌ Límite de solicitudes excedido. Intenta más tarde.");
      } else if (status === 401 || status === 403) {
        throw new Error("❌ Error de autenticación. El servicio puede requerir registro.");
      } else {
        throw new Error(`❌ Error del servidor (${status}): ${JSON.stringify(data)}`);
      }
    } else {
      throw error;
    }
  }
}

// Función auxiliar para usar con archivos (opcional)
export async function img2imgFromFile(filePath, prompt, pollInterval = 5000, pollTimeout = 2 * 60 * 1000) {
  const imageBuffer = fs.readFileSync(filePath);
  return img2img(imageBuffer, prompt, pollInterval, pollTimeout);
}
