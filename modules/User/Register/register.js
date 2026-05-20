document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let username = document.getElementById("fullName").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    let terms = document.getElementById("terms").checked;

    let valid = true;

    // Reset errors
    document.querySelectorAll(".error").forEach(e => e.textContent = "");

    if (username === "") {
        document.getElementById("fullNameError").textContent = "Name required";
        valid = false;
    }

    if (email === "") {
        document.getElementById("emailError").textContent = "Email required";
        valid = false;
    }

    if (password.length < 6) {
        document.getElementById("passwordError").textContent = "Min 6 characters";
        valid = false;
    }

    if (password !== confirmPassword) {
        document.getElementById("confirmPasswordError").textContent = "Passwords do not match";
        valid = false;
    }

    if (!terms) {
        document.getElementById("termsError").textContent = "You must agree";
        valid = false;
    }

    if (!valid) return;

    // Send to PHP
fetch("register.php", {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
})
.then(res => res.text())
.then(data => {
    console.log("RAW RESPONSE:", data);

    try {
        let json = JSON.parse(data);

        if (json.status === "success") {
            alert(json.message);
            window.location.href = "../Login/login.html";
        } else {
            alert(json.message);
        }
    } catch (e) {
        alert("PHP returned: " + data.substring(0, 300));
    }
})
.catch(err => {
    console.error(err);
    alert("Server error");
});
});