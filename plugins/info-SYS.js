// MR. De la Comunidad para la Comunidad. Prohibida su Venta.
// El Software se proporciona bajo los términos de la Licencia MIT, excepto que usted no puede:
// 1. Vender, revender o arrendar el Software.
// 2. Cobrar a otros por el acceso, la distribución o cualquier otro uso comercial del Software.
// 3. Usar el Software como parte de un producto comercial o una oferta de servicio.

import os from 'os';
import { exec } from 'child_process';
import fs from 'fs/promises';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

class FastFetchDownloader {
  constructor() {
    this.config = {
      binPath: path.join(process.cwd(), 'media', 'bin'),
    };

    this.fastfetchBinaries = new Map([
      ['linux-x64', {
        url: 'https://github.com/fastfetch-cli/fastfetch/releases/download/2.35.0/fastfetch-linux-amd64.tar.gz',
        relativePath: 'fastfetch-linux-amd64/usr/bin/fastfetch',
      }],
      ['linux-arm64', {
        url: 'https://github.com/fastfetch-cli/fastfetch/releases/download/2.35.0/fastfetch-linux-aarch64.tar.gz',
        relativePath: 'fastfetch-linux-aarch64/usr/bin/fastfetch',
      }],
      ['win32-x64', {
        url: 'https://github.com/fastfetch-cli/fastfetch/releases/download/2.35.0/fastfetch-windows-amd64.zip',
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
    const downloadPath = path.join(this.config.binPath, path.basename(binary.url));
    const extractPath = this.config.binPath;

    try {
      await execAsync(`curl -fsSL -o "${downloadPath}" "${binary.url}"`);
      
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
      throw error;
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

  } catch (error) {
    console.error('Falla Plugin sysinfo:', error);
    await extra.conn.sendMessage(m.chat, { text: 'ERROR' });
  }
}

systemInfoPlugin.command = ['sysinfo', 'host']; 

export default systemInfoPlugin;
