const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || '10.1.2.62',  // fallback to IP if env not set
    user: 'admin', // e.g., 'root'
    password: '', // your database password
    database: 'embassy_db'    // your new database name
});

// Test the connection
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database successfully');
});

module.exports = connection.promise(); 