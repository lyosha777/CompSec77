const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../security.log');

// Create log file if it doesn't exist
try {
    if (!fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, '# Security Log File Created ' + new Date().toISOString() + '\n');
        console.log('Security log file created at:', LOG_FILE);
    }
} catch (error) {
    console.error('Error creating log file:', error);
}

function logSecurityEvent(type, username, details, severity = 'low', req) {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    
    const logEntry = `[${timestamp}] ${severity.toUpperCase()} - ${type} - User: ${username} - IP: ${ip} - ${details}\n`;
    
    fs.appendFile(LOG_FILE, logEntry, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}

function getLogs(filters = {}) {
    try {
        const logs = fs.readFileSync(LOG_FILE, 'utf8')
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                const match = line.match(/\[(.?)\] (\w+) - (.?) - User: (.?) - IP: (.?) - (.*)/);
                if (match) {
                    return {
                        timestamp: match[1],
                        severity: match[2],
                        event_type: match[3],
                        username: match[4],
                        ip: match[5],
                        details: match[6]
                    };
                }
                return null;
            })
            .filter(log => log !== null)
            .reverse(); // Most recent first

        // Apply filters
        let filteredLogs = logs;
        if (filters.severity) {
            filteredLogs = filteredLogs.filter(log => 
                log.severity.toLowerCase() === filters.severity.toLowerCase()
            );
        }
        if (filters.eventType) {
            filteredLogs = filteredLogs.filter(log => 
                log.event_type.includes(filters.eventType)
            );
        }
        
        return filteredLogs;
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist yet, return empty array
            return [];
        }
        throw error;
    }
}

module.exports = { logSecurityEvent, getLogs };