const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./db/connectDB');
const authRoutes = require('./routes/authRoutes');        
const adminRoutes = require('./routes/adminRoutes');      
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');


dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/auth', authRoutes);       
app.use('/admin', adminRoutes); 
app.use('/teacher' , teacherRoutes);
app.use('/student', studentRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
