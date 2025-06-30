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







const getUnreadMessagesPerChannel = async (userId) => {
  const query = `
    SELECT 
      c.id,
      c.name AS "channelName",
      COUNT(m.id) AS messages
    FROM channels c
    LEFT JOIN channel_reads cr 
      ON cr.channel_id = c.id AND cr.user_id = $1
    LEFT JOIN messages m 
      ON m.channel_id = c.id 
      AND m.created_at > COALESCE(cr.last_read_at, '1970-01-01')
    GROUP BY c.id, c.name
    ORDER BY c.id;
  `;

  try {
    const { rows } = await pool.query(query, [userId]);
    return rows; // Each row will be { id, channelName, messages }
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    throw error;
  }
};



app.get("/api/channels", authenticateToken, async (req, res) => {
  try{
    const userId = await pool.query(
      "SELECT id FROM users WHERE username= $1", [req.user.username]
    );
    console.log(userId);
    const channels = await getUnreadMessagesPerChannel(userId.rows[0]["id"]);
    res.json(channels);
  }catch(err){
    res.status(500).json({ error: 'Failed to load channels with unread messages.' });
  }
})

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


// saving messages to the database, post method

// Save a message to the messages table
app.post("/api/saveMessage/:channelName", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const { channelName } = req.params;

    if (!content || !channelName) {
      return res.status(400).json({ error: "Missing content or channel name." });
    }

    // Get the user ID from JWT payload
    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [req.user.username]
    );
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    const userId = userResult.rows[0].id;

    // Get the channel ID by name
    const channelResult = await pool.query(
      "SELECT id FROM channels WHERE name = $1",
      [channelName]
    );
    if (channelResult.rowCount === 0) {
      return res.status(404).json({ error: "Channel not found." });
    }
    const channelId = channelResult.rows[0].id;

    // Insert the message into the database
    await pool.query(
      "INSERT INTO messages (user_id, channel_id, content, created_at) VALUES ($1, $2, $3, NOW())",
      [userId, channelId, content]
    );

    //update channel_read


    return res.status(201).json({ success: true, message: "Message saved successfully." });
  } catch (err) {
    console.error("Error saving message:", err);
    return res.status(500).json({ error: "Failed to save message to the database." });
  }
});


//update channel read
app.put("/api/updateChannelRead/:channelName", authenticateToken, async (req, res) => {
  try{
    console.log("Ovde sam sada");
    const {channelName} = req.params;
    if(!channelName) return res.status(400).json({ error: "Missing content or channel name." });

    // Get the user ID from JWT payload
    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [req.user.username]
    );
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    const userId = userResult.rows[0].id;

    // Get the channel ID by name
    const channelResult = await pool.query(
      "SELECT id FROM channels WHERE name = $1",
      [channelName]
    );
    if (channelResult.rowCount === 0) {
      return res.status(404).json({ error: "Channel not found." });
    }
    const channelId = channelResult.rows[0].id;

    console.log("Ipdatejtujem sada channel read");
    await pool.query(
      `UPDATE channel_reads
       SET last_read_at = NOW()
       WHERE user_id = $1 AND channel_id = $2`,
      [userId, channelId]
    );

    return res.status(201).json({ success: true, message: "Message saved successfully." });
  }catch(error){
    console.error("Error saving message:", err);
    return res.status(500).json({ error: "Failed to save message to the database." });
  }
})



// get the unread messages from database for each channel
app.post("/api/unreadMessages/:channelName", authenticateToken, async (req, res) => {
  try {
    const { channelName } = req.params;

    // Get user ID from JWT
    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [req.user.username]
    );
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // Get channel ID
    const channelResult = await pool.query(
      "SELECT id FROM channels WHERE name = $1",
      [channelName]
    );
    if (channelResult.rowCount === 0) {
      return res.status(404).json({ error: "Channel not found" });
    }
    const channelId = channelResult.rows[0].id;

    // Get last read timestamp (or 1970-01-01 if none)
    const readResult = await pool.query(
      `SELECT last_read_at FROM channel_reads 
       WHERE user_id = $1 AND channel_id = $2`,
      [userId, channelId]
    );
    const lastRead = readResult.rows[0]?.last_read_at || new Date(0); // 1970 fallback

    // Fetch unread messages and join with user info
    const messageResult = await pool.query(
      `SELECT 
          m.id,
          m.content,
          m.created_at,
          u.id as user_id,
          u.username,
          u.full_name,
          u.rank,
          u.unit,
          u.position
       FROM messages m
       JOIN users u ON u.id = m.user_id
       WHERE m.channel_id = $1 AND m.created_at > $2
       ORDER BY m.created_at ASC`,
      [channelId, lastRead]
    );

    // Add newMessage: true to each result
    const messagesWithFlag = messageResult.rows.map(msg => ({
      ...msg,
      newMessage: true
    }));

    res.status(200).json(messagesWithFlag);
  } catch (err) {
    console.error("Error fetching unread messages:", err);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});


// get all read messages from database for particular channel
app.post("/api/readMessages/:channelName", authenticateToken, async (req, res) => {
  try {
    const { channelName } = req.params;

    // Get user ID from JWT
    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [req.user.username]
    );
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // Get channel ID by name
    const channelResult = await pool.query(
      "SELECT id FROM channels WHERE name = $1",
      [channelName]
    );
    if (channelResult.rowCount === 0) {
      return res.status(404).json({ error: "Channel not found" });
    }
    const channelId = channelResult.rows[0].id;

    // Get last read timestamp
    const readResult = await pool.query(
      `SELECT last_read_at FROM channel_reads 
       WHERE user_id = $1 AND channel_id = $2`,
      [userId, channelId]
    );
    const lastRead = readResult.rows[0]?.last_read_at || new Date(); // fallback: now = nothing read

    // Fetch messages read up to last_read_at
    const messageResult = await pool.query(
      `SELECT 
          m.id,
          m.content,
          m.created_at,
          u.id as user_id,
          u.username,
          u.full_name,
          u.rank,
          u.unit,
          u.position
       FROM messages m
       JOIN users u ON u.id = m.user_id
       WHERE m.channel_id = $1 AND m.created_at <= $2
       ORDER BY m.created_at ASC`,
      [channelId, lastRead]
    );

    const messagesWithFlag = messageResult.rows.map(msg => ({
      ...msg,
      newMessage: false
    }));

    res.status(200).json(messagesWithFlag);
  } catch (err) {
    console.error("Error fetching read messages:", err);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});


server.listen(5000, () => console.log("Auth Server running on port 5000"));
