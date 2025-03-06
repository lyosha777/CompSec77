const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const db = require('./db');
const app = express();
const port = 3000;

// Add this near the top with other requires
const mysql = require('mysql2/promise');

// Update the database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: 'root',
    password: '', // Add your database password here
    database: 'embassy_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Add session middleware before other middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using https
}));

// Middleware
app.use(bodyParser.json());

// Serve login page as the default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Authentication middleware
const authCheck = (req, res, next) => {
    // Allow access to login-related files
    const publicPaths = ['/login.html', '/auth.js', '/styles.css', '/translations.js', '/language.js', '/admin'];
    if (publicPaths.includes(req.path) || req.path.startsWith('/login') || req.path.startsWith('/signup')) {
        return next();
    }
    
    // Check for authentication
    const isAuthenticated = req.session && req.session.isAuthenticated;
    if (!isAuthenticated) {
        return res.redirect('/login.html');
    }
    next();
};

// Apply auth check to all routes except login
app.use(authCheck);

// Serve static files after auth check
app.use(express.static(__dirname));

// Database error handling middleware
app.use((err, req, res, next) => {
    if (err.code === 'ECONNREFUSED') {
        console.error('Database connection was refused');
        return res.status(500).send(`Database connection error. Code: ${err.code}, Message: ${err.message}`);
    }
    next(err);
});

// Add this before your routes to ensure the users table exists
async function initializeDatabase() {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                security_question VARCHAR(255),
                security_answer VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { username, password, securityQuestion, securityAnswer } = req.body;
    
    try {
        // Check if username exists
        const [existingUsers] = await pool.execute(
            'SELECT username FROM users WHERE username = ?', 
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Insert new user
        await pool.execute(
            'INSERT INTO users (username, password, security_question, security_answer) VALUES (?, ?, ?, ?)',
            [username, password, securityQuestion, securityAnswer]
        );

        console.log('User created successfully:', username);
        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            error: 'Error during signup',
            details: error.message 
        });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', username);
    
    try {
        // First check if user exists
        const [userExists] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (userExists.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Then check password with SQL injection vulnerability
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ? AND password = "'+password+'"',
            [username]
        );

        if (users.length > 0) {
            const token = Math.random().toString(36).substring(7);
            req.session.isAuthenticated = true;
            res.json({ 
                success: true, 
                token: token,
                message: 'Login successful'
            });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error during login' });
    }
});

// Password recovery endpoint
app.post('/recover-password', async (req, res) => {
    const { username, securityAnswer } = req.body;
    
    try {
        const [users] = await db.execute(
            'SELECT password FROM users WHERE username = ? AND security_answer = ?',
            [username, securityAnswer]
        );

        if (users.length > 0) {
            res.json({ password: users[0].password });
        } else {
            res.status(401).json({ error: 'Invalid username or security answer' });
        }
    } catch (error) {
        console.error('Recovery error:', error);
        res.status(500).json({ error: 'Error during password recovery' });
    }
});

// Admin page endpoint
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Call initializeDatabase when the server starts
initializeDatabase().catch(console.error);

// Listen on all network interfaces
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});