const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./db/connectDB');
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const noticeRoutes = require("./routes/noticeRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

connectDB();

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://bee-project-flgb.vercel.app"
  ],
  credentials: true,
};


app.use(cors(corsOptions));


// socket setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket"],
  credentials: true 
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);
app.use('/notices', noticeRoutes);
app.use('/analytics', analyticsRoutes);

// socket connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('registerRole', (data) => {
        if (data && data.role) {
            socket.join(data.role);
            console.log(`${data.role} joined room`);
        } else {
            console.log('Invalid role data received:', data);
        }
    });


    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
