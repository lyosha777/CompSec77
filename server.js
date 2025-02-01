const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('./')); // Serve static files from current directory

// Store credentials file path
const CREDS_FILE = 'credentials.txt';

// Create credentials file if it doesn't exist
if (!fs.existsSync(CREDS_FILE)) {
    fs.writeFileSync(CREDS_FILE, '');
}

// Signup endpoint
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    
    // Read existing credentials
    const credentials = fs.readFileSync(CREDS_FILE, 'utf8')
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => {
            const [user] = line.split(':');
            return user;
        });

    // Check if username already exists
    if (credentials.includes(username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    // Append new credentials to file
    fs.appendFileSync(CREDS_FILE, `${username}:${password}\n`);
    res.json({ message: 'Signup successful' });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Read and check credentials
    const credentials = fs.readFileSync(CREDS_FILE, 'utf8')
        .split('\n')
        .filter(line => line.length > 0);

    const isValid = credentials.some(line => {
        const [storedUser, storedPass] = line.split(':');
        return storedUser === username && storedPass === password;
    });

    if (isValid) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 