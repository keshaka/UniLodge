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

const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/www/html/assets/images/properties'); // Folder to save images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'property-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

app.use('/assets', express.static('/var/www/html/assets'));


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
      { user_id: user.id, username: user.username, user_type: user.user_type, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        user_type: user.user_type,
        full_name: user.full_name
      }
    });
  });
});

app.post('/add-property', upload.single('image'), (req, res) => {
  const {
    title,
    address,
    latitude,
    longitude,
    property_type,
    price,
    capacity,
    available,
    owner_id,
    amenities,
    description,
    distance_from_university
  } = req.body;

  const image_path = req.file ? '/assets/images/properties/' + req.file.filename : '/assets/images/default.jpg';

  const insertPropertySql = `
    INSERT INTO Properties 
      (title, address, latitude, longitude, property_type, price, capacity, available, owner_id, description, distance_from_university, creation_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    insertPropertySql,
    [
      title,
      address,
      latitude,
      longitude,
      property_type,
      price,
      capacity,
      available,
      owner_id,
      description,
      distance_from_university
    ],
    (err, result) => {
      if (err) {
        console.error('Error inserting property:', err);
        return res.status(500).json({ message: 'Error adding property' });
      }

      const propertyId = result.insertId;

      const insertImageSql = `
        INSERT INTO PropertyImages (property_id, image_path, is_primary)
        VALUES (?, ?, 1)
      `;

      db.query(insertImageSql, [propertyId, image_path], (err2) => {
        if (err2) {
          console.error('Error inserting image:', err2);
          return res.status(500).json({ message: 'Error adding property image' });
        }

        const defaultAmenities = {
          has_wifi: 0,
          has_ac: 0,
          has_kitchen: 0,
          has_washing_machine: 0,
          has_hot_water: 0,
          has_furniture: 0,
          has_attached_bathroom: 0,
          has_parking: 0
        };

        const fullAmenities = { ...defaultAmenities, ...amenities };

        const insertAmenitiesSql = `
          INSERT INTO PropertyAmenities (
            property_id, has_wifi, has_ac, has_kitchen, has_washing_machine,
            has_hot_water, has_furniture, has_attached_bathroom, has_parking
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          insertAmenitiesSql,
          [
            propertyId,
            fullAmenities.has_wifi ? 1 : 0,
            fullAmenities.has_ac ? 1 : 0,
            fullAmenities.has_kitchen ? 1 : 0,
            fullAmenities.has_washing_machine ? 1 : 0,
            fullAmenities.has_hot_water ? 1 : 0,
            fullAmenities.has_furniture ? 1 : 0,
            fullAmenities.has_attached_bathroom ? 1 : 0,
            fullAmenities.has_parking ? 1 : 0
          ],
          (err3) => {
            if (err3) {
              console.error('Error inserting amenities:', err3);
              return res.status(500).json({ message: 'Error adding amenities' });
            }

            res.status(201).json({ message: 'Property added successfully', propertyId });
          }
        );
      });
    }
  );
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
      p.owner_id,
      p.creation_date AS datePosted,
      'Fully Furnished' AS furnishing,
      1 AS baths,
      p.distance_from_university AS distance,
      pi.image_path AS image
    FROM Properties p
    LEFT JOIN PropertyImages pi ON p.property_id = pi.property_id AND pi.is_primary = 1
    WHERE p.available = 1
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
        owner_id: p.owner_id,
        distance: p.distance,
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

app.get('/seller-dashboard/:username', (req, res) => {
  const username = req.params.username;

  const getUserSql = `SELECT user_id, username, email, full_name, phone_number FROM Users WHERE username = ? AND user_type = 'owner'`;

  db.query(getUserSql, [username], (err, userResults) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'Error fetching user' });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found or not an owner' });
    }

    const user = userResults[0];

    const getPropertiesSql = `
      SELECT property_id, title, price, available
      FROM Properties
      WHERE owner_id = ?
    `;

    db.query(getPropertiesSql, [user.user_id], (err2, properties) => {
      if (err2) {
        console.error('Error fetching properties:', err2);
        return res.status(500).json({ message: 'Error fetching properties' });
      }

      const totalProperties = properties.length;
      const availableCount = properties.filter(p => p.available === 1).length;
      const unavailableCount = totalProperties - availableCount;

      res.json({
        user: {
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          phone_number: user.phone_number
        },
        stats: {
          totalProperties,
          available: availableCount,
          unavailable: unavailableCount
        },
        properties: properties.map(p => ({
          id: p.property_id,
          title: p.title,
          price: p.price,
          status: p.available ? 'Available' : 'Unavailable'
        }))
      });
    });
  });
});

