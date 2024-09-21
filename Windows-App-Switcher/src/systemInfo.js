const si = require('systeminformation');

async function updateSystemInfo(sysInfoContainer) {
  const cpu = await si.currentLoad();
  const mem = await si.mem();
  
  sysInfoContainer.innerHTML = `
    CPU: ${cpu.currentLoad.toFixed(1)}% | 
    RAM: ${((mem.used / mem.total) * 100).toFixed(1)}% (${formatBytes(mem.used)} / ${formatBytes(mem.total)})
  `;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = {
  updateSystemInfo,
  formatBytes
};