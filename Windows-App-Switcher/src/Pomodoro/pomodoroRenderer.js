const { ipcRenderer } = require('electron');

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const pomodoroBtn = document.getElementById('pomodoroBtn');
const shortBreakBtn = document.getElementById('shortBreakBtn');
const longBreakBtn = document.getElementById('longBreakBtn');

let timer;
let timeLeft;
let isRunning = false;
let currentMode = 'pomodoro';

const modes = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    timer = setInterval(() => {
      timeLeft--;
      updateDisplay();
      if (timeLeft === 0) {
        clearInterval(timer);
        isRunning = false;
        ipcRenderer.send('show-notification', `${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} completed!`);
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeLeft = modes[currentMode];
  updateDisplay();
}

function setMode(mode) {
  currentMode = mode;
  timeLeft = modes[mode];
  resetTimer();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
pomodoroBtn.addEventListener('click', () => setMode('pomodoro'));
shortBreakBtn.addEventListener('click', () => setMode('shortBreak'));
longBreakBtn.addEventListener('click', () => setMode('longBreak'));

// Initialize
setMode('pomodoro');

// Hide window when it loses focus
window.addEventListener('blur', () => {
  ipcRenderer.send('hide-pomodoro-window');
});