app.delete('/properties/:id', (req, res) => {
  const propertyId = req.params.id;

  // Delete related amenities and images first to maintain referential integrity
  const deleteAmenitiesSql = 'DELETE FROM PropertyAmenities WHERE property_id = ?';
  const deleteImagesSql = 'DELETE FROM PropertyImages WHERE property_id = ?';
  const deletePropertySql = 'DELETE FROM Properties WHERE property_id = ?';

  db.query(deleteAmenitiesSql, [propertyId], (err1) => {
    if (err1) {
      console.error('Error deleting amenities:', err1);
      return res.status(500).json({ message: 'Error deleting property amenities' });
    }

    db.query(deleteImagesSql, [propertyId], (err2) => {
      if (err2) {
        console.error('Error deleting images:', err2);
        return res.status(500).json({ message: 'Error deleting property images' });
      }

      db.query(deletePropertySql, [propertyId], (err3) => {
        if (err3) {
          console.error('Error deleting property:', err3);
          return res.status(500).json({ message: 'Error deleting property' });
        }

        res.status(200).json({ message: 'Property deleted successfully' });
      });
    });
  });
});

app.get('/user/:username', (req, res) => {
  const { username } = req.params;

  const sql = `SELECT username, email, full_name, phone_number FROM Users WHERE username = ?`;

  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'user not found' });
    }

    res.json(results[0]);
  });
});

app.put('/user/:username', async (req, res) => {
  const { username } = req.params;
  const { full_name, email, phone_number, current_password, new_password } = req.body;

  // First, get existing student
  const getUserSql = `SELECT * FROM Users WHERE username = ?`;
  db.query(getUserSql, [username], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'user not found' });

    const user = results[0];

    // If password update requested, check current password
    let passwordHash = user.password_hash;
    if (new_password && current_password) {
      const match = await bcrypt.compare(current_password, user.password_hash);
      if (!match) return res.status(400).json({ message: 'Incorrect current password' });
      passwordHash = await bcrypt.hash(new_password, 10);
    }

    // Update user info
    const updateSql = `
      UPDATE Users
      SET full_name = ?, email = ?, phone_number = ?, password_hash = ?
      WHERE username = ?
    `;

    db.query(updateSql, [full_name, email, phone_number, passwordHash, username], (err2) => {
      if (err2) return res.status(500).json({ message: 'Failed to update profile' });
      res.json({ message: 'Profile updated successfully' });
    });
  });
});

