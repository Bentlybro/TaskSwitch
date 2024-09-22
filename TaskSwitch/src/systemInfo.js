const si = require('systeminformation');

const cpuHistory = [];
const ramHistory = [];
const maxHistoryLength = 10;

function drawGraph(svg, data, max) {
  const width = 50;
  const height = 20;
  const points = data.map((value, index) => 
    `${index * (width / (maxHistoryLength - 1))},${height - (value / max) * height}`
  ).join(' ');
  svg.innerHTML = `<polyline fill="none" stroke="white" stroke-width="2" points="${points}" />`;
}

async function updateSystemInfo(sysInfoContainer) {
  const cpuInfo = await si.currentLoad();
  const memInfo = await si.mem();
  
  const cpuLoad = cpuInfo.currentLoad.toFixed(1);
  const ramUsage = ((memInfo.used / memInfo.total) * 100).toFixed(1);
  
  cpuHistory.push(parseFloat(cpuLoad));
  ramHistory.push(parseFloat(ramUsage));
  
  if (cpuHistory.length > maxHistoryLength) cpuHistory.shift();
  if (ramHistory.length > maxHistoryLength) ramHistory.shift();
  
  const cpuInfoElement = sysInfoContainer.querySelector('#cpuInfo span');
  const ramInfoElement = sysInfoContainer.querySelector('#ramInfo span');
  const timeInfoElement = sysInfoContainer.querySelector('#timeInfo');
  const cpuGraph = document.getElementById('cpuGraph');
  const ramGraph = document.getElementById('ramGraph');
  
  cpuInfoElement.textContent = `CPU: ${cpuLoad}%`;
  ramInfoElement.textContent = `RAM: ${ramUsage}% (${formatBytes(memInfo.used)} / ${formatBytes(memInfo.total)})`;
  timeInfoElement.textContent = new Date().toLocaleTimeString();
  
  drawGraph(cpuGraph, cpuHistory, 100);
  drawGraph(ramGraph, ramHistory, 100);
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