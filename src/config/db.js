const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../../payos.sqlite');
const db = new sqlite3.Database(dbPath);

db.run(`CREATE TABLE IF NOT EXISTS ORDERS (
    orderCode VARCHAR(20) PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    phone VARCHAR(12) NOT NULL,
    email VARCHAR(255) NOT NULL,
    isPaid BOOLEAN DEFAULT FALSE,
    signature VARCHAR(255) NOT NULL
)`);

module.exports = db;
