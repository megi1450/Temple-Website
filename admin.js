function pass() {
    const passwordInput = document.getElementById('password').value;

    // Replace 'yourpassword' with the actual password
    const correctPassword = 'india';

    if (passwordInput === correctPassword) {
        sessionStorage.setItem('login', 'true'); // Store login state
        window.location.href = 'adminhome.html'; // Redirect to admin home
    } else {
        alert('Incorrect password. Please try again.');
    }
}

function admin() {
    // Check if the login state is 'true'
    if (sessionStorage.getItem('login') !== 'true') {
        window.location.href = 'pass.html'; // Redirect to password page
    }
}
