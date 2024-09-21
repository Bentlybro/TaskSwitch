const { ipcRenderer } = require('electron');
const activeWin = require('active-win');
const { windowManager } = require('node-window-manager');
const si = require('systeminformation');
const os = require('os');

document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('search');
  const resultsContainer = document.getElementById('results');
  const sysInfoContainer = document.getElementById('sysInfo');
  let currentIndex = -1;
  let filteredWindows = [];

  // Focus the search input when the window opens
  searchInput.focus();

  // Update system info
  updateSystemInfo();
  setInterval(updateSystemInfo, 1000); // Update every second

  // Get the active windows and display them
  async function updateWindowList() {
    const windows = await activeWin.getOpenWindows();
    filteredWindows = windows.filter(w => w.owner.name !== 'System');
    displayWindows(filteredWindows);
  }

  // Call updateWindowList when the window is shown
  ipcRenderer.on('window-shown', updateWindowList);

  function displayWindows(windowsToDisplay) {
    resultsContainer.innerHTML = '';
    windowsToDisplay.forEach((window, index) => {
      const windowElement = document.createElement('div');
      windowElement.textContent = `${window.title} (PID: ${window.owner.processId})`;
      windowElement.classList.add('p-2', 'hover:bg-gray-700', 'cursor-pointer');
      windowElement.dataset.index = index;
      windowElement.addEventListener('click', () => {
        bringWindowToFront(window);
      });
      resultsContainer.appendChild(windowElement);
    });
  }

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    currentIndex = -1;

    const matchedWindows = filteredWindows.filter(w => w.title.toLowerCase().includes(query));
    displayWindows(matchedWindows);
  });

  function bringWindowToFront(window) {
    console.log(`Attempting to bring window to front: ${window.title} (PID: ${window.owner.processId})`);
    
    const windows = windowManager.getWindows();
    const windowToFocus = windows.find(w => w.processId === window.owner.processId);
    
    if (windowToFocus) {
      console.log(`Found window: ${windowToFocus.getTitle()} (PID: ${windowToFocus.processId})`);
      windowToFocus.bringToTop();
      
      // Hide the main window instead of minimizing
      ipcRenderer.send('hide-window');
    } else {
      console.log(`Window not found for PID: ${window.owner.processId}`);
    }
  }

  async function updateSystemInfo() {
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

  // Listen for the focus-search-input event
  ipcRenderer.on('focus-search-input', () => {
    searchInput.focus();
  });

  // Listen for the clear-search-input event
  ipcRenderer.on('clear-search-input', () => {
    searchInput.value = '';
    resultsContainer.innerHTML = '';
    currentIndex = -1;
  });
});