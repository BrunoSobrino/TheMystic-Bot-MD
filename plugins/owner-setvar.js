import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uboicaciones
const configPath = path.join(__dirname, '../config.js');
const gitignorePath = path.join(__dirname, '../.gitignore');

const ensureConfigIgnored = async () => {
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
    throw new Error(`❌ .gitignore ${error.message}`);
  }
};

const updateConfigFile = async (variable, value) => {
  try {
    let configContent = await fs.promises.readFile(configPath, 'utf-8');

    const cleanVariable = variable.replace(/^global\./, '');

    const variablePattern = new RegExp(`(^|\\n)global\\.${cleanVariable}\\s*=\\s*['"\`].*?['"\`];?`, 'm');

    const formattedValue = /^['"`].*['"]$/.test(value) ? value : `'${value}'`;

    if (variablePattern.test(configContent)) {
      configContent = configContent.replace(variablePattern, `global.${cleanVariable} = ${formattedValue};`);
    } else {
      configContent += `\nglobal.${cleanVariable} = ${formattedValue};\n`;
    }

    await fs.promises.writeFile(configPath, configContent, 'utf-8');
  } catch (error) {
    throw new Error(`❌ ${error.message}`);
  }
};

const handler = async (m, { text }) => {
  if (!text) return m.reply('❌ Ej .setvar global.groq = gsk');

  const [variable, value] = text.split('=').map(item => item.trim());

  if (!variable || !value) return m.reply('❌ Ej .setvar variable = valor');

  try {
    await ensureConfigIgnored(); 
    await updateConfigFile(variable, value); 
    m.reply(`✅ ${variable.replace(/^global\./, '')} actualizada a ${value}`);
  } catch (error) {
    console.error("❌ Error al actualizar config.js:", error);
    m.reply(`❌ ${error.message}`);
  }
};

handler.command = /^setvar$/i; 
handler.help = ['cambia ajustes'];
handler.tags = ['tools'];
handler.owner = true; 

export default handler;
