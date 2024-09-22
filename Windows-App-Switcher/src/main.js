const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { Tray, Menu } = require('electron');
const fs = require('fs');

let mainWindow;
let tray = null;
let todoWindow;
let settingsWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false, // Start hidden
    frame: false, // Remove window frame
    transparent: true, // Make window transparent
    opacity: 1, // Set the opacity (0.0 to 1.0)
    alwaysOnTop: true, // Keep the window always on top
  });

  mainWindow.loadFile('src/index.html');

  // Add event listener for the show event
  mainWindow.on('show', () => {
    mainWindow.webContents.send('focus-search-input');
    mainWindow.webContents.send('clear-search-input');
    mainWindow.webContents.send('window-shown'); // Add this line
  });

  // Hide the window when it loses focus
  mainWindow.on('blur', () => {
    mainWindow.hide();
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Settings', click: () => settingsWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('App Switcher');
  tray.setContextMenu(contextMenu);
}

function createTodoWindow() {
  todoWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
    frame: false,
    transparent: true,
    opacity: 1,
    alwaysOnTop: true,
  });

  todoWindow.loadFile('src/Todo/todo.html');

  todoWindow.on('blur', () => {
    todoWindow.hide();
  });
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
    frame: false,
    transparent: true,
    opacity: 1,
    alwaysOnTop: true,
  });

  settingsWindow.loadFile('src/Settings/settings.html');

  settingsWindow.on('blur', () => {
    settingsWindow.hide();
  });
}

function updateGlobalShortcuts(newSettings) {
  globalShortcut.unregisterAll();

  const registerShortcut = (accelerator, callback) => {
    try {
      globalShortcut.register(accelerator, callback);
    } catch (error) {
      console.error(`Failed to register shortcut: ${accelerator}`, error);
    }
  };

  registerShortcut(newSettings.appSwitcherHotkey, () => {
    mainWindow.show();
    mainWindow.focus();
  });

  registerShortcut(newSettings.todoHotkey, () => {
    todoWindow.show();
    todoWindow.focus();
  });

  registerShortcut('CommandOrControl+Shift+O', () => {
    settingsWindow.show();
    settingsWindow.focus();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTodoWindow();
  createTray();

  // Initial settings
  const initialSettings = {
    appSwitcherHotkey: 'CommandOrControl+Shift+P',
    todoHotkey: 'CommandOrControl+Shift+T',
    theme: 'dark',
    startAtLogin: false
  };

  updateGlobalShortcuts(initialSettings);

  createSettingsWindow();

  // Register global shortcut for settings
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    settingsWindow.show();
    settingsWindow.focus();
  });

  // Listen for hide-settings-window event
  ipcMain.on('hide-settings-window', () => {
    settingsWindow.hide();
  });

  // Handle get-settings request
  ipcMain.on('get-settings', (event) => {
    const settings = {
      appSwitcherHotkey: 'CommandOrControl+Shift+P',
      todoHotkey: 'CommandOrControl+Shift+T',
      theme: 'dark',
      startAtLogin: false
    };
    event.reply('settings', settings);
  });

  // Handle save-settings request
  ipcMain.on('save-settings', (event, newSettings) => {
    console.log('New settings:', newSettings);
    updateGlobalShortcuts(newSettings);
    // Here you would save the settings to a file or database
    // For now, we'll just send a confirmation back to the renderer
    event.reply('settings-saved', 'Settings saved successfully');
  });

  // Handle close-settings-window request
  ipcMain.on('close-settings-window', () => {
    if (settingsWindow) {
      settingsWindow.close();
    }
  });
});



app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (tray) {
    tray.destroy();
  }
});