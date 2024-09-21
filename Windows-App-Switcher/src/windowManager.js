const activeWin = require('active-win');
const { windowManager } = require('node-window-manager');
const { ipcRenderer } = require('electron');

async function updateWindowList() {
  const windows = await activeWin.getOpenWindows();
  return windows.filter(w => w.owner.name !== 'System');
}

function displayWindows(windowsToDisplay, resultsContainer, bringWindowToFront) {
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

function bringWindowToFront(window) {
  console.log(`Attempting to bring window to front: ${window.title} (PID: ${window.owner.processId})`);
  
  const windows = windowManager.getWindows();
  const windowToFocus = windows.find(w => w.processId === window.owner.processId);
  
  if (windowToFocus) {
    console.log(`Found window: ${windowToFocus.getTitle()} (PID: ${windowToFocus.processId})`);
    windowToFocus.bringToTop();
    
    ipcRenderer.send('hide-window');
  } else {
    console.log(`Window not found for PID: ${window.owner.processId}`);
  }
}

module.exports = {
  updateWindowList,
  displayWindows,
  bringWindowToFront
};