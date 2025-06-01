require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// ? Register API
app.post('/register', async (req, res) => {
  const { username, email, password, full_name, phone_number, user_type } = req.body;

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const registration_date = new Date();

    const sql = `INSERT INTO Users (username, email, password_hash, full_name, phone_number, user_type, registration_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [username, email, password_hash, full_name, phone_number, user_type, registration_date], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error registering user.");
      }
      res.send("User registered successfully.");
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
});

// ? Login API
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required' });

  const sql = 'SELECT * FROM Users WHERE username = ?';

  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0)
      return res.status(401).json({ message: 'Invalid username or password' });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid)
      return res.status(401).json({ message: 'Invalid username or password' });

    const token = jwt.sign(
      { user_id: user.id, username: user.username, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        user_type: user.user_type
      }
    });
  });
});

// ? Basic health check route
app.get('/', (req, res) => {
  res.send('Server is running correctly!');
});

// ? Start the server
app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
});
