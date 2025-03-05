const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const db = require('./db');
const bcrypt = require('bcryptjs');
const saltRounds = 12;
const logger = require('./logger');
const { adminConfig } = require('./config');
const app = express();
const port = 3000;
const rateLimit = require('express-rate-limit');
const fs = require('fs');

// Add body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files BEFORE auth middleware
app.use(express.static(path.join(__dirname)));

// Add session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using https
}));

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
            logger.logRateLimitExceeded(req.ip, req.path);
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

// Apply auth middleware
app.use(authCheck);

// Serve login page as the default route
app.get('/', (req, res) => {
    if (req.session.isAuthenticated) {
        res.redirect('/home.html');
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Authentication middleware
function authCheck(req, res, next) {
    // Allow access to auth-related endpoints and static assets
    const publicPaths = [
        '/login',
        '/signup',
        '/signup.html',
        '/',
        '/index.html',
        '/styles.css',
        '/auth.js'
    ];

    // Check if the path is public or is a static asset
    if (publicPaths.includes(req.path) || 
        req.path.endsWith('.css') ||
        req.path.endsWith('.js') ||
        req.path.endsWith('.jpg') ||
        req.path.endsWith('.png')) {
        return next();
    }

    // Check if user is authenticated for other routes
    if (!req.session.isAuthenticated) {
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        return res.redirect('/');
    }

    next();
}

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
app.post('/signup', async (req, res) => {
    try {
        console.log('Received signup request:', req.body);
        const { username, password } = req.body;
        
        if (!username || !password) {
            console.log('Missing username or password');
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Prevent creation of admin account
        if (username.toLowerCase() === adminConfig.username.toLowerCase()) {
            logger.logSignupFailure(username, req.ip, 'Attempted to create admin account');
            return res.status(403).json({ error: 'Cannot create admin account' });
        }

        console.log('Checking if username exists:', username);
        // Check if username already exists
        const [existingUsers] = await db.execute(
            'SELECT username FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            console.log('Username already exists');
            logger.logSignupFailure(username, req.ip, 'Username already exists');
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            console.log('Password validation failed');
            logger.logPasswordValidationFailure(username, req.ip, passwordValidation.requirements);
            return res.status(400).json({ 
                error: 'Invalid password format',
                requirements: passwordValidation.requirements
            });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await db.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );
        
        console.log('User created successfully');
        logger.logSignupSuccess(username, req.ip);
        
        res.json({ 
            success: true, 
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Signup error:', error);
        logger.logSystemError(error, 'Signup endpoint');
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Login endpoint
app.post('/login', loginRateLimiter, async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Check if it's the admin account
        if (username === adminConfig.username) {
            const match = await bcrypt.compare(password, adminConfig.password);
            if (match) {
                req.session.isAuthenticated = true;
                req.session.isAdmin = true;
                req.session.username = username;
                logger.logUserLogin(username, true, req.ip);
                logger.logSessionActivity(username, 'Admin session started', req.sessionID);
                
                return res.json({ 
                    success: true,
                    message: 'Admin login successful',
                    isAdmin: true
                });
            }
            logger.logFailedLoginAttempt(username, req.ip, 'Invalid admin password');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Regular user login
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length > 0) {
            const match = await bcrypt.compare(password, users[0].password);
            
            if (match) {
                req.session.isAuthenticated = true;
                req.session.username = username;
                logger.logUserLogin(username, true, req.ip);
                logger.logSessionActivity(username, 'Session started', req.sessionID);
                
                res.json({ 
                    success: true,
                    message: 'Login successful'
                });
            } else {
                logger.logFailedLoginAttempt(username, req.ip, 'Invalid password');
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            logger.logFailedLoginAttempt(username, req.ip, 'User not found');
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        logger.logSystemError(error, 'Login endpoint');
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
        logger.logSystemError(error, 'Generate recovery codes endpoint');
        console.error('Error generating recovery codes:', error);
        res.status(500).json({ error: 'Error generating recovery codes' });
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    const username = req.session.username;
    if (username) {
        logger.logUserLogout(username);
        logger.logSessionActivity(username, 'Session ended', req.sessionID);
    }
    req.session.destroy();
    res.json({ success: true });
});

// Database error handling middleware
app.use((err, req, res, next) => {
    if (err.code === 'ECONNREFUSED') {
        console.error('Database connection was refused');
        return res.status(500).send(`Database connection error. Code: ${err.code}, Message: ${err.message}`);
    }
    next(err);
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Listen on all network interfaces
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});