import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs, createWriteStream, createReadStream } from 'fs';
import { promisify } from 'util';
import { google } from 'googleapis';
import { EventEmitter } from 'events'; // Falta importar EventEmitter
import { pipeline } from 'stream/promises'; // Para descargas seguras

// Solución para usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SCOPE modificado para permitir lectura (descarga) y escritura (subida)
const SCOPES = ['https://www.googleapis.com/auth/drive']; 
const TOKEN_PATH = join(__dirname, '..', 'token.json');

class GoogleAuth extends EventEmitter {
  constructor() {
    super();
    this.oAuth2Client = null; // Guardamos el cliente aquí para usarlo en las llamadas a la API
  }

  // Añadimos 'port' como parámetro por defecto (ej. 3000)
  async authorize(credentials, port = 3000) {
    let token;
    const { client_secret, client_id } = credentials;
    this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, `http://localhost:${port}`);
    
    try {
      // Intentamos leer el token existente
      const tokenData = await fs.readFile(TOKEN_PATH, 'utf-8');
      token = JSON.parse(tokenData);
    } catch (e) {
      // Si no hay token, iniciamos el flujo de autorización
      const authUrl = this.oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      
      this.emit('auth', authUrl);
      
      // Esperamos a que el usuario introduzca el código y llame a this.token(code)
      const code = await promisify(this.once).bind(this)('token');
      
      // Intercambiamos el código por los tokens
      const { tokens } = await this.oAuth2Client.getToken(code);
      token = tokens;
      await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    } finally {
      this.oAuth2Client.setCredentials(token);
    }
  }

  token(code) {
    this.emit('token', code);
  }
}

class GoogleDrive extends GoogleAuth {
  constructor() {
    super();
  }

  // Getter para inicializar rápidamente la instancia de Drive
  get driveApi() {
    if (!this.oAuth2Client) throw new Error("Cliente no autenticado. Llama a authorize() primero.");
    return google.drive({ version: 'v3', auth: this.oAuth2Client });
  }

  // Google Drive usa IDs, no rutas. Este método busca una carpeta por su nombre y devuelve su ID.
  async getFolderID(folderName) {
    const res = await this.driveApi.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    return res.data.files.length > 0 ? res.data.files[0].id : null;
  }

  // Obtiene metadatos de un archivo (nombre, tamaño, tipo, link web)
  async infoFile(fileId) {
    const res = await this.driveApi.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size, webViewLink, webContentLink',
    });
    return res.data;
  }

  // Lista los archivos dentro de una carpeta específica usando su ID
  async folderList(folderId) {
    const res = await this.driveApi.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, size)',
    });
    return res.data.files;
  }

  // Descarga un archivo desde Drive y lo guarda en tu servidor (destPath)
  async downloadFile(fileId, destPath) {
    const res = await this.driveApi.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' } // Importante para archivos grandes
    );
    
    const dest = createWriteStream(destPath);
    await pipeline(res.data, dest);
    return destPath;
  }

  // Sube un archivo local de tu servidor a Google Drive
  async uploadFile(filePath, folderId = null, mimeType = 'application/octet-stream') {
    const fileName = filePath.split('/').pop() || filePath.split('\\').pop(); // Extrae el nombre del archivo de la ruta local
    
    const fileMetadata = { name: fileName };
    if (folderId) {
      fileMetadata.parents = [folderId]; // Si pasas un ID de carpeta, lo mete ahí
    }

    const media = {
      mimeType: mimeType,
      body: createReadStream(filePath),
    };

    const res = await this.driveApi.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });
    
    return res.data; // Devuelve la info del archivo recién subido
  }
}

export {
  GoogleAuth,
  GoogleDrive,
};
