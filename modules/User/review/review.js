// ===========================
// STATE
// ===========================
let currentRating = 0;
let uploadedPhotoFile = null;
let allReviews = [];

// ===========================
// RENDER STARS (display only)
// ===========================
function starsHTML(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            html += '<span class="star-filled">★</span>';
        } else if (rating >= i - 0.5) {
            html += '<span class="star-filled">☆</span>';
        } else {
            html += '<span class="star-empty">★</span>';
        }
    }
    return html;
}

// ===========================
// RENDER REVIEW CARDS
// ===========================
function renderReviews(list) {
    document.getElementById('reviewsFound').textContent = list.length + ' reviews found';

    document.getElementById('reviewsGrid').innerHTML = list.map(function(r, index) {
        const initials = r.username ? r.username.substring(0, 2).toUpperCase() : 'UN';
        const colors = ['#3a8fc7', '#e07b39', '#5ab56e', '#9b6ec7', '#3ab8b8', '#d4515b'];
        const color = colors[index % colors.length];

        const avatarHTML = `<div class="avatar-circle" style="background:${color}">${initials}</div>`;

        const photoHTML = r.photo
            ? `<img class="card-photo" src="../../../assets/images/${r.photo}" alt="${r.attraction_name}"
                onerror="this.outerHTML='<div class=card-photo-placeholder>No photo available</div>'" />`
            : `<div class="card-photo-placeholder">No photo available</div>`;

        return `
        <div class="review-card">
            <div class="card-header">
                <div class="reviewer-info">
                    ${avatarHTML}
                    <div>
                        <div class="reviewer-name">${r.username}</div>
                        <div class="reviewer-attraction">${r.attraction_name}</div>
                    </div>
                </div>
                <div class="review-date">${r.review_date}</div>
            </div>
            <div class="card-stars">
                ${starsHTML(r.rating)}
                <span class="rating-num">(${r.rating})</span>
            </div>
            ${photoHTML}
            <div class="card-body">
                <p class="card-text">${r.comment}</p>
                <a class="view-details" onclick="openDetail(${index})">View Details →</a>
            </div>
        </div>`;
    }).join('');
}

// ===========================
// FILTER REVIEWS
// ===========================
function filterReviews() {
    const rf = document.getElementById('ratingFilter').value;
    const df = document.getElementById('destFilter').value;

    let filtered = allReviews;
    if (rf !== 'all') filtered = filtered.filter(r => Math.floor(r.rating) === parseInt(rf));
    if (df !== 'all') filtered = filtered.filter(r => r.attraction_name === df);

    renderReviews(filtered);
}

// ===========================
// LOAD TRIPS FROM DATABASE
// ===========================
function loadTrips() {
    fetch('review.php?action=trips')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tripSelect = document.getElementById('tripSelect');
                tripSelect.innerHTML = '<option value="">Choose a completed trip</option>';
                data.trips.forEach(function(trip) {
                    tripSelect.innerHTML += `<option value="${trip.trip_id}">${trip.trip_name} (${trip.city_name})</option>`;
                });
            }
        })
        .catch(error => console.error('Error loading trips:', error));
}

