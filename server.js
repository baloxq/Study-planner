const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const auth = require('./auth');
const tasks = require('./tasks');

app.use('/api/auth', auth);
app.use('/api/tasks', tasks);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});