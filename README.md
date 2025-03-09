# Kurdish-Armenian-German Embassy Security System

## Overview
This project implements a secure authentication and user management system for the Kurdish-Armenian-German Embassy portal. The system includes user registration, login functionality, admin access, and multilingual support.

## Features
- Secure user authentication
- Password recovery system
- Rate limiting for login attempts
- Admin dashboard
- Multilingual support (English, Kurdish)
- Session management
- Password strength validation
- Recovery codes generation

## Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/kurdish-armenian-german-embassy.git
   cd kurdish-armenian-german-embassy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the MySQL database:
   ```sql
   CREATE DATABASE security_db;
   USE security_db;

   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(255) NOT NULL UNIQUE,
       password VARCHAR(255) NOT NULL,
       recovery_codes TEXT
   );
   ```

4. Configure database connection:
   Edit `db.js` with your MySQL credentials:
   ```javascript
   {
       host: 'localhost',
       user: 'your_username',
       password: 'your_password',
       database: 'security_db'
   }
   ```

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```

2. Access the application:
   - Main portal: `http://localhost:3000`
   - Admin login: `http://localhost:3000/admin-login.html`

## Security Features

### Password Requirements
- Minimum 10 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one special character
- At least one number
- No common patterns (abc, password, qwerty)
- No character repeated more than twice
- Minimum 8 unique characters

### Rate Limiting
- Login: 5 attempts per 15 minutes
- Signup: 3 attempts per hour
- Password recovery: 3 attempts per hour

### Admin Access
- Admin usernames must start with "AD"
- Separate authentication flow for admin users
- Protected admin dashboard

## API Endpoints

### Authentication
- `POST /signup` - User registration
- `POST /login` - User login
- `POST /admin-login` - Admin login
- `POST /generate-recovery-codes` - Generate password recovery codes

## File Structure
```
├── server.js           # Main server file
├── db.js              # Database configuration
├── auth.js            # Authentication logic
├── translations.js    # Language translations
├── public/
│   ├── styles.css     # Styling
│   ├── login.html     # Login page
│   ├── admin.html     # Admin dashboard
│   └── index.html     # Main application
```

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## Security Considerations
- All passwords are hashed using bcrypt
- Session management implemented
- Rate limiting on authentication endpoints
- SQL injection prevention using prepared statements
- XSS protection
- CSRF protection

## Dependencies
```json
{
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "body-parser": "^1.20.3",
    "express": "^4.21.2",
    "express-rate-limit": "^7.5.0",
    "express-session": "^1.18.1",
    "mysql2": "^3.12.0"
  }
}
```

## Environment Variables
The application uses the following environment variables:
- `DB_HOST` - Database host (default: localhost)
- `PORT` - Server port (default: 3000)

## Error Handling
The application includes comprehensive error handling for:
- Database connection issues
- Authentication failures
- Rate limiting violations
- Invalid input validation

## Multilingual Support
The application supports multiple languages through the translations.js file:
- English (default)
- Kurdish
- Armenian
- German

## Testing
To run tests:
```bash
npm test
```

## License
This project is licensed under the ISC License - see the LICENSE file for details.

## Support
For support, please create an issue in the repository or contact the development team.

## Authors
- Group 77 - Kurdish Armenian German Embassy Project Team

## Acknowledgments
- Express.js team for the web framework
- MySQL team for the database
- bcrypt.js team for security implementation

