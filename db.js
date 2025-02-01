const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',     // your MySQL username
    password: '',     // your MySQL password
});

// Create database and tables in sequence
connection.query('CREATE DATABASE IF NOT EXISTS embassy_db', (err) => {
    if (err) {
        console.error('Error creating database:', err);
        return;
    }
    
    // Use the database
    connection.query('USE embassy_db', (err) => {
        if (err) {
            console.error('Error using database:', err);
            return;
        }

        // Create users table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        connection.query(createTableQuery, (err) => {
            if (err) {
                console.error('Error creating table:', err);
                return;
            }
            console.log('Database and tables created successfully');
        });
    });
});

module.exports = connection.promise(); 