import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uboicaciones
const configPath = path.join(__dirname, '../config.js');
const gitignorePath = path.join(__dirname, '../.gitignore');

const ensureConfigIgnored = async (tradutor) => {
  try {
    let gitignoreContent = '';

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = await fs.promises.readFile(gitignorePath, 'utf-8');
    }

    if (!gitignoreContent.includes('config.js')) {
      gitignoreContent += '\nconfig.js\n';
      await fs.promises.writeFile(gitignorePath, gitignoreContent, 'utf-8');
      console.log('✅ config.js añadido a .gitignore');
    }
  } catch (error) {
    throw new Error(`${tradutor.texto1}${error.message}`);
  }
};

const updateConfigFile = async (variable, value, tradutor) => {
  try {
    let configContent = await fs.promises.readFile(configPath, 'utf-8');

    const cleanVariable = variable.replace(/^global\./, '');
    const safeVariable = cleanVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const variablePattern = new RegExp(`(^|\\n)global\\.${safeVariable}\\s*=\\s*['"\`].*?['"\`];?`, 'm');

    const formattedValue = /^['"`].*['"]$/.test(value) ? value : `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

    if (variablePattern.test(configContent)) {
      configContent = configContent.replace(variablePattern, `global.${cleanVariable} = ${formattedValue};`);
    } else {
      configContent += `\nglobal.${cleanVariable} = ${formattedValue};\n`;
    }

    await fs.promises.writeFile(configPath, configContent, 'utf-8');
  } catch (error) {
    throw new Error(`${tradutor.texto2}${error.message}`);
  }
};

const handler = async (m, { text }) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.owner_setvar
  if (!text) return m.reply(tradutor.texto3);

  const [variable, value] = text.split('=').map(item => item.trim());

  if (!variable || !value) return m.reply(tradutor.texto4);

  try {
    await ensureConfigIgnored(tradutor); 
    await updateConfigFile(variable, value, tradutor); 
    m.reply(`${tradutor.texto5}${variable.replace(/^global\./, '')}${tradutor.texto5_1}${value}`);
  } catch (error) {
    console.error("❌ Error al actualizar config.js:", error);
    m.reply(`${tradutor.texto2}${error.message}`);
  }
};

handler.command = /^setvar$/i; 
handler.help = ['setvar'];
handler.tags = ['tools'];
handler.rowner = true; 

export default handler;
