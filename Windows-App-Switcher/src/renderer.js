const { ipcRenderer } = require('electron');
const { updateWindowList, displayWindows, bringWindowToFront } = require('./windowManager');
const { updateSystemInfo } = require('./systemInfo');

document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('search');
  const resultsContainer = document.getElementById('results');
  const sysInfoContainer = document.getElementById('sysInfo');
  let currentIndex = -1;
  let allWindows = [];

  // Focus the search input when the window opens
  searchInput.focus();

  // Update system info
  updateSystemInfo(sysInfoContainer);
  setInterval(() => updateSystemInfo(sysInfoContainer), 1000); // Update every second

  // Get the active windows and display them
  ipcRenderer.on('window-shown', async () => {
    allWindows = await updateWindowList();
    displayWindows(allWindows, resultsContainer, bringWindowToFront);
  });

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    currentIndex = -1;

    const filteredWindows = allWindows.filter(w => w.title.toLowerCase().includes(query));
    displayWindows(filteredWindows, resultsContainer, bringWindowToFront);
  });

  // Listen for the focus-search-input event
  ipcRenderer.on('focus-search-input', () => {
    searchInput.focus();
  });

  // Listen for the clear-search-input event
  ipcRenderer.on('clear-search-input', () => {
    searchInput.value = '';
    displayWindows(allWindows, resultsContainer, bringWindowToFront);
    currentIndex = -1;
  });

  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    const items = resultsContainer.children;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = (currentIndex + 1) % items.length;
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      updateSelection();
    } else if (e.key === 'Enter' && currentIndex !== -1) {
      e.preventDefault();
      const selectedWindow = allWindows[currentIndex];
      bringWindowToFront(selectedWindow);
    }
  });

  function updateSelection() {
    Array.from(resultsContainer.children).forEach((item, index) => {
      item.classList.toggle('selected', index === currentIndex);
    });
    if (currentIndex !== -1) {
      resultsContainer.children[currentIndex].scrollIntoView({ block: 'nearest' });
    }
  }
});