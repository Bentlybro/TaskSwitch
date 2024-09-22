const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todoInput');
  const todoList = document.getElementById('todoList');
  let todos = JSON.parse(localStorage.getItem('todos') || '[]');

  function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
      const todoElement = document.createElement('div');
      todoElement.classList.add('flex', 'justify-between', 'items-center', 'mb-2');
      todoElement.innerHTML = `
        <span>${todo}</span>
        <button class="delete-btn" data-index="${index}">Delete</button>
      `;
      todoList.appendChild(todoElement);
    });
  }

  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && todoInput.value.trim()) {
      todos.push(todoInput.value.trim());
      todoInput.value = '';
      renderTodos();
      saveTodos();
    }
  });

  todoList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const index = parseInt(e.target.dataset.index);
      todos.splice(index, 1);
      renderTodos();
      saveTodos();
    }
  });

  renderTodos();

  // Hide window when it loses focus
  window.addEventListener('blur', () => {
    ipcRenderer.send('hide-todo-window');
  });
});