// ===========================
// ATTRACTION DATA
// ===========================
const attractionMap = {
    venice: ['Grand Canal', "St. Mark's Basilica", "Doge's Palace", 'Rialto Bridge'],
    paris:  ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Champs-Élysées'],
    tokyo:  ['Senso-ji Temple', 'Shibuya Crossing', 'Shinjuku Gyoen', 'Tokyo Tower']
};

// ===========================
// REVIEWS DATA
// ===========================
const allReviews = [
    {
        name: 'Ethan Tan', initials: 'ET', color: '#3a8fc7',
        avatar: null,
        photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&h=200&fit=crop',
        date: 'April 10, 2026', rating: 5, attraction: 'Tokyo Tower',
        text: 'Absolutely breathtaking experience! The view from the top is spectacular, especially at sunset. The city lights coming on as the sun sets is magical. Highly recommend visiting during golden hour for the best photos.'
    },
    {
        name: 'Aiden Lim', initials: 'AL', color: '#e07b39',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
        photo: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=500&h=200&fit=crop',
        date: 'April 8, 2026', rating: 5, attraction: 'Angkor Wat',
        text: "One of the most incredible historical sites I've ever visited. The architecture is mind-blowing and the spiritual atmosphere is palpable. Get there early to beat the crowds and catch the sunrise over the temple."
    },
    {
        name: 'Ryan Wong', initials: 'RW', color: '#5ab56e',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
        photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=200&fit=crop',
        date: 'April 5, 2026', rating: 4.5, attraction: 'Maldives Beach Resort',
        text: 'Paradise on earth! Crystal clear water, white sandy beaches, and amazing snorkeling. The resort staff was incredibly friendly and accommodating. Perfect for a relaxing getaway. Only downside was the price but totally worth it.'
    },
    {
        name: 'Daniel Ng', initials: 'DN', color: '#9b6ec7',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&crop=face',
        photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&h=200&fit=crop',
        date: 'April 2, 2026', rating: 5, attraction: 'Swiss Alps Hiking Trail',
        text: 'The most scenic hiking experience of our lives! Well-marked trails, stunning mountain views at every turn, and charming alpine villages. The fresh mountain air and peaceful surroundings made this trip truly unforgettable.'
    },
    {
        name: 'Kevin Chua', initials: 'KC', color: '#3ab8b8',
        avatar: null,
        photo: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=500&h=200&fit=crop',
        date: 'March 28, 2026', rating: 4, attraction: 'Eiffel Tower',
        text: "Iconic landmark that lives up to the hype! The architecture is stunning and the views of Paris from the top are incredible. Went at night to see the light show — absolutely magical. Book tickets in advance to skip the long queue."
    },
    {
        name: 'Sean Goh', initials: 'SG', color: '#d4515b',
        avatar: null,
        photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=200&fit=crop',
        date: 'March 25, 2026', rating: 5, attraction: 'Bangkok Street Food Tour',
        text: "Food lover's paradise! Every corner has amazing street food vendors. The flavors are incredible and so authentic. Our guide was knowledgeable and took us to the best local spots. Pad Thai here is on another level entirely!"
    }
];

