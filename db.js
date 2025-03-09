const mysql = require('mysql2/promise');
const credentials = require('./db.json');

const pool = mysql.createPool({
    host: credentials.ip,
    user: credentials.username,
    password: credentials.password,
    database: credentials.dbname,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.log('Error connecting to database:', err);
    });

module.exports = pool; 