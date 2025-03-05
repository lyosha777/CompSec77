// Function to show/hide login/signup forms
function showTab(tabName) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    if (tabName === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

// Function to handle authentication
async function authenticate(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('authToken', data.token);
            if (data.isAdmin) {
                localStorage.setItem('isAdminAuthenticated', 'true');
            }
            window.location.href = 'home.html';
        } else {
            alert(data.error || 'Invalid username or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error during login. Please try again.');
    }
}

// Function to handle signup
async function signup(event) {
    event.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        console.log('Sending signup request...');
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        console.log('Got response:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            alert('Account created successfully! Please log in.');
            window.location.href = '/';
        } else {
            if (data.requirements) {
                // Show specific password requirements that weren't met
                let errorMessage = 'Password must have:\n';
                if (!data.requirements.minLength) errorMessage += '- Minimum 10 characters\n';
                if (!data.requirements.hasUpperCase) errorMessage += '- At least one uppercase letter\n';
                if (!data.requirements.hasLowerCase) errorMessage += '- At least one lowercase letter\n';
                if (!data.requirements.hasSpecialChar) errorMessage += '- At least one special character\n';
                if (!data.requirements.hasNumber) errorMessage += '- At least one number\n';
                if (!data.requirements.noCommonPatterns) errorMessage += '- No common patterns (123, abc, password, qwerty)\n';
                if (!data.requirements.noRepeatingChars) errorMessage += '- No character repeated more than twice\n';
                if (!data.requirements.hasMinimumUniqueChars) errorMessage += '- At least 8 unique characters\n';
                alert(errorMessage);
            } else {
                alert(data.error || 'Error creating account');
            }
        }
    } catch (error) {
        console.error('Signup error details:', error);
        alert('Error during signup. Please try again.');
    }
}

// Add this function
function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('authToken');
    
    fetch('/logout', { method: 'POST' })
        .then(() => {
            window.location.href = '/';
        })
        .catch(error => {
            console.error('Logout error:', error);
            window.location.href = '/';
        });
}

// Add these functions after the existing ones

function showForgotPassword() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const signupForm = document.getElementById('signupForm');
    
    loginForm.style.display = 'none';
    forgotPasswordForm.style.display = 'block';
    signupForm.style.display = 'none';
}

async function recoverPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('recoveryEmail').value;
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    // Simulate sending recovery email
    alert('Password reset instructions have been sent to your email address');
    
    // Return to login form
    showTab('login');
}

function validatePassword(password) {
    const minLength = password.length >= 10;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    const requirements = {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasSpecialChar,
        hasNumber
    };

    const isValid = Object.values(requirements).every(req => req);
    
    return { isValid, requirements };
}

async function generateRecoveryCodes() {
    const username = localStorage.getItem('username');

    try {
        const response = await fetch('/generate-recovery-codes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();

        if (response.ok) {
            return data.recoveryCodes;
        } else {
            alert('Error generating recovery codes');
        }
    } catch (error) {
        console.error('Error generating recovery codes:', error);
        alert('Error generating recovery codes');
    }
}

function displayRecoveryCodes(codes) {
    const recoveryCodesContainer = document.getElementById('recoveryCodes');
    recoveryCodesContainer.innerHTML = '';

    codes.forEach(code => {
        const codeElement = document.createElement('div');
        codeElement.textContent = code;
        recoveryCodesContainer.appendChild(codeElement);
    });
}