const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const settingsForm = document.getElementById('settingsForm');
  const appSwitcherHotkeyInput = document.getElementById('appSwitcherHotkey');
  const todoHotkeyInput = document.getElementById('todoHotkey');
  const startAtLoginCheckbox = document.getElementById('startAtLogin');
  const recordAppSwitcherBtn = document.getElementById('recordAppSwitcher');
  const recordTodoBtn = document.getElementById('recordTodo');
  const pomodoroHotkeyInput = document.getElementById('pomodoroHotkey');
  const recordPomodoroBtn = document.getElementById('recordPomodoro');

  let isRecording = false;
  let currentRecordingInput = null;
  let recordedKeys = new Set();

  // Load current settings
  ipcRenderer.send('get-settings');

  ipcRenderer.on('settings', (event, settings) => {
    appSwitcherHotkeyInput.value = settings.appSwitcherHotkey || 'CommandOrControl+Shift+P';
    todoHotkeyInput.value = settings.todoHotkey || 'CommandOrControl+Shift+T';
    pomodoroHotkeyInput.value = settings.pomodoroHotkey || 'CommandOrControl+Shift+M';
    startAtLoginCheckbox.checked = settings.startAtLogin || false;
  });

  function startRecording(input) {
    isRecording = true;
    currentRecordingInput = input;
    recordedKeys.clear();
    input.value = 'Press keys...';
  }

  function stopRecording() {
    isRecording = false;
    currentRecordingInput.value = Array.from(recordedKeys).join('+');
    currentRecordingInput = null;
    recordedKeys.clear();
  }

  recordAppSwitcherBtn.addEventListener('click', () => startRecording(appSwitcherHotkeyInput));
  recordTodoBtn.addEventListener('click', () => startRecording(todoHotkeyInput));
  recordPomodoroBtn.addEventListener('click', () => startRecording(pomodoroHotkeyInput));

  document.addEventListener('keydown', (e) => {
    if (isRecording) {
      e.preventDefault();
      const key = e.key.toLowerCase();
      if (key === 'control') recordedKeys.add('Ctrl');
      else if (key === 'meta') recordedKeys.add('Cmd');
      else if (key === 'alt') recordedKeys.add('Alt');
      else if (key === 'shift') recordedKeys.add('Shift');
      else recordedKeys.add(e.key.toUpperCase());
      currentRecordingInput.value = Array.from(recordedKeys).join('+');
    }
  });

  document.addEventListener('keyup', (e) => {
    if (isRecording && recordedKeys.size > 0) {
      stopRecording();
    }
  });

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newSettings = {
      appSwitcherHotkey: appSwitcherHotkeyInput.value,
      todoHotkey: todoHotkeyInput.value,
      pomodoroHotkey: pomodoroHotkeyInput.value,
      startAtLogin: startAtLoginCheckbox.checked
    };
    ipcRenderer.send('save-settings', newSettings);
    
    // Close the settings window
    ipcRenderer.send('close-settings-window');
  });

  // Hide window when it loses focus
  window.addEventListener('blur', () => {
    ipcRenderer.send('hide-settings-window');
  });
});