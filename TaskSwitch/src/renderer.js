const { ipcRenderer } = require('electron');
const { updateWindowList, displayWindows, bringWindowToFront, toggleFavorite, getFavorites, updateFavorites } = require('./windowManager');
const { updateSystemInfo } = require('./systemInfo');

document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('search');
  const resultsContainer = document.getElementById('results');
  const sysInfoContainer = document.getElementById('sysInfo');
  let currentIndex = -1;
  let allWindows = [];
  let favorites = getFavorites();

  // Focus the search input when the window opens
  searchInput.focus();

  // Update system info
  updateSystemInfo(sysInfoContainer);
  setInterval(() => updateSystemInfo(sysInfoContainer), 1000); // Update every second

  // Get the active windows and display them
  ipcRenderer.on('window-shown', async () => {
    allWindows = await updateWindowList();
    favorites = updateFavorites(allWindows);
    displayWindowsWithFavorites(allWindows, favorites, resultsContainer);
  });

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    currentIndex = -1;

    const filteredWindows = allWindows.filter(w => w.title.toLowerCase().includes(query));
    displayWindowsWithFavorites(filteredWindows, favorites, resultsContainer);
  });

  // Listen for the focus-search-input event
  ipcRenderer.on('focus-search-input', () => {
    searchInput.focus();
  });

  // Listen for the clear-search-input event
  ipcRenderer.on('clear-search-input', () => {
    searchInput.value = '';
    displayWindowsWithFavorites(allWindows, favorites, resultsContainer);
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

  function displayWindowsWithFavorites(windowsToDisplay, favorites, resultsContainer) {
    resultsContainer.innerHTML = '';
    
    // Display favorites first
    favorites.forEach((favorite, index) => {
      const window = windowsToDisplay.find(w => w.owner.processId === favorite.processId);
      if (window) {
        createWindowElement(window, index, true);
      }
    });

    // Display other windows
    windowsToDisplay.forEach((window, index) => {
      if (!favorites.some(fav => fav.processId === window.owner.processId)) {
        createWindowElement(window, index + favorites.length, false);
      }
    });
  }

  function createWindowElement(window, index, isFavorite) {
    const windowElement = document.createElement('div');
    windowElement.textContent = `${window.title} (PID: ${window.owner.processId})`;
    windowElement.classList.add('p-2', 'hover:bg-gray-700', 'cursor-pointer', 'flex', 'justify-between', 'items-center');
    windowElement.dataset.index = index;

    const favoriteButton = document.createElement('button');
    favoriteButton.textContent = isFavorite ? '★' : '☆';
    favoriteButton.classList.add('ml-2', 'focus:outline-none');
    favoriteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(window);
      favorites = getFavorites();
      displayWindowsWithFavorites(allWindows, favorites, resultsContainer);
    });

    windowElement.appendChild(favoriteButton);

    windowElement.addEventListener('click', () => {
      bringWindowToFront(window);
    });

    resultsContainer.appendChild(windowElement);
  }
});