app.get('/inquiries/:username', (req, res) => {
  const { username } = req.params;

  // 1️⃣ Get the user and type
  const userSql = `SELECT user_id, user_type FROM Users WHERE username = ?`;
  db.query(userSql, [username], (err, userRes) => {
    if (err || userRes.length === 0) {
      console.error('User lookup failed:', err);
      return res.status(404).json({ message: 'User not found' });
    }

    const { user_id: userId, user_type: userType } = userRes[0];
    let sql, params;

    // 2️⃣ Build query based on role
    if (userType === 'student') {
      sql = `
      SELECT i.inquiry_id, i.property_id, i.message, i.inquiry_date, i.status,
            p.title AS property_title,
            u.full_name AS owner_name,
            u.phone_number AS owner_phone
      FROM Inquiries i
      JOIN Properties p ON i.property_id = p.property_id
      JOIN Users u ON i.owner_id = u.user_id
      WHERE i.student_id = ?
      ORDER BY i.inquiry_date DESC
    `;
      params = [userId];

    } else if (userType === 'owner') {
      sql = `
        SELECT i.inquiry_id, i.property_id, i.message, i.inquiry_date, i.status,
               p.title AS property_title, s.full_name AS student_name
        FROM Inquiries i
        JOIN Properties p ON i.property_id = p.property_id
        JOIN Users s ON i.student_id = s.user_id
        WHERE i.owner_id = ?
        ORDER BY i.inquiry_date DESC
      `;
      params = [userId];

    } else {
      return res.status(400).json({ message: 'Unsupported user type' });
    }

    console.log('User type:', userType);
    console.log('Running SQL:', sql);
    console.log('With params:', params);

    // 3️⃣ Execute query
    db.query(sql, params, (err2, results) => {
      if (err2) {
        console.error('Error executing inquiry query:', err2.sqlMessage || err2);
        return res.status(500).json({ message: 'Database error' });
      }


      // 4️⃣ Return inquiries, using a single field for counterparty
      const inquiries = results.map(row => ({
        inquiry_id: row.inquiry_id,
        property_id: row.property_id,
        message: row.message,
        inquiry_date: row.inquiry_date,
        status: row.status,
        property_title: row.property_title,
        counterparty_name: userType === 'student' ? row.owner_name : row.student_name,
        seller_contact: row.status === 'accepted' ? {
          name: row.owner_name,
          phone: row.owner_phone
        } : null
      }));

      res.json({ userType, inquiries });
    });
  });
});

// DELETE inquiry by ID
app.delete('/inquiries/:inquiry_id', (req, res) => {
  const { inquiry_id } = req.params;

  const sql = 'DELETE FROM Inquiries WHERE inquiry_id = ?';
  db.query(sql, [inquiry_id], (err, result) => {
    if (err) {
      console.error('Error deleting inquiry:', err);
      return res.status(500).json({ message: 'Failed to delete inquiry' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    res.json({ message: 'Inquiry deleted successfully' });
  });
});

// Accept Inquiry (Close inquiry + mark property unavailable)
app.post('/accept/:inquiryId', (req, res) => {
  const inquiryId = req.params.inquiryId;

  const getSql = 'SELECT property_id FROM Inquiries WHERE inquiry_id = ? AND status = "pending"';
  db.query(getSql, [inquiryId], (err, rows) => {
    if (err || rows.length === 0) return res.status(400).json({ message: 'Invalid inquiry' });

    const propertyId = rows[0].property_id;
    const updateInquiry = 'UPDATE Inquiries SET status = "accepted" WHERE inquiry_id = ?';
    const updateProperty = 'UPDATE Properties SET available = 0 WHERE property_id = ?';

    db.query(updateInquiry, [inquiryId], err2 => {
      if (err2) return res.status(500).json({ message: 'Error updating inquiry' });

      db.query(updateProperty, [propertyId], err3 => {
        if (err3) return res.status(500).json({ message: 'Error updating property' });

        res.json({ message: 'Inquiry accepted' });
      });
    });
  });
});

// Decline Inquiry (Only close inquiry)
app.post('/decline/:inquiryId', (req, res) => {
  const inquiryId = req.params.inquiryId;
  const updateSql = 'UPDATE Inquiries SET status = "rejected" WHERE inquiry_id = ?';
  db.query(updateSql, [inquiryId], err => {
    if (err) return res.status(500).json({ message: 'Error declining inquiry' });
    res.json({ message: 'Inquiry declined' });
  });
});

app.post('/create', (req, res) => {
  const { property_id, owner_id, student_username, message } = req.body;

  if (!property_id || !owner_id || !student_username) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const findStudent = `SELECT user_id FROM Users WHERE username = ? AND user_type = 'student'`;
  db.query(findStudent, [student_username], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: 'You need to have a student account for buying' });
    }

    const student_id = result[0].user_id;
    const insertSql = `
      INSERT INTO Inquiries (property_id, owner_id, student_id, message, status, inquiry_date)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `;
    db.query(insertSql, [property_id, owner_id, student_id, message], err2 => {
      if (err2) return res.status(500).json({ message: 'Failed to create inquiry' });
      res.json({ message: 'Inquiry created successfully' });
    });
  });
});


// ? Basic Health Check
app.get('/', (req, res) => {
  res.send('Server is running correctly!');
});

// ? Start the Server
app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
});
