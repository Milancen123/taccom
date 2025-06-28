const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Pool } = require('pg');
const authenticateToken = require("./middlewares/authMiddleware.js");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");



const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend requests
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow Next.js frontend
    methods: ["GET", "POST"],
  },
})

// Store messages per channel
const chatRooms = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins a chat channel
  socket.on("joinChannel", (channelName) => {
    socket.join(channelName);
    console.log(`User ${socket.id} joined ${channelName}`);

    // Send chat history for the channel
    if (chatRooms[channelName]) {
      socket.emit("chatHistory", chatRooms[channelName]);
    } else {
      chatRooms[channelName] = []; // Initialize if empty
    }
  });

  // Handle incoming messages
  socket.on("sendMessage", ({ channelName, message, sender, timestamp }) => {
    const chatMessage = { sender, message, timestamp, channelName };

    // Store message in the correct channel
    if (!chatRooms[channelName]) {
      chatRooms[channelName] = [];
    }
    chatRooms[channelName].push(chatMessage);

    // Broadcast only to users in the same channel
    io.to(channelName).emit("receiveMessage", chatMessage);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.get("/", authenticateToken, (req,res)=>{
    return res.status(200).send({success:true});
})


app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({ message: `Hello ${req.user.username}, you are authorized!` });
});

app.get("/api/me", authenticateToken, async (req, res) => {
  try{
    console.log("------------------------------------------------------------------");
    console.log(req.user);
    console.log("------------------------------------------------------------------\n\n\n\n");
    const result = await pool.query(
      "SELECT id, username, rank, unit, position, full_name FROM users WHERE username = $1",
      [req.user.username]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);

  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }

});

// Login User
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  const user = await pool.query('SELECT * FROM users WHERE username=$1', [username]);

  if (!user || !(await bcrypt.compare(password, user.rows[0].password))) {
    return res.status(401).send({ error: "Invalid credentials" });
}


  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});





// Protected Route
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}!` });
});





server.listen(5000, () => console.log("Auth Server running on port 5000"));
