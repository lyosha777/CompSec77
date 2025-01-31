function authenticate(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'test' && password === 'test') {
        window.location.href = 'home.html';
    } else {
        alert('Invalid credentials. Please try again.');
    }
} 