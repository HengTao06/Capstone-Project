let currentRating = 0
let uploadedPhotoFile = null
let allReviews = []
let currentRenderedReviews = []

document.addEventListener('DOMContentLoaded', function () {
  loadReviews()
  loadTrips()
  attachEvents()
})

function attachEvents () {
  document
    .getElementById('tripSelect')
    .addEventListener('change', updateAttractions)
  document
    .getElementById('attractionSelect')
    .addEventListener('change', checkForm)
  document.getElementById('reviewText').addEventListener('input', updateCount)
  document
    .getElementById('photoUpload')
    .addEventListener('change', handleUpload)
  document.getElementById('uploadBox').addEventListener('click', function () {
    document.getElementById('photoUpload').click()
  })

  document.getElementById('submitBtn').addEventListener('click', submitReview)
  document
    .getElementById('ratingFilter')
    .addEventListener('change', filterReviews)
  document
    .getElementById('destFilter')
    .addEventListener('change', filterReviews)

  document.getElementById('closePopupBtn').addEventListener('click', closePopup)
  document
    .getElementById('closeDetailIcon')
    .addEventListener('click', closeDetail)
  document
    .getElementById('closeDetailBtn')
    .addEventListener('click', closeDetail)

  document.querySelectorAll('#starRow .star').forEach(function (star) {
    star.addEventListener('click', function () {
      setRating(parseInt(this.dataset.val))
    })
  })
}

function starsHTML (rating) {
  let html = ''

  for (let i = 1; i <= 5; i++) {
    html +=
      rating >= i
        ? '<span class="star-filled">★</span>'
        : '<span class="star-empty">★</span>'
  }

  return html
}

function renderReviews (list) {
  currentRenderedReviews = list

  document.getElementById('reviewsFound').textContent =
    list.length + ' reviews found'

  const grid = document.getElementById('reviewsGrid')

  if (!list || list.length === 0) {
    grid.innerHTML = `
            <div class="empty-section">
                No reviews found.
            </div>
        `
    return
  }

  grid.innerHTML = list
    .map(function (r, index) {
      const initials = r.username
        ? r.username.substring(0, 2).toUpperCase()
        : 'UN'

      const avatarHTML = r.user_profile
        ? `<img class="avatar-img" src="../../../assets/images/profile/${r.user_profile}" alt="${r.username}">`
        : `<div class="avatar-circle">${initials}</div>`

      const photoHTML = r.photo
        ? `
        <img class="card-photo"
             src="../../../assets/images/attraction/${r.photo}"
             alt="${r.attraction_name}"
             onerror="this.onerror=null; this.src='https://placehold.co/600x360?text=No+Photo';">
      `
        : `
        <img class="card-photo"
             src="https://placehold.co/600x360?text=No+Photo"
             alt="No photo">
      `

      return `
            <article class="review-card">
                <div class="card-header">
                    <div class="reviewer-info">
                        ${avatarHTML}

                        <div>
                            <div class="reviewer-name">${r.username}</div>
                            <div class="reviewer-attraction">${
                              r.attraction_name
                            }</div>
                        </div>
                    </div>

                    <div class="review-date">${r.review_date}</div>
                </div>

                <div class="card-stars">
                    ${starsHTML(Number(r.rating))}
                    <span class="rating-num">(${r.rating})</span>
                </div>

                ${photoHTML}

                <div class="card-body">
                    <p class="card-text">${r.comment}</p>

                    <button class="view-details" type="button" onclick="openDetail(${index})">
                        View Details →
                    </button>
                </div>
            </article>
        `
    })
    .join('')
}

function filterReviews () {
  const ratingValue = document.getElementById('ratingFilter').value
  const attractionValue = document.getElementById('destFilter').value

  let filtered = [...allReviews]

  if (ratingValue !== 'all') {
    filtered = filtered.filter(function (r) {
      return Number(r.rating) === Number(ratingValue)
    })
  }

  if (attractionValue !== 'all') {
    filtered = filtered.filter(function (r) {
      return r.attraction_name === attractionValue
    })
  }

  renderReviews(filtered)
}

function loadTrips () {
  fetch('review.php?action=trips')
    .then(response => response.json())
    .then(data => {
      const tripSelect = document.getElementById('tripSelect')

      tripSelect.innerHTML = '<option value="">Choose a completed trip</option>'

      if (data.status !== 'success') return

      if (!data.trips || data.trips.length === 0) {
        tripSelect.innerHTML =
          '<option value="">No completed trips available</option>'
        return
      }

      data.trips.forEach(function (trip) {
        tripSelect.innerHTML += `
                    <option value="${trip.trip_id}">
                        ${trip.trip_name} (${trip.city_name}, ${trip.country_name})
                    </option>
                `
      })
    })
    .catch(error => console.error('Error loading trips:', error))
}

function updateAttractions () {
  const tripId = document.getElementById('tripSelect').value
  const attractionSelect = document.getElementById('attractionSelect')

  attractionSelect.innerHTML = '<option value="">Choose an attraction</option>'
  attractionSelect.disabled = true

  if (!tripId) {
    checkForm()
    return
  }

  fetch('review.php?action=attractions&trip_id=' + encodeURIComponent(tripId))
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success' && data.attractions.length > 0) {
        data.attractions.forEach(function (a) {
          attractionSelect.innerHTML += `
                        <option value="${a.attraction_id}">
                            ${a.attraction_name}
                        </option>
                    `
        })

        attractionSelect.disabled = false
      } else {
        attractionSelect.innerHTML =
          '<option value="">No attractions found</option>'
      }

      checkForm()
    })
    .catch(error => console.error('Error loading attractions:', error))
}

