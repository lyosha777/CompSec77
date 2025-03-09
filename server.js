const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const db = require('./db');
const bcrypt = require('bcryptjs');
const saltRounds = 12;
const app = express();
const port = 3000;
const rateLimit = require('express-rate-limit');
const { logSecurityEvent, getLogs } = require('./utils/logger');

// Log server start
logSecurityEvent(
    'SERVER_START',
    'SYSTEM',
    'Server initialized',
    'info',
    { ip: '127.0.0.1', connection: { remoteAddress: '127.0.0.1' } }
);

// Add session middleware before other middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using https
}));

// Middleware
app.use(bodyParser.json());

// Create limiters
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts
    message: { error: 'Too many signup attempts. Please try again after 1 hour.' }
});

const passwordRecoveryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts
    message: { error: 'Too many password recovery attempts. Please try again after 1 hour.' }
});

const loginAttempts = new Map();

function loginRateLimiter(req, res, next) {
    const { username } = req.body;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    if (loginAttempts.has(username)) {
        const attempts = loginAttempts.get(username);
        if (attempts.length >= maxAttempts && now - attempts[0] < windowMs) {
            return res.status(429).json({ error: 'Too many login attempts. Please try again after 15 minutes.' });
        }
        attempts.push(now);
        if (attempts.length > maxAttempts) {
            attempts.shift();
        }
    } else {
        loginAttempts.set(username, [now]);
    }

    next();
}

// Serve login page as the default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Authentication middleware
const authCheck = (req, res, next) => {
    const publicPaths = ['/login.html', '/auth.js', '/styles.css', '/translations.js', '/language.js'];
    if (publicPaths.includes(req.path) || req.path.startsWith('/login') || req.path.startsWith('/signup')) {
        return next();
    }

    if (req.path.startsWith('/admin')) {
        const isAuthenticated = req.session && req.session.isAuthenticated;
        const username = req.session.username;
        if (!isAuthenticated || !username || username != 'admin') {
            return res.redirect('/login.html');
        }
    } else {
        const isAuthenticated = req.session && req.session.isAuthenticated;
        if (!isAuthenticated) {
            return res.redirect('/login.html');
        }
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

// Password validation function
function validatePassword(password) {
    // Minimum length check
    const minLength = password.length >= 10;
    
    // Character type checks
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    // Additional security checks
    const noCommonPatterns = !/(abc|password|qwerty)/i.test(password);
    const noRepeatingChars = !/(.)\1{2,}/.test(password); // No character repeated more than twice
    const hasMinimumUniqueChars = new Set(password).size >= 8; // At least 8 unique characters
    
    const requirements = {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasSpecialChar,
        hasNumber,
        noCommonPatterns,
        noRepeatingChars,
        hasMinimumUniqueChars
    };

    const isValid = Object.values(requirements).every(req => req);
    
    return { isValid, requirements };
}

// Generate recovery codes
function generateRecoveryCodes(count) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push(code);
    }
    return codes;
}

// Signup endpoint
app.post('/signup', signupLimiter, async (req, res) => {
    const { username, password } = req.body;
    
    // Validate password on server side
    const { isValid, requirements } = validatePassword(password);
    if (!isValid) {
        return res.status(400).json({ error: 'Password does not meet requirements', requirements });
    }

    try {
        // Check if username exists
        const [users] = await db.execute(
            'SELECT username FROM users WHERE username = ?', 
            [username]
        );

        if (users.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user with hashed password
        await db.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        res.json({ message: 'Signup successful' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Error during signup' });
    }
});

// Login endpoint
app.post('/login', loginRateLimiter, async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', username);
    
    try {
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length > 0) {
            const match = await bcrypt.compare(password, users[0].password);
            
            if (match) {
                logSecurityEvent('LOGIN_SUCCESS', username, 'Successful login attempt', 'info', req);
                const token = Math.random().toString(36).substring(7);
                req.session.isAuthenticated = true;
                req.session.username = username;
                res.json({ 
                    success: true, 
                    token: token,
                    isAdmin: username == 'admin',
                    message: 'Login successful'
                });
            } else {
                logSecurityEvent('LOGIN_FAILED', username, 'Failed login attempt', 'warning', req);
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        logSecurityEvent('LOGIN_ERROR', username, 'Error during login: ' + error.message, 'high', req);
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error during login' });
    }
});

// Generate new recovery codes endpoint
app.post('/generate-recovery-codes', async (req, res) => {
    const { username } = req.body;

    try {
        const newRecoveryCodes = generateRecoveryCodes(5);

        await db.execute(
            'UPDATE users SET recovery_codes = ? WHERE username = ?',
            [JSON.stringify(newRecoveryCodes), username]
        );

        res.json({ recoveryCodes: newRecoveryCodes });
    } catch (error) {
        console.error('Error generating recovery codes:', error);
        res.status(500).json({ error: 'Error generating recovery codes' });
    }
});

// Admin page endpoint
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Admin login endpoint
app.post('/admin-login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    // Check if the username starts with "AD"
    if (username != 'admin') {
        logSecurityEvent('ADMIN_LOGIN_FAILED', username, 'Non-admin username attempted admin login', 'high', req);
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    try {
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length > 0) {
            const match = await bcrypt.compare(password, users[0].password);
            if (match) {
                logSecurityEvent('ADMIN_LOGIN_SUCCESS', username, 'Successful admin login attempt', 'info', req);
                req.session.isAdminAuthenticated = true;
                req.session.username = username;
                res.json({ success: true, message: 'Admin login successful' });
            } else {
                res.status(401).json({ error: 'Invalid admin credentials' });
            }
        } else {
            res.status(401).json({ error: 'Invalid admin credentials' });
        }
    } catch (error) {
        logSecurityEvent('ADMIN_LOGIN_ERROR', username, 'Error during admin login: ' + error.message, 'high', req);
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Error during admin login' });
    }
});

// Listen on all network interfaces
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});