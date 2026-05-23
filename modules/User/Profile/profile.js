// ===============================
// LOAD PROFILE ON PAGE LOAD
// ===============================
document.addEventListener('DOMContentLoaded', function () {
    loadProfile();
});

// ===============================
// LOAD USER PROFILE + COMPLETED TRIPS
// ===============================
async function loadProfile() {
    try {
        const response = await fetch('profile.php?action=get_profile');
        const data = await response.json();

        if (data.status !== 'success') {
            alert(data.message || 'Failed to load profile.');
            return;
        }

        document.getElementById('username').value = data.user.username;
        document.getElementById('email').value = data.user.email;
        document.querySelector('.profile-name').textContent = data.user.username;
        document.getElementById('password').value = data.user.password || '';

        if (data.user.profile_photo) {
            document.getElementById('profilePic').src =
                '../../../assets/images/profile/' + data.user.profile_photo;
        }

        renderCompletedTrips(data.trips);

    } catch (error) {
        console.error('Profile loading error:', error);
    }
}

// ===============================
// RENDER COMPLETED TRIPS
// ===============================
function renderCompletedTrips(trips) {
    const grid = document.querySelector('.trips-grid');
    grid.innerHTML = '';

    if (!trips || trips.length === 0) {
        grid.innerHTML = `
            <div class="empty-section">
                No completed trips yet.
            </div>
        `;
        return;
    }

    trips.forEach(trip => {
        const image = trip.trip_image
            ? '../../../assets/images/attraction/' + trip.trip_image
            : '../../../assets/images/attraction/italy.png';

        grid.innerHTML += `
            <div class="trip-card">
                <div class="trip-image-container">
                    <img src="${image}" alt="${trip.city_name}" class="trip-image">
                    <div class="trip-rating">Completed</div>
                </div>

                <div class="trip-info">
                    <p class="trip-location">📍 ${trip.city_name}, ${trip.country_name}</p>
                    <p class="trip-reviews">${trip.start_date} - ${trip.end_date}</p>
                    <p class="trip-desc">${trip.trip_name}</p>

                    <button class="view-btn" onclick="openTripDetail(${trip.trip_id})">
                        View Details
                    </button>
                </div>
            </div>
        `;
    });
}

// ===============================
// VIEW COMPLETED TRIP DETAILS
// ===============================
async function openTripDetail(tripId) {
    try {
        const response = await fetch('profile.php?action=get_trip_detail&trip_id=' + tripId);
        const data = await response.json();

        if (data.status !== 'success') {
            alert(data.message || 'Failed to load trip details.');
            return;
        }

        const trip = data.trip;
        const attractions = data.attractions;

        const image = trip.trip_image
            ? '../../../assets/images/attraction/' + trip.trip_image
            : '../../../assets/images/attraction/italy.png';

        document.getElementById('tripDetailPhoto').src = image;
        document.getElementById('tripDetailLocation').textContent =
            trip.city_name + ', ' + trip.country_name;

        document.getElementById('tripDetailRating').textContent =
            'Completed Trip';

        document.getElementById('tripDetailReviews').textContent =
            trip.start_date + ' - ' + trip.end_date;

        let attractionText = '';

        if (attractions.length > 0) {
            attractionText = attractions.map(item => {
                return `Day ${item.day_number || '-'} - ${item.attraction_name}`;
            }).join('\n');
        } else {
            attractionText = 'No attraction details found for this trip.';
        }

        document.getElementById('tripDetailDesc').innerText =
            trip.trip_name + '\n\nAttractions:\n' + attractionText;

        document.getElementById('tripDetailOverlay').classList.add('active');

    } catch (error) {
        console.error('Trip detail error:', error);
    }
}

// ===============================
// CLOSE TRIP DETAIL MODAL
// ===============================
function closeTripDetail() {
    document.getElementById('tripDetailOverlay').classList.remove('active');
}

// ===============================
// UPLOAD PROFILE PHOTO
// ===============================
document.getElementById('uploadPic').addEventListener('change', async function () {
    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
        document.getElementById('profilePic').src = event.target.result;
    };

    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('action', 'upload_photo');
    formData.append('photo', file);

    try {
        const response = await fetch('profile.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.status !== 'success') {
            alert(data.message || 'Photo upload failed.');
        }

    } catch (error) {
        console.error('Photo upload error:', error);
    }
});

// ===============================
// EDIT / SAVE PROFILE
// ===============================
document.getElementById('editBtn').addEventListener('click', async function () {
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
        return;
    }

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (username === '') {
        alert('Username cannot be empty.');
        return;
    }

    if (email === '') {
        alert('Email cannot be empty.');
        return;
    }

    const formData = new FormData();
    formData.append('action', 'update_profile');
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);

    try {
        const response = await fetch('profile.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.status === 'success') {
            document.querySelector('.profile-name').textContent = username;

            inputs.forEach(input => {
                input.disabled = true;
                input.style.background = '#f0f0f0';
                input.style.borderColor = '#ddd';
            });

            document.getElementById('editBtn').textContent = 'Edit Profile';
            document.getElementById('editBtn').style.background = '#ff7a00';

            showSuccessMessage('✅ Profile saved successfully!');
        } else {
            alert(data.message || 'Failed to save profile.');
        }

    } catch (error) {
        console.error('Profile update error:', error);
    }
});

// ===============================
// SUCCESS MESSAGE
// ===============================
function showSuccessMessage(message) {
    const form = document.querySelector('.profile-form');
    const existing = form.querySelector('.success-msg');

    if (existing) existing.remove();

    const msg = document.createElement('p');
    msg.className = 'success-msg';
    msg.textContent = message;
    msg.style.color = 'green';
    msg.style.fontSize = '13px';
    msg.style.marginTop = '8px';
    msg.style.textAlign = 'center';

    form.appendChild(msg);

    setTimeout(() => msg.remove(), 3000);
}

// ===============================
// LOGOUT MODAL
// ===============================
document.querySelector('.logout-btn').addEventListener('click', function () {
    document.getElementById('logoutModal').classList.add('active');
});

// ===============================
// CONFIRM LOGOUT
// ===============================
document.querySelector('.modal-btn').addEventListener('click', async function () {
    await fetch('../../../shared/php/logout.php');
    window.location.href = '../login/login.html';
});

// ===============================
// TOGGLE PASSWORD VISIBILITY
// ===============================
document.getElementById('togglePassword')
.addEventListener('click', function () {

    const passwordInput =
        document.getElementById('password');

    if (passwordInput.type === 'password') {

        passwordInput.type = 'text';

        this.textContent = '🙈';

    } else {

        passwordInput.type = 'password';

        this.textContent = '👁';
    }
});