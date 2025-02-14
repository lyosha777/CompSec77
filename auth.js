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
    console.log('Login attempt started');
    
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
        console.log('Server response:', data);

        if (response.ok) {
            console.log('Login successful');
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('authToken', data.token);
            window.location.replace('index.html');
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
    const securityQuestion = document.getElementById('securityQuestion').value;
    const securityAnswer = document.getElementById('securityAnswer').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                securityQuestion,
                securityAnswer
            })
        });

        if (response.ok) {
            alert('Sign up successful! Please log in.');
            showTab('login');
        } else {
            alert('Error during signup. Please try again.');
        }
    } catch (error) {
        alert('Error during signup. Please try again.');
    }
}

// Add this function
function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
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
    
    const username = document.getElementById('recoveryUsername').value;
    const securityAnswer = document.getElementById('recoveryAnswer').value;
    
    try {
        const response = await fetch('/recover-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, securityAnswer })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(`Your password is: ${data.password}`);
            showTab('login');
        } else {
            alert(data.error || 'Invalid username or security answer');
        }
    } catch (error) {
        console.error('Recovery error:', error);
        alert('Error during password recovery. Please try again.');
    }
}