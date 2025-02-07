const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('./')); // Serve static files from current directory

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Check if username already exists
        const [users] = await db.query(
            'SELECT username FROM users WHERE username = ?', 
            [username]
        );

        if (users.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Insert new user
        await db.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, password]
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

// Listen on all network interfaces
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
}); 