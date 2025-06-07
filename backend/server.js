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

// MySQL Connection
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

// ? Add Property API
app.post('/add-property', (req, res) => {
  const {
    owner_id,
    title,
    description,
    property_type,
    price,
    address,
    capacity,
    distance_from_university,
    available,
    has_wifi,
    has_ac,
    has_kitchen,
    has_washing_machine,
    has_furniture,
    has_attached_bathroom
  } = req.body;

  const sqlProperty = `
    INSERT INTO Properties (
      owner_id, title, description, property_type, price,
      address, capacity, distance_from_university, available
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    owner_id, title, description, property_type, price,
    address, capacity || null, distance_from_university || null, available
  ];

  db.query(sqlProperty, values, (err, result) => {
    if (err) {
      console.error('Error inserting property:', err);
      return res.status(500).json({ message: 'Failed to add property' });
    }

    const property_id = result.insertId;

    const sqlAmenities = `
      INSERT INTO PropertyAmenities (
        property_id, has_wifi, has_ac, has_kitchen,
        has_washing_machine, has_furniture, has_attached_bathroom
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const amenityValues = [
      property_id,
      !!has_wifi, !!has_ac, !!has_kitchen,
      !!has_washing_machine, !!has_furniture, !!has_attached_bathroom
    ];

    db.query(sqlAmenities, amenityValues, (err) => {
      if (err) {
        console.error('Error inserting amenities:', err);
        return res.status(500).json({ message: 'Property saved but amenities failed' });
      }

      res.status(201).json({ message: 'Property added successfully' });
    });
  });
});

app.get('/rooms', (req, res) => {
  const propertySql = `
    SELECT 
      p.property_id,
      p.title,
      p.address,
      p.latitude,
      p.longitude,
      p.property_type AS type,
      p.price,
      p.capacity AS beds,
      p.available,
      p.creation_date AS datePosted,
      'Fully Furnished' AS furnishing,
      1 AS baths,
      '1200 sqft' AS area,
      pi.image_path AS image
    FROM Properties p
    LEFT JOIN PropertyImages pi ON p.property_id = pi.property_id AND pi.is_primary = 1
  `;

  const amenitiesSql = `
    SELECT 
      property_id,
      has_wifi, has_ac, has_kitchen, has_washing_machine,
      has_hot_water, has_furniture, has_attached_bathroom, has_parking
    FROM PropertyAmenities
  `;

  db.query(propertySql, (err, propertyResults) => {
    if (err) {
      console.error('Property fetch error:', err);
      return res.status(500).json({ message: 'Error fetching properties' });
    }

    db.query(amenitiesSql, (err2, amenitiesResults) => {
      if (err2) {
        console.error('Amenities fetch error:', err2);
        return res.status(500).json({ message: 'Error fetching amenities' });
      }

      const amenitiesMap = {};
      amenitiesResults.forEach(a => {
        amenitiesMap[a.property_id] = Object.entries(a)
          .filter(([key, value]) => key !== 'property_id' && value === 1)
          .map(([key]) => key.replace('has_', '').replace(/_/g, ' '));
      });

      const rooms = propertyResults.map(p => ({
        id: p.property_id,
        title: p.title,
        address: p.address,
        addressDetail: '',
        location: [p.latitude, p.longitude],
        type: p.type,
        price: p.price,
        beds: p.beds,
        baths: p.baths,
        area: p.area,
        furnishing: p.furnishing,
        availability: p.available ? 'Now' : 'Unavailable',
        nearbyLandmarks: ['University of Moratuwa'],
        image: p.image || 'assets/images/placeholder-room.jpg',
        amenities: amenitiesMap[p.property_id] || [],
        datePosted: p.datePosted
      }));

      res.json({ rooms });
    });
  });
});


app.get('/room', (req, res) => {
  res.json({ message: 'Rooms endpoint working' });
});

// ? Basic Health Check
app.get('/', (req, res) => {
  res.send('Server is running correctly!');
});

// ? Start the Server
app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
});
