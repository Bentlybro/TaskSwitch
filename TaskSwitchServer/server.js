const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost:27017/taskswitch', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Todo schema and model
const todoSchema = new mongoose.Schema({
  id: String,
  text: String,
  status: String,
});

const Todo = mongoose.model('Todo', todoSchema);

app.use(cors());
app.use(bodyParser.json());

let todos = [];

app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/todos', async (req, res) => {
  const newTodo = new Todo(req.body);
  try {
    const savedTodo = await newTodo.save();
    io.emit('todosUpdated', await Todo.find());
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const updatedTodo = await Todo.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    io.emit('todosUpdated', await Todo.find());
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    await Todo.findOneAndDelete({ id: req.params.id });
    io.emit('todosUpdated', await Todo.find());
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

io.on('connection', async (socket) => {
  console.log('New client connected');
  const todos = await Todo.find();
  socket.emit('todosUpdated', todos);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});