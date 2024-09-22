const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todoInput');
  const todoList = document.getElementById('todoList');
  let todos = JSON.parse(localStorage.getItem('todos') || '[]');

  // Focus the input field when the window opens
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

      // Add event listeners
      const statusSelect = todoElement.querySelector('.status-select');
      statusSelect.addEventListener('change', (e) => updateStatus(index, e.target.value));

      const editBtn = todoElement.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => editTodo(todoElement, index));

      const deleteBtn = todoElement.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => deleteTodo(index));
    });
  }

  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function addTodo(text) {
    todos.push({ text, status: 'todo' });
    renderTodos();
    saveTodos();
    // Close the window after adding a todo
    ipcRenderer.send('hide-todo-window');
  }

  function updateStatus(index, newStatus) {
    todos[index].status = newStatus;
    renderTodos();
    saveTodos();
  }

  function editTodo(todoElement, index) {
    const span = todoElement.querySelector('span');
    const text = span.textContent;
    span.innerHTML = `
      <input type="text" class="edit-input" value="${text}">
      <button class="save-btn">Save</button>
    `;
    const input = span.querySelector('.edit-input');
    const saveBtn = span.querySelector('.save-btn');
    
    input.focus();
    
    saveBtn.addEventListener('click', () => {
      const newText = input.value.trim();
      if (newText) {
        todos[index].text = newText;
        renderTodos();
        saveTodos();
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveBtn.click();
      }
    });
  }

  function deleteTodo(index) {
    todos.splice(index, 1);
    renderTodos();
    saveTodos();
  }

  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && todoInput.value.trim()) {
      addTodo(todoInput.value.trim());
      todoInput.value = '';
    }
  });

  renderTodos();

  // Hide window when it loses focus
  window.addEventListener('blur', () => {
    ipcRenderer.send('hide-todo-window');
  });
});