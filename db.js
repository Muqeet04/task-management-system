const mysql = require('mysql2');
require('dotenv').config(); // Load .env variables

// Create MySQL connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,       // e.g., 'localhost' or cloud DB host
  user: process.env.DB_USER,       // e.g., 'root'
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME    // e.g., 'taskdb'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
    process.exit(1); // Exit app if DB connection fails
  }
  console.log('✅ Connected to MySQL database');
});

module.exports = db;

