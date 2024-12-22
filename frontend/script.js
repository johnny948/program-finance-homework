// Switch to the registration page.
document.getElementById("show-register").addEventListener("click", () => {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
});

// Switch to the login page.
document.getElementById("show-login").addEventListener("click", () => {
    document.getElementById("register-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
});

// Registration functionality
document.getElementById("register-btn").addEventListener("click", async () => {
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    if (!username || !password) {
        document.getElementById("message").textContent = "Username and password cannot be empty！";
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            // After successful registration, display a success message and switch to the login page.
            document.getElementById("message").textContent = result.message;
            document.getElementById("message").style.color = "green";

            setTimeout(() => {
                // Hide the registration form and display the login form.
                document.getElementById("register-form").style.display = "none";
                document.getElementById("login-form").style.display = "block";
            }, 2000);
        } else {

            document.getElementById("message").textContent = result.message;
            document.getElementById("message").style.color = "red";
        }
    } catch (error) {
        console.error("registeration failed：", error);
        document.getElementById("message").textContent = "An error occurred during registration. Please try again later。";
        document.getElementById("message").style.color = "red";
    }
});


// login function
document.getElementById("login-btn").addEventListener("click", async () => {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    if (!username || !password) {
        document.getElementById("message").textContent = "Username and password cannot be empty！";
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        const result = await response.json();
        if (result.success) {
            window.location.href = "index.html";
        } else {
            document.getElementById("message").textContent = result.message;
            document.getElementById("message").style.color = "red";
        }
    } catch (error) {
        console.error("login failed：", error);
        document.getElementById("message").textContent = "An error occurred during registration. Please try again later。";
        document.getElementById("message").style.color = "red";
    }
});










