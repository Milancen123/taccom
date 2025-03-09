const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Pool } = require('pg');
const authenticateToken = require("./middlewares/authMiddleware.js");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend requests

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





app.listen(5000, () => console.log("Auth Server running on port 5000"));
