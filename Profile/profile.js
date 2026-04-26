// PROFILE PICTURE UPLOAD
document.getElementById('uploadPic').addEventListener('change', function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      document.getElementById('profilePic').src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// EDIT PROFILE
document.getElementById('editBtn').addEventListener('click', function() {
  const inputs = document.querySelectorAll('.form-group input');
  const isDisabled = inputs[0].disabled;

  if (isDisabled) {
    inputs.forEach(input => {
      input.disabled = false;
      input.style.background = 'white';
      input.style.borderColor = '#ff7a00';
    });
    this.textContent = 'Save Profile';
    this.style.background = '#28a745';

  } else {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;

    if (username.trim() === '') {
      alert('Username cannot be empty!');
      return;
    }

    if (email.trim() === '') {
      alert('Email cannot be empty!');
      return;
    }

    // Update profile name
    document.querySelector('.profile-name').textContent = username;

    inputs.forEach(input => {
      input.disabled = true;
      input.style.background = '#f0f0f0';
      input.style.borderColor = '#ddd';
    });

    this.textContent = 'Edit Profile';
    this.style.background = '#ff7a00';

    const msg = document.createElement('p');
    msg.textContent = '✅ Profile saved successfully!';
    msg.style.color = 'green';
    msg.style.fontSize = '13px';
    msg.style.marginTop = '8px';
    msg.style.textAlign = 'center';

    const form = document.querySelector('.profile-form');
    const existing = form.querySelector('.success-msg');
    if (existing) existing.remove();

    msg.classList.add('success-msg');
    form.appendChild(msg);

    setTimeout(() => msg.remove(), 3000);
  }
});

// LOGOUT
document.querySelector('.logout-btn').addEventListener('click', function() {
  document.getElementById('logoutModal').classList.add('active');
});