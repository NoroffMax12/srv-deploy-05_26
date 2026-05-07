
// Sets up connection pool to DB on Aiven
const mysql = require('mysql2/promise')
require('dotenv').config();

const pool = mysql.createPool({ // NTS: Pool resuses connections instead of creating new ones for each req.
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true } // mandatory by Aiven
});

