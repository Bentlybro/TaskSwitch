const { ipcRenderer } = require('electron');
const io = require('socket.io-client');

const config = {
  serverUrl: 'http://localhost:3001'
};

const socket = io(config.serverUrl);

document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todoInput');
  const todoList = document.getElementById('todoList');
  let todos = [];

  todoInput.focus();

  function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
      const todoElement = document.createElement('div');
      todoElement.classList.add('todo-item', 'mb-3');
      todoElement.innerHTML = `
        <select class="status-select p-2 rounded">
          <option value="todo" ${todo.status === 'todo' ? 'selected' : ''}>Todo</option>
          <option value="wip" ${todo.status === 'wip' ? 'selected' : ''}>WIP</option>
          <option value="done" ${todo.status === 'done' ? 'selected' : ''}>Done</option>
          <option value="late" ${todo.status === 'late' ? 'selected' : ''}>Late</option>
        </select>
        <span class="todo-text status-${todo.status} text-lg">${todo.text}</span>
        <div class="todo-actions">
          <button class="edit-btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">Edit</button>
          <button class="delete-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Delete</button>
        </div>
      `;
      todoList.appendChild(todoElement);

      const statusSelect = todoElement.querySelector('.status-select');
      statusSelect.addEventListener('change', (e) => updateStatus(todo.id, e.target.value));

      const editBtn = todoElement.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => editTodo(todoElement, todo.id));

      const deleteBtn = todoElement.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
    });
  }

  async function addTodo(text) {
    const newTodo = { id: Date.now().toString(), text, status: 'todo' };
    const response = await fetch(`${config.serverUrl}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTodo),
    });
    if (response.ok) {
      ipcRenderer.send('hide-todo-window');
    }
  }

  async function updateStatus(id, newStatus) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.status = newStatus;
      await fetch(`${config.serverUrl}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo),
      });
    }
  }

  async function editTodo(todoElement, id) {
    const span = todoElement.querySelector('span');
    const text = span.textContent;
    span.innerHTML = `
      <input type="text" class="edit-input" value="${text}">
      <button class="save-btn">Save</button>
    `;
    const input = span.querySelector('.edit-input');
    const saveBtn = span.querySelector('.save-btn');
    
    input.focus();
    
    saveBtn.addEventListener('click', async () => {
      const newText = input.value.trim();
      if (newText) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
          todo.text = newText;
          await fetch(`${config.serverUrl}/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(todo),
          });
        }
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveBtn.click();
      }
    });
  }

  async function deleteTodo(id) {
    await fetch(`${config.serverUrl}/todos/${id}`, {
      method: 'DELETE',
    });
  }

  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && todoInput.value.trim()) {
      addTodo(todoInput.value.trim());
      todoInput.value = '';
    }
  });

  socket.on('todosUpdated', (updatedTodos) => {
    todos = updatedTodos;
    renderTodos();
  });

  window.addEventListener('blur', () => {
    ipcRenderer.send('hide-todo-window');
  });
});