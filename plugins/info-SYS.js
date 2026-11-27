// dla.js
// Copyright (C) 2025 Weskerty
//
// Este programa se distribuye bajo los términos de la Licencia Pública General Affero de GNU (AGPLv3).
// Usted puede usarlo, modificarlo y redistribuirlo bajo esa licencia.
// Licencia completa: https://www.gnu.org/licenses/agpl-3.0.html

import os from 'os';
import { execFile } from 'child_process';
import fs from 'fs/promises';
import fsSync from 'fs';
import util from 'util';
import path from 'path';

const execFileAsync = util.promisify(execFile);

// Solo el propietario real puede instalar o descargar binarios en el
// servidor. Antes cualquier usuario que corría .sysinfo/.host disparaba
// la instalación de paquetes (apt/pkg) y la descarga de binarios.
const isOwner = (m) => {
  const sender = m?.sender || '';
  return (global.owner || []).some(([number]) => String(number).replace(/[^0-9]/g, '') + '@s.whatsapp.net' === sender);
};

class FastFetchDownloader {
  constructor() {
    this.config = {
      binPath: path.join(process.cwd(), 'src/tmp'),
    };

    this.fastfetchBinaries = new Map([
      ['linux-x64', {
        fileName: 'fastfetch-linux-amd64.tar.gz',
        relativePath: 'fastfetch-linux-amd64/usr/bin/fastfetch',
      }],
      ['linux-arm64', {
        fileName: 'fastfetch-linux-aarch64.tar.gz',
        relativePath: 'fastfetch-linux-aarch64/usr/bin/fastfetch',
      }],
      ['win32-x64', {
        fileName: 'fastfetch-windows-amd64.zip',
        relativePath: 'fastfetch-windows-amd64/fastfetch.exe',
      }],
    ]);
  }

  getPlatformInfo() {
    let platform = os.platform();
    let arch = os.arch();

    if (platform === 'android') {
      platform = 'android';
      arch = arch === 'arm64' ? 'arm64' : 'x64';
    } else if (platform === 'linux') {
      arch = (arch === 'arm64' || arch === 'aarch64') ? 'arm64' : 'x64';
    } else if (platform === 'win32') {
      arch = 'x64';
    }

    return { platform, arch };
  }

