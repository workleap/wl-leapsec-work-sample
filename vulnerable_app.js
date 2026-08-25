// User service API — review for security issues
const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'userdb'
});

const JWT_SECRET = 'my-super-secret-key-123';

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = '" + username +
                "' AND password = '" + password + "'";

  db.query(query, (err, results) => {
    if (err) return res.status(500).send('DB error');
    if (results.length > 0) {
      const token = jwt.sign({ userId: results[0].id, role: results[0].role }, JWT_SECRET);
      res.json({ token });
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
});

// Get user profile by id
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;

  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).send('DB error');
    res.json(results[0]);
  });
});

// Update user role (admin action)
app.post('/users/:id/role', (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId], (err) => {
    if (err) return res.status(500).send('DB error');
    res.send('Role updated');
  });
});

// File download endpoint
app.get('/files', (req, res) => {
  const fileName = req.query.name;

  const filePath = './uploads/' + fileName;
  fs.readFile(filePath, (err, data) => {
    if (err) return res.status(404).send('File not found');
    res.send(data);
  });
});

// Search users
app.get('/search', (req, res) => {
  const term = req.query.q;

  res.send('<html><body><h1>Results for: ' + term + '</h1></body></html>');
});

app.listen(3000, () => console.log('Server running on port 3000'));
