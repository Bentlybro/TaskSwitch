const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { Tray, Menu } = require('electron');
const fs = require('fs');

let mainWindow;
let tray = null;
let todoWindow;

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

app.whenReady().then(() => {
  createWindow();
  createTodoWindow();
  createTray();

  // Register global shortcuts
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  globalShortcut.register('CommandOrControl+Shift+T', () => {
    todoWindow.show();
    todoWindow.focus();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      createTodoWindow();
    }
  });

  // Listen for minimize-window event
  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  // Listen for hide-window event
  ipcMain.on('hide-window', () => {
    mainWindow.hide();
  });

  // Listen for hide-todo-window event
  ipcMain.on('hide-todo-window', () => {
    todoWindow.hide();
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