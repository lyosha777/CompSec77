const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, 'logs');
        this.userLogFile = path.join(this.logDir, 'user_activity.log');
        this.securityLogFile = path.join(this.logDir, 'security.log');
        
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }
    }

    formatLogMessage(type, message, details = {}) {
        const timestamp = new Date().toISOString();
        const formattedDetails = Object.entries(details)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
        return `[${timestamp}] [${type}] ${message} ${formattedDetails}\n`;
    }

    appendToLog(filePath, message) {
        fs.appendFileSync(filePath, message);
    }

    // User activity logging
    logUserLogin(username, success, ipAddress) {
        const message = this.formatLogMessage('LOGIN', 
            success ? 'Successful login' : 'Failed login attempt',
            { username, ipAddress, success }
        );
        this.appendToLog(this.userLogFile, message);
    }

    logUserLogout(username) {
        const message = this.formatLogMessage('LOGOUT', 
            'User logged out',
            { username }
        );
        this.appendToLog(this.userLogFile, message);
    }

    logUserCreation(username, email) {
        const message = this.formatLogMessage('CREATE_USER',
            'New user account created',
            { username, email }
        );
        this.appendToLog(this.userLogFile, message);
    }

    logPasswordReset(username, method) {
        const message = this.formatLogMessage('PASSWORD_RESET',
            'Password reset requested',
            { username, method }
        );
        this.appendToLog(this.userLogFile, message);
    }

    logSignupSuccess(username, ipAddress) {
        const message = this.formatLogMessage('SIGNUP_SUCCESS',
            'User signup successful',
            { username, ipAddress }
        );
        this.appendToLog(this.securityLogFile, message);
    }

    logSignupFailure(username, ipAddress, reason) {
        const message = this.formatLogMessage('SIGNUP_FAILURE',
            'User signup failed',
            { username, ipAddress, reason }
        );
        this.appendToLog(this.securityLogFile, message);
    }

    logPasswordValidationFailure(username, ipAddress, requirements) {
        const message = this.formatLogMessage('PASSWORD_VALIDATION',
            'Password validation failed',
            { username, ipAddress, requirements: JSON.stringify(requirements) }
        );
        this.appendToLog(this.securityLogFile, message);
    }

    logFailedLoginAttempt(username, ipAddress, reason) {
        const message = this.formatLogMessage('SECURITY',
            'Failed login attempt',
            { 
                username, 
                ipAddress, 
                reason,
                timestamp: new Date().toISOString(),
                attempt_count: this.getFailedAttemptCount(username, ipAddress)
            }
        );
        this.appendToLog(this.securityLogFile, message);
    }

    getFailedAttemptCount(username, ipAddress) {
        try {
            const logs = fs.readFileSync(this.securityLogFile, 'utf8');
            const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            return logs.split('\n')
                .filter(line => {
                    if (!line.includes(username) || !line.includes(ipAddress)) return false;
                    const match = line.match(/\[(.*?)\]/);
                    if (!match) return false;
                    const logTime = new Date(match[1]);
                    return logTime > last24Hours;
                })
                .length;
        } catch (error) {
            console.error('Error counting failed attempts:', error);
            return 0;
        }
    }

    logSessionActivity(username, action, sessionId) {
        const message = this.formatLogMessage('SESSION',
            action,
            { username, sessionId }
        );
        this.appendToLog(this.securityLogFile, message);
    }

    logRateLimitExceeded(ipAddress, endpoint) {
        const message = this.formatLogMessage('RATE_LIMIT',
            'Rate limit exceeded',
            { ipAddress, endpoint }
        );
        this.appendToLog(this.securityLogFile, message);
    }

    logSystemError(error, context) {
        const message = this.formatLogMessage('ERROR',
            'System error occurred',
            { 
                error: error.message,
                stack: error.stack,
                context 
            }
        );
        this.appendToLog(this.securityLogFile, message);
    }
}

module.exports = new Logger();