function setRating (value) {
  currentRating = value

  document.querySelectorAll('#starRow .star').forEach(function (star) {
    star.classList.toggle('filled', parseInt(star.dataset.val) <= value)
  })

  checkForm()
}

function updateCount () {
  const length = document.getElementById('reviewText').value.length
  document.getElementById('charCount').textContent = length
  checkForm()
}

function handleUpload (event) {
  const file = event.target.files[0]

  if (!file) return

  uploadedPhotoFile = file

  const reader = new FileReader()

  reader.onload = function (e) {
    document.getElementById('uploadBox').innerHTML = `
            <img src="${e.target.result}" class="upload-preview" alt="Preview">
        `
  }

  reader.readAsDataURL(file)
}

function checkForm () {
  const trip = document.getElementById('tripSelect').value
  const attraction = document.getElementById('attractionSelect').value
  const text = document.getElementById('reviewText').value.trim()

  const isReady =
    trip !== '' && attraction !== '' && currentRating > 0 && text.length > 0

  const submitBtn = document.getElementById('submitBtn')
  const submitHint = document.getElementById('submitHint')

  submitBtn.classList.toggle('ready', isReady)
  submitHint.style.display = isReady ? 'none' : 'block'
}

function submitReview () {
  const submitBtn = document.getElementById('submitBtn')

  if (!submitBtn.classList.contains('ready')) return

  const attractionId = document.getElementById('attractionSelect').value
  const comment = document.getElementById('reviewText').value.trim()

  const formData = new FormData()
  formData.append('attraction_id', attractionId)
  formData.append('rating', currentRating)
  formData.append('comment', comment)

  if (uploadedPhotoFile) {
    formData.append('photo', uploadedPhotoFile)
  }

  fetch('review.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        resetReviewForm()
        document.getElementById('popupOverlay').classList.add('active')
        loadReviews()
      } else {
        alert(data.message || 'Error submitting review.')
      }
    })
    .catch(error => console.error('Error submitting review:', error))
}

function resetReviewForm () {
  document.getElementById('tripSelect').value = ''

  const attractionSelect = document.getElementById('attractionSelect')
  attractionSelect.innerHTML = '<option value="">Choose an attraction</option>'
  attractionSelect.disabled = true

  document.getElementById('reviewText').value = ''
  document.getElementById('charCount').textContent = '0'

  currentRating = 0
  uploadedPhotoFile = null

  document.querySelectorAll('#starRow .star').forEach(function (star) {
    star.classList.remove('filled')
  })

  document.getElementById('photoUpload').value = ''

  document.getElementById('uploadBox').innerHTML = `
        <div class="upload-icon">⬆</div>
        <p id="uploadLabel">Click to upload</p>
    `

  checkForm()
}

function closePopup () {
  document.getElementById('popupOverlay').classList.remove('active')
}

function loadReviews () {
  fetch('review.php?action=reviews')
    .then(response => response.json())
    .then(data => {
      if (data.status !== 'success') return

      allReviews = data.reviews || []
      renderReviews(allReviews)
      updateAttractionFilter()
    })
    .catch(error => console.error('Error loading reviews:', error))
}

function updateAttractionFilter () {
  const destFilter = document.getElementById('destFilter')
  const currentValue = destFilter.value

  destFilter.innerHTML = '<option value="all">All Attractions</option>'

  const attractions = [
    ...new Set(allReviews.map(r => r.attraction_name).filter(Boolean))
  ]

  attractions.forEach(function (name) {
    destFilter.innerHTML += `
            <option value="${name}">${name}</option>
        `
  })

  if (attractions.includes(currentValue)) {
    destFilter.value = currentValue
  } else {
    destFilter.value = 'all'
  }
}

function openDetail (index) {
  const review = currentRenderedReviews[index]

  if (!review) return

  document.getElementById('detailName').textContent = review.username
  document.getElementById('detailAttraction').textContent =
    review.attraction_name
  document.getElementById('detailDate').textContent = review.review_date
  document.getElementById('detailStars').innerHTML =
    starsHTML(Number(review.rating)) +
    `<span class="rating-num">(${review.rating})</span>`

  document.getElementById('detailText').textContent = review.comment

  const avatar = document.getElementById('detailAvatar')
  const initials = review.username
    ? review.username.substring(0, 2).toUpperCase()
    : 'UN'

  avatar.innerHTML = review.user_profile
    ? `<img class="avatar-img" src="../../../assets/images/profile/${review.user_profile}" alt="${review.username}">`
    : `<div class="avatar-circle">${initials}</div>`

  const photo = document.getElementById('detailPhoto')

  if (review.photo) {
    photo.src = '../../../assets/images/profile/' + review.photo
    photo.onerror = function () {
      this.onerror = null
      this.src = 'https://placehold.co/600x360?text=No+Photo'
    }
    photo.style.display = 'block'
  } else {
    photo.src = 'https://placehold.co/600x360?text=No+Photo'
    photo.style.display = 'block'
  }

  document.getElementById('detailOverlay').classList.add('active')
}

function closeDetail () {
  document.getElementById('detailOverlay').classList.remove('active')
}

function handleUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    const maxSize = 20 * 1024 * 1024; // 20MB

    if (file.size > maxSize) {
        alert('Image is too large. Please upload an image below 2MB.');
        event.target.value = '';
        uploadedPhotoFile = null;
        return;
    }

    uploadedPhotoFile = file;

    const reader = new FileReader();

    reader.onload = function (e) {
        document.getElementById('uploadBox').innerHTML = `
            <img src="${e.target.result}" class="upload-preview" alt="Preview">
        `;
    };

    reader.readAsDataURL(file);
}