# TaskSwitch

TaskSwitch is an Electron-based application that allows users to quickly switch between open windows, manage tasks, and track time using a Pomodoro timer.

## Features

- Quick app switching: Easily search and switch between open applications
- System information display: View real-time CPU and RAM usage
- Global shortcuts: Activate various features from anywhere using keyboard shortcuts
- To-Do List: Manage tasks with a built-in to-do list
- Pomodoro Timer: Stay productive with a customizable Pomodoro timer
- Settings: Customize hotkeys and application behavior
- Cross-platform: Works on Windows, macOS, and Linux

![TaskSwitch Screenshot](https://github.com/user-attachments/assets/3bab8a86-c8ac-4841-99ec-b364a8f64006)

## Setup Guide

1. Clone the repository:
   ```
   git clone https://github.com/Bentlybro/TaskSwitch.git
   cd TaskSwitch
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the application:
   ```
   npm start
   ```

## Building the Application

To build the application for your platform, use one of the following commands:

- For all platforms: `npm run build`
- For Windows: `npm run build:win`
- For macOS: `npm run build:mac`
- For Linux: `npm run build:linux`

## Usage

1. Launch the application.
2. Use the following global shortcuts:
   - `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS): Open the App Switcher window
   - `Ctrl+Shift+T` (or `Cmd+Shift+T` on macOS): Open the To-Do List
   - `Ctrl+Shift+M` (or `Cmd+Shift+M` on macOS): Open the Pomodoro Timer
   - `Ctrl+Shift+O` (or `Cmd+Shift+O` on macOS): Open the Settings window
3. In the App Switcher window:
   - Type in the search bar to filter open applications
   - Click on an application in the list to switch to it
   - Star applications to mark them as favorites
4. In the To-Do List:
   - Add, edit, and delete tasks
   - Change task status (Todo, WIP, Done, Late)
5. In the Pomodoro Timer:
   - Start, pause, and reset the timer
   - Switch between Pomodoro, Short Break, and Long Break modes
6. In the Settings:
   - Customize hotkeys for various features
   - Set startup preferences

## Current Capabilities

- Display and filter a list of open windows
- Switch to selected windows
- Show real-time CPU and RAM usage information
- Manage tasks with a To-Do list
- Track time with a Pomodoro timer
- Customize application settings and hotkeys
- Automatically update window list and system information

## Technologies Used

- Electron
- Node.js
- HTML/CSS (with Tailwind CSS for styling)
- JavaScript

## Dependencies

- active-win: Used to retrieve information about the currently active window and list all open windows across different platforms (Windows, macOS, Linux).
- electron-store: Provides a simple persistent data storage solution for Electron apps. It's likely used to save user preferences, settings, and possibly the state of the to-do list.
- node-window-manager: A library for managing windows in Windows, macOS, and Linux. It's used to bring selected windows to the foreground when switching applications.
- ps-list: A cross-platform library to get a list of running processes. This might be used to gather additional information about running applications.
- ref-napi: A library for working with native C++ types and pointers in Node.js. It's likely a dependency for some of the other libraries that interact with the operating system at a low level.
- systeminformation: Used to retrieve detailed hardware, system and OS information. In your app, it's primarily used to get real-time CPU and RAM usage information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
