// MR. De la Comunidad para la Comunidad. Prohibida su Venta.
// El Software se proporciona bajo los términos de la Licencia MIT, excepto que usted no puede:
// 1. Vender, revender o arrendar el Software.
// 2. Cobrar a otros por el acceso, la distribución o cualquier otro uso comercial del Software.
// 3. Usar el Software como parte de un producto comercial o una oferta de servicio.

import os from 'os';
import { exec } from 'child_process';

function formatUptime(uptime) {
  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / 3600) % 24);
  return `${hours} horas, ${minutes} minutos, ${seconds} segundos`;
}

function getVersions(callback) {
  exec('node -v', (err, nodeVersion) => {
    if (err) nodeVersion = '✖️';
    exec('npm -v', (err, npmVersion) => {
      if (err) npmVersion = '✖️';
      exec('ffmpeg -version', (err, ffmpegVersion) => {
        if (err) ffmpegVersion = '✖️';
        exec('python --version || python3 --version || py --version', (err, pythonVersion) => {
          if (err) pythonVersion = '✖️';
          exec('pip --version || pip3 --version', (err, pipVersion) => {
            if (err) pipVersion = '✖️';
            exec('choco -v', (err, chocoVersion) => {
              if (err) chocoVersion = '✖️';
              callback({ nodeVersion, npmVersion, ffmpegVersion, pythonVersion, pipVersion, chocoVersion });
            });
          });
        });
      });
    });
  });
}

function getStorageInfo(callback) {
  if (os.platform() === 'win32') {
    exec('wmic logicaldisk get size,freespace,caption', (err, stdout) => {
      if (err) return callback('✖️');
      const lines = stdout.trim().split('\n').slice(1);
      const storageInfo = lines.map(line => {
        const [drive, free, total] = line.trim().split(/\s+/);
        return `🖥️ ${drive}: ${(total / (1024 ** 3)).toFixed(2)} GB total, ${(free / (1024 ** 3)).toFixed(2)} GB libres`;
      }).join('\n');
      callback(storageInfo);
    });
  } else {
    exec('df -h --output=source,size,avail,target', (err, stdout) => {
      if (err) return callback('✖️');
      const lines = stdout.trim().split('\n').slice(1);
      const storageInfo = lines.map(line => {
        const [device, total, free, mount] = line.trim().split(/\s+/);
        return `🖥️ ${mount}: ${total} total, ${free} libres en ${device}`;
      }).join('\n');
      callback(storageInfo);
    });
  }
}

function getLinuxInfo(callback) {
  exec('cat /etc/os-release', (err, osInfo) => {
    if (err) osInfo = '✖️';
    callback(osInfo.trim());
  });
}

function getBatteryInfo(callback) {
  if (os.platform() === 'linux' || os.platform() === 'darwin') {
    exec('upower -i $(upower -e | grep BAT)', (err, batteryInfo) => {
      if (err) return callback('✖️');
      callback(batteryInfo);
    });
  } else if (os.platform() === 'win32') {
    exec('WMIC Path Win32_Battery Get EstimatedChargeRemaining', (err, batteryInfo) => {
      if (err) return callback('✖️');
      callback(`🔋 ${batteryInfo.trim()}%`);
    });
  } else {
    callback('✖️');
  }
}

async function systemInfoPlugin(m, extra) {
  try {
    const systemInfo = {
      platform: os.platform(),
      cpuArch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB', // Total RAM en GB
      freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB',   // RAM libre en GB
      uptime: formatUptime(os.uptime()),                             // Tiempo de actividad
      osVersion: os.release(),                                       // Versión del SO
      loadAverage: os.loadavg().map(load => load.toFixed(2)).join(', ') // Carga promedio
    };

    getVersions((versions) => {
      getBatteryInfo((batteryStatus) => {
        getStorageInfo((storageInfo) => {
          getLinuxInfo((linuxInfo) => {
            let infoMessage = `> *📊 Información del Sistema*\n\n`;
            infoMessage += `- 🌐 *Plataforma*: _${systemInfo.platform}_\n`;
            infoMessage += `- 💻 *Arquitectura CPU*: ${systemInfo.cpuArch}\n`;
            infoMessage += `- 🧠 *Núcleos CPU*: ${systemInfo.cpus}\n`;
            infoMessage += `- 🗄️ *Memoria Total*: ${systemInfo.totalMemory}\n`;
            infoMessage += `- 🗃️ *Memoria Libre*: ${systemInfo.freeMemory}\n`;
            infoMessage += `- ⏱️ *Tiempo de Actividad*: ${systemInfo.uptime}\n`;
            infoMessage += `- 📀 *Versión del SO*: ${systemInfo.osVersion}\n`;
            infoMessage += `- 📊 *Carga Promedio (1, 5, 15 min)*: ${systemInfo.loadAverage}\n`;
            infoMessage += `- 🔋 *Energia*: ${batteryStatus}\n\n`;

            infoMessage += `> *💾 Almacenamiento*\n`;
            infoMessage += `${storageInfo}\n\n`;

            infoMessage += `> *🛠️ Version Herramientas*\n\n`;
            infoMessage += `- ☕ *Node.js*: ${versions.nodeVersion.trim()}\n`;
            infoMessage += `- 📦 *NPM*: ${versions.npmVersion.trim()}\n`;
            infoMessage += `- 🎥 *FFmpeg*: ${versions.ffmpegVersion.split('\n')[0]}\n`; // Solo primera linea
            infoMessage += `- 🐍 *Python*: ${versions.pythonVersion.trim()}\n`;
            infoMessage += `- 📦 *PIP*: ${versions.pipVersion.trim()}\n`;
            infoMessage += `- 🍫 *Chocolatey*: ${versions.chocoVersion.trim()}\n\n`;

            if (os.platform() === 'linux') {
              infoMessage += `> *🐧 Distribución Linux*\n${linuxInfo}\n`;
            }

            extra.conn.sendMessage(m.chat, { text: infoMessage });
          });
        });
      });
    });
  } catch (error) {
    console.error('Falla Plugin sysinfo:', error);
    await extra.conn.sendMessage(m.chat, { text: 'ERROR' });
  }
}

systemInfoPlugin.command = ['sysinfo', 'host']; 

export default systemInfoPlugin;
