// LOAD USER DATA ON PAGE LOAD
document.addEventListener('DOMContentLoaded', function() {
    fetch('profile.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById('username').value = data.username;
                document.getElementById('email').value = data.email;
                document.querySelector('.profile-name').textContent = data.username;

                if (data.profile_photo && data.profile_photo !== '') {
                    document.getElementById('profilePic').src = '../../../assets/images/' + data.profile_photo;
                }

                // Render trip cards from database
                if (data.trips && data.trips.length > 0) {
                    const grid = document.querySelector('.trips-grid');
                    grid.innerHTML = '';
                    data.trips.forEach(function(trip) {
                        const image = trip.attraction_image ? '../../../assets/images/' + trip.attraction_image : '../../../assets/images/italy.png';
                        grid.innerHTML += `
                            <div class="trip-card">
                                <div class="trip-image-container">
                                    <img src="${image}" alt="${trip.city_name}" class="trip-image" />
                                    <div class="trip-rating">⭐ 4.9</div>
                                </div>
                                <div class="trip-info">
                                    <p class="trip-location">📍 ${trip.city_name}, ${trip.country_name}</p>
                                    <p class="trip-reviews">${trip.start_date} - ${trip.end_date}</p>
                                    <p class="trip-desc">${trip.trip_name}</p>
                                    <button class="view-btn" onclick="openTripDetail(this)">View Details</button>
                                </div>
                            </div>
                        `;
                    });
                }
            }
        })
        .catch(error => console.error('Error loading user data:', error));
});

// PROFILE PICTURE UPLOAD
document.getElementById('uploadPic').addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('profilePic').src = event.target.result;
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('action', 'upload_photo');
        formData.append('photo', file);

        fetch('profile.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Photo uploaded!');
            }
        })
        .catch(error => console.error('Error:', error));
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
        const password = document.getElementById('password').value;

        if (username.trim() === '') {
            alert('Username cannot be empty!');
            return;
        }

        if (email.trim() === '') {
            alert('Email cannot be empty!');
            return;
        }

        const formData = new FormData();
        formData.append('action', 'update_profile');
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);

        fetch('profile.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                document.querySelector('.profile-name').textContent = username;

                inputs.forEach(input => {
                    input.disabled = true;
                    input.style.background = '#f0f0f0';
                    input.style.borderColor = '#ddd';
                });

                document.getElementById('editBtn').textContent = 'Edit Profile';
                document.getElementById('editBtn').style.background = '#ff7a00';

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
            } else {
                alert('Error saving profile!');
            }
        })
        .catch(error => console.error('Error:', error));
    }
});

// LOGOUT
document.querySelector('.logout-btn').addEventListener('click', function() {
    document.getElementById('logoutModal').classList.add('active');
});

// VIEW DETAILS
function openTripDetail(btn) {
    const card = btn.closest('.trip-card');
    const image = card.querySelector('.trip-image').src;
    const location = card.querySelector('.trip-location').textContent;
    const reviews = card.querySelector('.trip-reviews').textContent;
    const desc = card.querySelector('.trip-desc').textContent;
    const rating = card.querySelector('.trip-rating').textContent;

    document.getElementById('tripDetailPhoto').src = image;
    document.getElementById('tripDetailLocation').textContent = location;
    document.getElementById('tripDetailRating').textContent = rating;
    document.getElementById('tripDetailReviews').textContent = reviews;
    document.getElementById('tripDetailDesc').textContent = desc;

    document.getElementById('tripDetailOverlay').classList.add('active');
}

function closeTripDetail() {
    document.getElementById('tripDetailOverlay').classList.remove('active');
}