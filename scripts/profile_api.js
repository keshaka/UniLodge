const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());

// Mock student data
const student = {
    id: 1,
    name: "John Doe",
    email: "johndoe@email.com",
    phone: "+91 98765 43210",
    university: "Indian Institute of Technology",
    course: "B.Tech Computer Science",
    year: "2nd Year",
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
    preferred_room: "Single, AC",
    rentals: [
        {
            room: "Room 101",
            location: "UniLodge Central",
            start_date: "2024-01-01",
            end_date: "2024-05-30",
            status: "completed"
        },
        {
            room: "Room 305",
            location: "UniLodge North",
            start_date: "2024-06-01",
            end_date: null,
            status: "active"
        }
    ]
};

// API endpoint
app.get('/api/student/:id', (req, res) => {
    // You can add logic to return different students by id if needed
    res.json(student);
});

app.listen(PORT, () => {
    console.log(`Mock API running at http://localhost:${PORT}`);
});
