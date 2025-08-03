// dla.js
// Copyright (C) 2025 Weskerty
//
// Este programa se distribuye bajo los términos de la Licencia Pública General Affero de GNU (AGPLv3).
// Usted puede usarlo, modificarlo y redistribuirlo bajo esa licencia.
// Licencia completa: https://www.gnu.org/licenses/agpl-3.0.html

import os from 'os';
import { exec } from 'child_process';
import fs from 'fs/promises';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

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
        await execAsync('pkg update -y && pkg install fastfetch -y');
        return true;
      } else if (platform === 'linux') {
        await execAsync('sudo apt update && sudo apt install fastfetch -y');
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
      await execAsync(`curl -fsSL -o "${downloadPath}" "${downloadUrl}"`);
      
      if (platform === 'win32') {
        await execAsync(`powershell -Command "Expand-Archive -Path '${downloadPath}' -DestinationPath '${extractPath}' -Force"`);
      } else {
        await execAsync(`tar xf "${downloadPath}" -C "${extractPath}"`);
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
          await execAsync(`powershell -Command "Expand-Archive -Path '${downloadPath}' -DestinationPath '${extractPath}' -Force"`);
        } else {
          await execAsync(`tar xf "${downloadPath}" -C "${extractPath}"`);
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

  async getFastFetchPath() {
    try {
      const { stdout } = await execAsync('which fastfetch');
      if (stdout.trim()) return 'fastfetch';
    } catch {}

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

async function safeExec(command, fallbackCommand = null) {
  try {
    const { stdout } = await execAsync(command);
    return stdout.trim();
  } catch (error) {
    if (fallbackCommand) {
      try {
        const { stdout } = await execAsync(fallbackCommand);
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
  
  const sudoCheck = await safeExec('which sudo');
  versions.push(`*Sudo* ${sudoCheck ? '✅' : '✖'}`);
  
  const checks = [
    { name: 'Node.js', command: 'node -v', emoji: '🟢' },
    { name: 'NPM', command: 'npm -v', emoji: '📦' },
    { name: 'Python', command: 'python3 --version', fallback: 'python --version', emoji: '🐍' },
    { name: 'Chocolatey', command: 'choco --version', emoji: '🍫' },
    { name: 'FFmpeg', command: 'ffmpeg -version', emoji: '🎬', process: (out) => out.split('\n')[0] }
  ];
  
  const pipOutput = await safeExec('pip3 --version', 'pip --version');
  let pipVersion = '✖';
  if (pipOutput) {
    const pipMatch = pipOutput.match(/pip\s+(\d+\.\d+\.\d+)/);
    pipVersion = pipMatch ? pipMatch[1] : pipOutput;
  }
  versions.push(`📊 *PIP:* ${pipVersion}`);

  for (const check of checks) {
    const output = await safeExec(check.command, check.fallback);
    let value = output ? (check.process ? check.process(output) : output) : '✖';
    versions.push(`${check.emoji} *${check.name}:* ${value}`);
  }

  return versions.join('\n');
}

async function runSpeedtest(m, extra) {
  try {
    const speedtestPath = './src/libraries/ookla-speedtest.py';
    const { stdout, stderr } = await execAsync('python3 ' + speedtestPath + ' --secure --share');
    
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
    await extra.conn.sendMessage(m.chat, { text: '❌ Error en speedtest: ' + error.message });
  }
}

async function systemInfoPlugin(m, extra) {
  try {
    const fastFetchPath = await new FastFetchDownloader().getFastFetchPath();
    const sysInfo = await safeExec(`"${fastFetchPath}" -l none -c all`);
    
    if (sysInfo) {
      await extra.conn.sendMessage(m.chat, { text: sysInfo });
    } else {
      throw new Error('No se pudo obtener información del sistema');
    }

    const softwareVersions = await getSoftwareVersions();
    await extra.conn.sendMessage(m.chat, { text: softwareVersions });

    await runSpeedtest(m, extra);

  } catch (error) {
    console.error('Falla Plugin sysinfo:', error);
    await extra.conn.sendMessage(m.chat, { text: 'ERROR' });
  }
}

systemInfoPlugin.command = ['sysinfo', 'host']; 

export default systemInfoPlugin;
