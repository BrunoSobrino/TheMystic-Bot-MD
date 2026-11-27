import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginsDir = path.join(__dirname, '../plugins');
const gitignorePath = path.join(__dirname, '../.gitignore');

// no es necesario verificar que exista lka carpeta plugins, ya que existe en mystic. pero puede ser util para otros bots
const ensurePluginsDirExists = () => {
  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true });
  }
};

const isValidUrl = (text) => {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
};

const readGitignore = async () => {
  if (fs.existsSync(gitignorePath)) {
    return await fs.promises.readFile(gitignorePath, 'utf-8');
  }
  return '';
};

const writeGitignore = async (content) => {
  await fs.promises.writeFile(gitignorePath, content, 'utf-8');
};

const addToGitignore = async (pluginPath, tradutor) => {
  try {
    const relativePluginPath = path.relative(path.join(__dirname, '../'), pluginPath);
    let gitignoreContent = await readGitignore();

    if (!gitignoreContent.includes(relativePluginPath)) {
      gitignoreContent += `\n${relativePluginPath}\n`;
      await writeGitignore(gitignoreContent);
      console.log(`✅ ${relativePluginPath} añadido a .gitignore`);
    }
  } catch (error) {
    throw new Error(`${tradutor.texto6}${error.message}`);
  }
};

const removeFromGitignore = async (pluginPath, tradutor) => {
  try {
    const relativePluginPath = path.relative(path.join(__dirname, '../'), pluginPath);
    let gitignoreContent = await readGitignore();

    if (gitignoreContent.includes(relativePluginPath)) {
      gitignoreContent = gitignoreContent
        .split('\n')
        .filter(line => line.trim() !== relativePluginPath)
        .join('\n');
      await writeGitignore(gitignoreContent);
      console.log(`✅ ${relativePluginPath} eliminado de .gitignore`);
    }
  } catch (error) {
    throw new Error(`${tradutor.texto6}${error.message}`);
  }
};

const downloadPlugin = async (url, pluginName, tradutor) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${tradutor.texto1}${response.statusText}`);

    const pluginPath = path.join(pluginsDir, pluginName);
    const fileStream = fs.createWriteStream(pluginPath);

    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });

    console.log(`✅ Plugin descargado: ${pluginName}`);
    return pluginPath;
  } catch (error) {
    throw new Error(`${tradutor.texto2}${error.message}`);
  }
};

const deletePlugin = async (pluginName, tradutor) => {
  const pluginPath = path.join(pluginsDir, pluginName);
  // No salir de la carpeta de plugins (path traversal con ../).
  if (path.relative(pluginsDir, pluginPath).startsWith('..')) {
    throw new Error(`Ruta no permitida: ${pluginName}`);
  }
  try {
    if (fs.existsSync(pluginPath)) {
      await removeFromGitignore(pluginPath, tradutor);
      fs.unlinkSync(pluginPath);
      console.log(`✅ Plugin ${pluginName} eliminado.`);
      return `${tradutor.texto3}${pluginName} `;
    } else {
      return `${tradutor.texto4}${pluginName}${tradutor.texto4_1}`;
    }
  } catch (error) {
    throw new Error(`${tradutor.texto5}${error.message}`);
  }
};

const handler = async (m, { text }) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.owner_installer
  if (!text) return m.reply(tradutor.texto7);

  try {
    const input = text.trim();
    ensurePluginsDirExists(); // innecesario

    if (isValidUrl(input)) {
      const pluginName = path.basename(input); 
      const pluginPath = await downloadPlugin(input, pluginName, tradutor); 
      await addToGitignore(pluginPath, tradutor); 
      m.reply(`${tradutor.texto8}${pluginName}${tradutor.texto8_1}`);
    } else {
      const result = await deletePlugin(input, tradutor); 
      m.reply(result);
    }
  } catch (error) {
    console.error("Error al procesar el comando:", error);
    const errorMessage = error.message.includes(tradutor.texto5)
      ? error.message
      : `${tradutor.texto9}${error.message}`;
    m.reply(errorMessage);
  }
};

handler.command = /^plg$/i;
handler.help = ['Instalador Plugins plg <url o nombre>'];
handler.tags = ['tools'];
handler.rowner = true; // Solo el propietario real puede usar este comando

export default handler;
