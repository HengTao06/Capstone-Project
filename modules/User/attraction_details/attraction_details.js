document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('backBtn').addEventListener('click', function () {
    window.location.href = '../discovers/discover.html'
  })

  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  const type = params.get('type')

  try {
    const res = await fetch(`attraction_details.php?type=${type}&id=${id}`)
    const data = await res.json()

    if (data.status !== 'ok') return

    render(data)
  } catch (e) {
    console.error('Load failed', e)
  }
})

function renderStars(rating) {
  const fullStars = Math.round(Number(rating) || 0)
  let stars = ''

  for (let i = 1; i <= 5; i++) {
    stars += i <= fullStars ? '★' : '☆'
  }

  return `<span class="star-rating">${stars}</span>`
}

function render(data) {
  console.log("FULL DETAIL DATA:", data);
  document.getElementById('hero-img').src = data.image
    ? `../../../assets/images/attraction/${data.image}`
    : 'https://placehold.co/800x300'

  document.getElementById('title').innerText = data.name
  document.getElementById('location').innerText = data.location
  document.getElementById('description').innerText =
    data.description || 'No description.'

  document.getElementById('rating').innerHTML = `${renderStars(
    data.rating
  )} <span class="rating-number">${data.rating}</span>`
  document.getElementById('reviewCount').innerText = data.review_count
  document.getElementById('estimatedPrice').innerText = Number(
    data.estimated_price || 0
  ).toFixed(2)

  // categories
  const catDiv = document.getElementById('categories')
  catDiv.innerHTML = ''
  data.categories.forEach(c => {
    catDiv.innerHTML += `<span>${c}</span>`
  })

  // reviews
  const reviewDiv = document.getElementById('reviews')
  reviewDiv.innerHTML = ''

  data.reviews.forEach(r => {
    reviewDiv.innerHTML += `
    <div class="review">
      <div class="review-avatar">
        ${r.profile_picture
        ? `<img src="../../../assets/images/profile/${r.profile_picture}" alt="${r.username}">`
        : `${r.username ? r.username.charAt(0).toUpperCase() : 'U'}`
      }
      </div>

      <div class="review-content">
        <div class="review-header">
          <strong>${r.username || 'User'}</strong>
          <span class="review-date">${r.review_date || ''}</span>
        </div>

        <div class="review-stars">
          ${renderStars(r.rating)}
          <span class="rating-number">${r.rating}</span>
        </div>

        <p>${r.comment || 'No comment provided.'}</p>
      </div>
    </div>
  `
  })

  // button
  document.getElementById('addTripBtn').onclick = () => {
    console.log("DETAIL DATA:", data);

    if (data.type === "combo") {
      window.location.href =
        `../tripPlanner/tripPlanner.html?city_id=${encodeURIComponent(data.city_id)}&combo_id=${encodeURIComponent(data.id)}`;
    } else {
      window.location.href =
        `../tripPlanner/tripPlanner.html?city_id=${encodeURIComponent(data.city_id)}&attraction_id=${encodeURIComponent(data.id)}`;
    }
  };
}