// ===========================
// STATE
// ===========================
let currentRating = 0;

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

    document.getElementById('reviewsGrid').innerHTML = list.map(function(r) {

        const avatarHTML = r.avatar
            ? `<img class="avatar-img" src="${r.avatar}" alt="${r.name}"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
               <div class="avatar-circle" style="background:${r.color};display:none">${r.initials}</div>`
            : `<div class="avatar-circle" style="background:${r.color}">${r.initials}</div>`;

        const photoHTML = r.photo
            ? `<img class="card-photo" src="${r.photo}" alt="${r.attraction}"
                onerror="this.outerHTML='<div class=card-photo-placeholder>No photo available</div>'" />`
            : `<div class="card-photo-placeholder">No photo available</div>`;

        return `
        <div class="review-card">
            <div class="card-header">
                <div class="reviewer-info">
                    ${avatarHTML}
                    <div>
                        <div class="reviewer-name">${r.name}</div>
                        <div class="reviewer-attraction">${r.attraction}</div>
                    </div>
                </div>
                <div class="review-date">${r.date}</div>
            </div>
            <div class="card-stars">
                ${starsHTML(r.rating)}
                <span class="rating-num">(${r.rating})</span>
            </div>
            ${photoHTML}
            <div class="card-body">
                <p class="card-text">${r.text}</p>
                <a class="view-details" onclick="openDetail(${allReviews.indexOf(r)})">View Details →</a>
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
    if (df !== 'all') filtered = filtered.filter(r => r.attraction === df);

    renderReviews(filtered);
}

// ===========================
// UPDATE ATTRACTION DROPDOWN
// ===========================
function updateAttractions() {
    const trip = document.getElementById('tripSelect').value;
    const sel  = document.getElementById('attractionSelect');

    sel.innerHTML = '<option value="">Choose an attraction</option>';

    if (trip && attractionMap[trip]) {
        attractionMap[trip].forEach(function(a) {
            sel.innerHTML += `<option value="${a}">${a}</option>`;
        });
        sel.disabled = false;
    } else {
        sel.disabled = true;
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
// PHOTO UPLOAD LABEL
// ===========================
let uploadedPhotoURL = null;

function handleUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedPhotoURL = e.target.result;
            // Show image preview in upload box
            const uploadBox = document.querySelector('.upload-box');
            uploadBox.innerHTML = `
                <img src="${uploadedPhotoURL}" 
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
    const ok   = trip && attr && currentRating > 0 && text.length > 0;

    const btn  = document.getElementById('submitBtn');
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

    const trip = document.getElementById('tripSelect').value;
    const attr = document.getElementById('attractionSelect').value;
    const text = document.getElementById('reviewText').value.trim();

    allReviews.unshift({
        name: 'Ng Heng Tao',
        initials: 'NH',
        color: '#ff7a00',
        avatar: null,
        photo: uploadedPhotoURL,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        rating: currentRating,
        attraction: attr,
        text: text
    });

    filterReviews();

    // Reset form
    document.getElementById('tripSelect').value = '';
    document.getElementById('attractionSelect').innerHTML = '<option value="">Choose an attraction</option>';
    document.getElementById('attractionSelect').disabled = true;
    document.getElementById('reviewText').value = '';
    document.getElementById('charCount').textContent = '0';
    currentRating = 0;
    document.querySelectorAll('#starRow .star').forEach(s => s.classList.remove('filled'));
    // Reset upload box back to original
    document.querySelector('.upload-box').innerHTML = `<div class="upload-icon">⬆</div>
    <p id="uploadLabel">Click to upload</p>
`;
uploadedPhotoURL = null;
    checkForm();
    document.getElementById('popupOverlay').classList.add('active');
}

function closePopup() {
    document.getElementById('popupOverlay').classList.remove('active');
}

// ===========================
// INIT - run on page load
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    renderReviews(allReviews);
});

function openDetail(index) {
    const r = allReviews[index];

    document.getElementById('detailName').textContent = r.name;
    document.getElementById('detailAttraction').textContent = r.attraction;
    document.getElementById('detailDate').textContent = r.date;
    document.getElementById('detailStars').innerHTML = starsHTML(r.rating) + `<span class="rating-num">(${r.rating})</span>`;
    document.getElementById('detailText').textContent = r.text;

    const avatarEl = document.getElementById('detailAvatar');
    avatarEl.innerHTML = r.avatar
        ? `<img class="avatar-img" src="${r.avatar}" alt="${r.name}" />`
        : `<div class="avatar-circle" style="background:${r.color}">${r.initials}</div>`;

    const photo = document.getElementById('detailPhoto');
    if (r.photo) {
        photo.src = r.photo;
        photo.style.display = 'block';
    } else {
        photo.style.display = 'none';
    }

    document.getElementById('detailOverlay').classList.add('active');
}

function closeDetail() {
    document.getElementById('detailOverlay').classList.remove('active');
}