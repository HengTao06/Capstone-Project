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

document.getElementById('editBtn').addEventListener('click', function() {
  const inputs = document.querySelectorAll('.form-group input');
  const isDisabled = inputs[0].disabled;

  inputs.forEach(input => {
    input.disabled = !isDisabled;
  });

  this.textContent = isDisabled ? 'Save Profile' : 'Edit Profile';
  this.style.background = isDisabled ? '#28a745' : '#ff7a00';
});