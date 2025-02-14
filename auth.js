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
function authenticate(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // Perform authentication logic here (e.g., check against a predefined username and password)
    if (username === 'admin' && password === 'password') {
        // Store the authentication state in local storage or session storage
        localStorage.setItem('isAuthenticated', 'true');
        
        // Redirect to the main page after successful login
        window.location.href = 'index.html';
    } else {
        alert('Invalid username or password');
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
