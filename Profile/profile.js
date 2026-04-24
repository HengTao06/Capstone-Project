/* RESET */
body {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
}

/* NAVBAR CONTAINER */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 40px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* LOGO */
.logo {
  font-size: 24px;
  font-weight: bold;
  color: #ff7a00;
  cursor: pointer;
}

/* SEARCH BAR */
.search-container {
  position: relative;
}

.search-container input {
  width: 240px;
  padding: 8px 15px;
  padding-left: 35px;
  border-radius: 20px;
  border: 1px solid #ddd;
  transition: all 0.3s ease;
}

/* EXPAND ON CLICK */
.search-container input:focus {
  width: 300px;
  border-color: #ff7a00;
  box-shadow: 0 0 5px rgba(255,122,0,0.3);
  outline: none;
}

/* OPTIONAL SEARCH ICON */
.search-container::before {
  content: "🔍";
  position: absolute;
  left: 10px;
  top: 6px;
  font-size: 14px;
}

/* NAV LINKS */
.nav-links {
  display: flex;
  list-style: none;
  gap: 30px;
}

/* EACH LINK */
.nav-links li {
  cursor: pointer;
  position: relative;
  font-size: 15px;
  color: #333;
  transition: 0.3s;
}

/* HOVER COLOR */
.nav-links li:hover {
  color: #ff7a00;
}

/* UNDERLINE ANIMATION */
.nav-links li::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 0%;
  height: 2px;
  background: #ff7a00;
  transition: 0.3s ease;
}

.nav-links li:hover::after {
  width: 100%;
}

/* ACTIVE PAGE */
.nav-links .active {
  color: #ff7a00;
  font-weight: 600;
}

.nav-links .active::after {
  width: 100%;
}

/* SMALL HOVER LIFT EFFECT */
.nav-links li:hover {
  transform: translateY(-2px);
}



document.getElementById('uploadPic').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('profilePic').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('editBtn').addEventListener('click', function() {
  const inputs = document.querySelectorAll('.form-group input');
  const isDisabled = inputs[0].disabled;

  inputs.forEach(input => {
    input.disabled = !isDisabled;
  });

  this.textContent = isDisabled ? 'Save Profile' : 'Edit Profile';
  this.style.background = isDisabled ? '#28a745' : '#ff7a00';
});