const { ipcRenderer } = require('electron');
const { exec } = require('child_process');
const activeWin = require('active-win');
const { windowManager } = require('node-window-manager');

document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('search');
  const resultsContainer = document.getElementById('results');
  let currentIndex = -1;

  // Focus the search input when the window opens
  searchInput.focus();

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

  // Get the active windows
  const windows = await activeWin.getOpenWindows();
  let filteredWindows = windows.filter(w => w.owner.name !== 'System');

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    resultsContainer.innerHTML = '';
    currentIndex = -1;

    const matchedWindows = filteredWindows.filter(w => w.title.toLowerCase().includes(query));
    matchedWindows.forEach((window, index) => {
      const windowElement = document.createElement('div');
      windowElement.textContent = `${window.title} (PID: ${window.owner.processId})`;
      windowElement.classList.add('p-2', 'hover:bg-gray-700', 'cursor-pointer');
      windowElement.dataset.index = index;
      windowElement.addEventListener('click', () => {
        bringWindowToFront(window);
      });
      resultsContainer.appendChild(windowElement);
    });
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
});