// ===========================
// UPDATE ATTRACTION DROPDOWN
// ===========================
function updateAttractions() {
    const trip_id = document.getElementById('tripSelect').value;
    const sel = document.getElementById('attractionSelect');

    sel.innerHTML = '<option value="">Choose an attraction</option>';
    sel.disabled = true;

    if (trip_id) {
        fetch(`review.php?action=attractions&trip_id=${trip_id}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.attractions.length > 0) {
                    data.attractions.forEach(function(a) {
                        sel.innerHTML += `<option value="${a.attraction_id}">${a.attraction_name}</option>`;
                    });
                    sel.disabled = false;
                }
            })
            .catch(error => console.error('Error loading attractions:', error));
    }
    checkForm();
}

// ===========================
// STAR RATING (write form)
// ===========================
function setRating(val) {
    currentRating = val;
    document.querySelectorAll('#starRow .star').forEach(function(s) {
        s.classList.toggle('filled', parseInt(s.dataset.val) <= val);
    });
    checkForm();
}

// ===========================
// CHARACTER COUNT
// ===========================
function updateCount() {
    document.getElementById('charCount').textContent =
        document.getElementById('reviewText').value.length;
    checkForm();
}

// ===========================
// PHOTO UPLOAD
// ===========================
function handleUpload(e) {
    const file = e.target.files[0];
    if (file) {
        uploadedPhotoFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            const uploadBox = document.querySelector('.upload-box');
            uploadBox.innerHTML = `
                <img src="${e.target.result}" 
                style="width:100%; height:100%; object-fit:cover; border-radius:10px;" />
            `;
        };
        reader.readAsDataURL(file);
    }
}

// ===========================
// FORM VALIDATION
// ===========================
function checkForm() {
    const trip = document.getElementById('tripSelect').value;
    const attr = document.getElementById('attractionSelect').value;
    const text = document.getElementById('reviewText').value.trim();
    const ok = trip && attr && currentRating > 0 && text.length > 0;

    const btn = document.getElementById('submitBtn');
    const hint = document.getElementById('submitHint');
    btn.classList.toggle('ready', ok);
    hint.style.display = ok ? 'none' : 'block';
}

// ===========================
// SUBMIT REVIEW
// ===========================
function submitReview() {
    const btn = document.getElementById('submitBtn');
    if (!btn.classList.contains('ready')) return;

    const attr = document.getElementById('attractionSelect').value;
    const text = document.getElementById('reviewText').value.trim();

    const formData = new FormData();
    formData.append('attraction_id', attr);
    formData.append('rating', currentRating);
    formData.append('comment', text);

    if (uploadedPhotoFile) {
        formData.append('photo', uploadedPhotoFile);
    }

    fetch('review.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Reset form
            document.getElementById('tripSelect').value = '';
            document.getElementById('attractionSelect').innerHTML = '<option value="">Choose an attraction</option>';
            document.getElementById('attractionSelect').disabled = true;
            document.getElementById('reviewText').value = '';
            document.getElementById('charCount').textContent = '0';
            currentRating = 0;
            document.querySelectorAll('#starRow .star').forEach(s => s.classList.remove('filled'));
            document.querySelector('.upload-box').innerHTML = `
                <div class="upload-icon">⬆</div>
                <p id="uploadLabel">Click to upload</p>
            `;
            uploadedPhotoFile = null;
            checkForm();

            // Show success popup
            document.getElementById('popupOverlay').classList.add('active');

            // Reload reviews
            loadReviews();
        } else {
            alert('Error submitting review!');
        }
    })
    .catch(error => console.error('Error:', error));
}

function closePopup() {
    document.getElementById('popupOverlay').classList.remove('active');
}

// ===========================
// LOAD REVIEWS FROM DATABASE
// ===========================
function loadReviews() {
    fetch('review.php?action=reviews')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                allReviews = data.reviews;
                renderReviews(allReviews);

                // Update filter dropdown
                const destFilter = document.getElementById('destFilter');
                const currentVal = destFilter.value;
                destFilter.innerHTML = '<option value="all">All Attraction</option>';
                const attractions = [...new Set(allReviews.map(r => r.attraction_name))];
                attractions.forEach(a => {
                    destFilter.innerHTML += `<option value="${a}">${a}</option>`;
                });
                destFilter.value = currentVal;
            }
        })
        .catch(error => console.error('Error loading reviews:', error));
}

// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    loadReviews();
    loadTrips();
});

// ===========================
// OPEN DETAIL POPUP
// ===========================
function openDetail(index) {
    const r = allReviews[index];

    document.getElementById('detailName').textContent = r.username;
    document.getElementById('detailAttraction').textContent = r.attraction_name;
    document.getElementById('detailDate').textContent = r.review_date;
    document.getElementById('detailStars').innerHTML = starsHTML(r.rating) + `<span class="rating-num">(${r.rating})</span>`;
    document.getElementById('detailText').textContent = r.comment;

    const avatarEl = document.getElementById('detailAvatar');
    const initials = r.username ? r.username.substring(0, 2).toUpperCase() : 'UN';
    avatarEl.innerHTML = `<div class="avatar-circle" style="background:#ff7a00">${initials}</div>`;

    const photo = document.getElementById('detailPhoto');
    if (r.photo) {
        photo.src = '../../../assets/images/' + r.photo;
        photo.style.display = 'block';
    } else {
        photo.style.display = 'none';
    }

    document.getElementById('detailOverlay').classList.add('active');
}

function closeDetail() {
    document.getElementById('detailOverlay').classList.remove('active');
}