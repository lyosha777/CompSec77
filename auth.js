// Function to show/hide login/signup forms
function showTab(tabName) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    if (tabName === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        forgotPasswordForm.style.display = 'none';
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else if (tabName === 'signup') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        forgotPasswordForm.style.display = 'none';
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    } else if (tabName === 'forgotPassword') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
        forgotPasswordForm.style.display = 'block';
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
            // Store the authentication state
            localStorage.setItem('isAuthenticated', 'true');
            // Redirect to the main page after successful login
            window.location.href = 'index.html';
        } else {
            alert(data.error || 'Invalid username or password');
        }
    } catch (error) {
        alert('Error during login. Please try again.');
    }
}

// Function to handle signup
function signup(event) {
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
    
    // Perform signup logic here (e.g., store user information in a database)
    // For simplicity, let's assume the signup is successful
    alert('Sign up successful! Please log in.');
    showTab('login');
}

// Function to handle forgot password
function forgotPassword(event) {
    event.preventDefault();
    
    const username = document.getElementById('forgotUsername').value;
    const securityAnswer = document.getElementById('forgotSecurityAnswer').value;
    
    // Perform forgot password logic here (e.g., check security answer and retrieve password)
    // For simplicity, let's assume the security answer is correct and the password is retrieved
    const password = 'retrievedPassword';
    
    alert(`Your password is: ${password}`);
    showTab('login');
}

// Function to save credentials to file (this is a placeholder)
function saveToFile(username, password) {
    // Note: This would normally require server-side implementation
    // For now, we'll just log to console
    console.log(`New user registered: ${username}`);
}

// Function to show/hide forgot password form
function showForgotPassword() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    loginForm.style.display = 'none';
    forgotPasswordForm.style.display = 'block';
}

// Function to handle password recovery
async function recoverPassword(event) {
    event.preventDefault();

    const username = document.getElementById('forgotUsername').value;
    const securityAnswer = document.getElementById('forgotSecurityAnswer').value;

    try {
        const response = await fetch('/recover-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, securityAnswer })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Your password is: ${data.password}`);
            showTab('login');
        } else {
            alert(data.error || 'Error during password recovery. Please try again.');
        }
    } catch (error) {
        alert('Error during password recovery. Please try again.');
    }
} 
