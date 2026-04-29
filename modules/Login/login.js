document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  let valid = true;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const terms = document.getElementById("terms").checked;

  // Clear errors
  document.getElementById("emailError").textContent = "";
  document.getElementById("passwordError").textContent = "";
  document.getElementById("termsError").textContent = "";

  // Email validation
  if (email === "") {
    document.getElementById("emailError").textContent = "Email is required";
    valid = false;
  } else if (!email.includes("@")) {
    document.getElementById("emailError").textContent = "Invalid email format";
    valid = false;
  }

  // Password validation
  if (password === "") {
    document.getElementById("passwordError").textContent = "Password is required";
    valid = false;
  } else if (password.length < 6) {
    document.getElementById("passwordError").textContent = "Minimum 6 characters";
    valid = false;
  }

  // Terms validation
  if (!terms) {
    document.getElementById("termsError").textContent = "You must agree first";
    valid = false;
  }

  // 🚫 Stop if validation fails
  if (!valid) return;

  // ✅ Send to backend only if valid
  fetch("login.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  })
  .then(res => res.json())
  .then(data => {

    console.log("Response:", data);

    if (data.status === "success") {

      if (data.role === "user") {
        window.location.href = "../User/home/home.html";
      } else {
        window.location.href = "../Admin/M_destination.html";
      }

    } else {
      alert(data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert("Something went wrong.");
  });
});