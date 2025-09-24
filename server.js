const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./db/connectDB');
const authRoutes = require('./routes/authRoutes');        // Signup/Login/OTP
const adminRoutes = require('./routes/adminRoutes');      // Admin dashboard: students, assign batch
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');


dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ------------------ Routes ------------------ //
app.use('/auth', authRoutes);        // Student signup/login/OTP
app.use('/admin', adminRoutes); // Admin: get students, assign batch
app.use('/teacher' , teacherRoutes);
app.use('/student', studentRoutes);


// ------------------ Server ------------------ //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