  async tryInstallFromPackageManager() {
    const { platform } = this.getPlatformInfo();
    
    try {
      if (platform === 'android') {
        await execFileAsync('pkg', ['update', '-y']);
        await execFileAsync('pkg', ['install', 'fastfetch', '-y']);
        return true;
      } else if (platform === 'linux') {
        await execFileAsync('sudo', ['apt', 'update']);
        await execFileAsync('sudo', ['apt', 'install', 'fastfetch', '-y']);
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  async downloadAndExtractFastFetch() {
    const { platform, arch } = this.getPlatformInfo();
    const key = `${platform === 'android' ? 'linux' : platform}-${arch}`;
    const binary = this.fastfetchBinaries.get(key);

    if (!binary) {
      throw new Error(`Unsupported System: ${key}`);
    }

    await fs.mkdir(this.config.binPath, { recursive: true });
    const downloadUrl = `https://github.com/fastfetch-cli/fastfetch/releases/latest/download/${binary.fileName}`;
    const downloadPath = path.join(this.config.binPath, binary.fileName);
    const extractPath = this.config.binPath;

    try {
      await execFileAsync('curl', ['-fsSL', '-o', downloadPath, downloadUrl]);
      
      if (platform === 'win32') {
        await execFileAsync('powershell', ['-Command', `Expand-Archive -Path '${downloadPath}' -DestinationPath '${extractPath}' -Force`]);
      } else {
        await execFileAsync('tar', ['xf', downloadPath, '-C', extractPath]);
      }

      const binaryPath = path.join(this.config.binPath, binary.relativePath);
      if (platform !== 'win32') {
        await fs.chmod(binaryPath, '755');
      }

      await fs.unlink(downloadPath);
      return binaryPath;
    } catch (error) {
      try {
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(downloadPath, buffer);

        if (platform === 'win32') {
          await execFileAsync('powershell', ['-Command', `Expand-Archive -Path '${downloadPath}' -DestinationPath '${extractPath}' -Force`]);
        } else {
          await execFileAsync('tar', ['xf', downloadPath, '-C', extractPath]);
        }

        const binaryPath = path.join(this.config.binPath, binary.relativePath);
        if (platform !== 'win32') {
          await fs.chmod(binaryPath, '755');
        }

        await fs.unlink(downloadPath);
        return binaryPath;
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
  }

  async getFastFetchPath(m) {
    try {
      const { stdout } = await execFileAsync('which', ['fastfetch']);
      if (stdout.trim()) return 'fastfetch';
    } catch {}

    // Si no hay fastfetch instalado, solo el owner puede instalarlo o
    // descargarlo. Para los demás se devuelve null y el comando sigue
    // mostrando el resto de la información sin instalar nada.
    if (!isOwner(m)) return null;

    if (await this.tryInstallFromPackageManager()) {
      return 'fastfetch';
    }

    const { platform, arch } = this.getPlatformInfo();
    const key = `${platform === 'android' ? 'linux' : platform}-${arch}`;
    const binary = this.fastfetchBinaries.get(key);
    const localBinaryPath = path.join(this.config.binPath, binary.relativePath);

    try {
      await fs.access(localBinaryPath);
      return localBinaryPath;
    } catch {
      return await this.downloadAndExtractFastFetch();
    }
  }
}

async function safeExecFile(file, args, fallback = null) {
  try {
    const { stdout } = await execFileAsync(file, args);
    return stdout.trim();
  } catch (error) {
    if (fallback) {
      try {
        const { stdout } = await execFileAsync(fallback[0], fallback[1]);
        return stdout.trim();
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}

async function getSoftwareVersions() {
  const versions = [];
  
  const sudoCheck = await safeExecFile('which', ['sudo']);
  versions.push(`*Sudo* ${sudoCheck ? '✅' : '✖'}`);
  
  const checks = [
    { name: 'Node.js', file: 'node', args: ['-v'], emoji: '🟢' },
    { name: 'NPM', file: 'npm', args: ['-v'], emoji: '📦' },
    { name: 'Python', file: 'python3', args: ['--version'], fallback: ['python', ['--version']], emoji: '🐍' },
    { name: 'Chocolatey', file: 'choco', args: ['--version'], emoji: '🍫' },
    { name: 'FFmpeg', file: 'ffmpeg', args: ['-version'], emoji: '🎬', process: (out) => out.split('\n')[0] }
  ];
  
  const pipOutput = await safeExecFile('pip3', ['--version'], ['pip', ['--version']]);
  let pipVersion = '✖';
  if (pipOutput) {
    const pipMatch = pipOutput.match(/pip\s+(\d+\.\d+\.\d+)/);
    pipVersion = pipMatch ? pipMatch[1] : pipOutput;
  }
  versions.push(`📊 *PIP:* ${pipVersion}`);

  for (const check of checks) {
    const output = await safeExecFile(check.file, check.args, check.fallback);
    let value = output ? (check.process ? check.process(output) : output) : '✖';
    versions.push(`${check.emoji} *${check.name}:* ${value}`);
  }

  return versions.join('\n');
}

async function runSpeedtest(m, extra) {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fsSync.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.info_sys
  try {
    const speedtestPath = './src/libraries/ookla-speedtest.py';
    const { stdout, stderr } = await execFileAsync('python3', [speedtestPath, '--secure', '--share']);
    
    if (stdout.trim()) {
      const match = stdout.match(/http[^"]+\.png/);
      const urlImagen = match ? match[0] : null;
      await extra.conn.sendMessage(m.chat, {image: {url: urlImagen}, caption: stdout.trim()});
    }
    if (stderr.trim()) { 
      const match2 = stderr.match(/http[^"]+\.png/);
      const urlImagen2 = match2 ? match2[0] : null;    
      await extra.conn.sendMessage(m.chat, {image: {url: urlImagen2}, caption: stderr.trim()});
    }
  } catch (error) {
    await extra.conn.sendMessage(m.chat, { text: tradutor.texto1 + error.message });
  }
}

async function systemInfoPlugin(m, extra) {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fsSync.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.info_sys
  try {
    const fastFetchPath = await new FastFetchDownloader().getFastFetchPath(m);
    if (fastFetchPath) {
      const sysInfo = await safeExecFile(fastFetchPath, ['-l', 'none', '-c', 'all']);
      
      if (sysInfo) {
        await extra.conn.sendMessage(m.chat, { text: sysInfo });
      } else {
        throw new Error('No se pudo obtener información del sistema');
      }
    }

    const softwareVersions = await getSoftwareVersions();
    await extra.conn.sendMessage(m.chat, { text: softwareVersions });

    await runSpeedtest(m, extra);

  } catch (error) {
    console.error('Falla Plugin sysinfo:', error);
    await extra.conn.sendMessage(m.chat, { text: tradutor.texto2 });
  }
}

systemInfoPlugin.command = ['sysinfo'];

export default systemInfoPlugin;
