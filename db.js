const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '10.1.2.62',     // e.g., 'localhost' or IP address
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