const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('./')); // Serve static files from current directory

// Database error handling middleware
app.use((err, req, res, next) => {
    if (err.code === 'ECONNREFUSED') {
        console.error('Database connection was refused');
        return res.status(500).send(`Database connection error. Code: ${err.code}, Message: ${err.message}`);
    }
    next(err);
});

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { username, password, securityQuestion, securityAnswer } = req.body;
    
    try {
        // Check if username already exists
        const [users] = await db.query(
            'SELECT username FROM users WHERE username = ?', 
            [username]
        );

        if (users.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Insert new user with security question and answer
        await db.query(
            'INSERT INTO users (username, password, security_question, security_answer) VALUES (?, ?, ?, ?)',
            [username, password, securityQuestion, securityAnswer]
        );

        res.json({ message: 'Signup successful' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Error during signup' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Check credentials
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (users.length > 0) {
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
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
        // Check if username and security answer match
        const [users] = await db.query(
            'SELECT password FROM users WHERE username = ? AND security_answer = ?',
            [username, securityAnswer]
        );

        if (users.length > 0) {
            res.json({ password: users[0].password });
        } else {
            res.status(401).json({ error: 'Invalid username or security answer' });
        }
    } catch (error) {
        console.error('Password recovery error:', error);
        res.status(500).json({ error: 'Error during password recovery' });
    }
});

// Listen on all network interfaces
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
}); 