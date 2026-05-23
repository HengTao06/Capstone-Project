let allReviews = [];
let filteredReviews = [];
let deleteReviewId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadReviews();
    bindModalEvents();
    bindFilterEvents();
});

function bindFilterEvents() {
    document.getElementById("searchInput").addEventListener("input", applyFilters);
    document.getElementById("countryFilter").addEventListener("change", handleCountryChange);
    document.getElementById("cityFilter").addEventListener("change", handleCityChange);
    document.getElementById("attractionFilter").addEventListener("change", applyFilters);
    document.getElementById("ratingFilter").addEventListener("change", applyFilters);
}

async function loadReviews() {
    const reviewGrid = document.getElementById("reviewGrid");

    try {
        reviewGrid.innerHTML = `<div class="empty-review">Loading reviews...</div>`;

        const response = await fetch("M_reviews.php?action=list");
        const data = await response.json();

        if (data.status !== "success") {
            reviewGrid.innerHTML = `<div class="empty-review">${data.message || "Failed to load reviews."}</div>`;
            return;
        }

        allReviews = data.reviews || [];
        filteredReviews = [...allReviews];

        loadCountryFilter();
        loadCityFilter();
        loadAttractionFilter();
        renderReviews(filteredReviews);

    } catch (error) {
        console.error("Failed to load reviews:", error);
        reviewGrid.innerHTML = `<div class="empty-review">Failed to load reviews.</div>`;
    }
}

function loadCountryFilter() {
    const countryFilter = document.getElementById("countryFilter");
    countryFilter.innerHTML = `<option value="">All Countries</option>`;

    const countries = [...new Set(allReviews.map(r => r.country_name).filter(Boolean))];

    countries.forEach(country => {
        countryFilter.innerHTML += `<option value="${escapeHTML(country)}">${escapeHTML(country)}</option>`;
    });
}

function loadCityFilter(country = "") {
    const cityFilter = document.getElementById("cityFilter");
    cityFilter.innerHTML = `<option value="">All Cities</option>`;

    let data = [...allReviews];

    if (country) {
        data = data.filter(r => r.country_name === country);
    }

    const cities = [...new Set(data.map(r => r.city_name).filter(Boolean))];

    cities.forEach(city => {
        cityFilter.innerHTML += `<option value="${escapeHTML(city)}">${escapeHTML(city)}</option>`;
    });
}

function loadAttractionFilter(country = "", city = "") {
    const attractionFilter = document.getElementById("attractionFilter");
    attractionFilter.innerHTML = `<option value="">All Attractions</option>`;

    let data = [...allReviews];

    if (country) {
        data = data.filter(r => r.country_name === country);
    }

    if (city) {
        data = data.filter(r => r.city_name === city);
    }

    const attractions = [...new Set(data.map(r => r.attraction_name).filter(Boolean))];

    attractions.forEach(attraction => {
        attractionFilter.innerHTML += `<option value="${escapeHTML(attraction)}">${escapeHTML(attraction)}</option>`;
    });
}

function handleCountryChange() {
    const country = document.getElementById("countryFilter").value;

    document.getElementById("cityFilter").value = "";
    document.getElementById("attractionFilter").value = "";

    loadCityFilter(country);
    loadAttractionFilter(country, "");

    applyFilters();
}

function handleCityChange() {
    const country = document.getElementById("countryFilter").value;
    const city = document.getElementById("cityFilter").value;

    document.getElementById("attractionFilter").value = "";

    loadAttractionFilter(country, city);

    applyFilters();
}

function applyFilters() {
    const search = document.getElementById("searchInput").value.toLowerCase().trim();
    const country = document.getElementById("countryFilter").value;
    const city = document.getElementById("cityFilter").value;
    const attraction = document.getElementById("attractionFilter").value;
    const rating = document.getElementById("ratingFilter").value;

    filteredReviews = allReviews.filter(r => {
        const searchTarget = `
            ${r.username || ""}
            ${r.attraction_name || ""}
            ${r.comment || ""}
            ${r.city_name || ""}
            ${r.country_name || ""}
        `.toLowerCase();

        return (
            searchTarget.includes(search) &&
            (country === "" || r.country_name === country) &&
            (city === "" || r.city_name === city) &&
            (attraction === "" || r.attraction_name === attraction) &&
            (rating === "" || Number(r.rating) === Number(rating))
        );
    });

    renderReviews(filteredReviews);
}

function renderReviews(reviews) {
    const reviewGrid = document.getElementById("reviewGrid");
    const reviewCount = document.getElementById("reviewCount");

    reviewCount.textContent = `${reviews.length} reviews found`;

    if (!reviews || reviews.length === 0) {
        reviewGrid.innerHTML = `<div class="empty-review">No reviews found.</div>`;
        return;
    }

    reviewGrid.innerHTML = "";

    reviews.forEach(review => {
        const reviewImage = review.photo
            ? `/Trev/assets/images/review/${review.photo}`
            : `/Trev/assets/images/attraction/${review.attraction_image || "default.jpg"}`;

        const userImage = review.user_profile
            ? `/Trev/assets/images/profile/${review.user_profile}`
            : `/Trev/assets/images/profile/black.png`;

        const card = document.createElement("div");
        card.className = "review-card";

        card.innerHTML = `
            <img class="review-image"
                 src="${reviewImage}"
                 onerror="this.src='https://placehold.co/600x400?text=No+Image'"
                 alt="${escapeHTML(review.attraction_name || "Review")}">

            <div class="review-content">
                <div class="review-user">
                    <img src="${userImage}"
                         onerror="this.src='/Trev/assets/images/profile/black.png'"
                         alt="${escapeHTML(review.username || "User")}">

                    <div>
                        <h3>${escapeHTML(review.username || "User")}</h3>
                        <p class="review-date">${escapeHTML(review.review_date || "")}</p>
                        <div class="stars">${generateStars(review.rating)}</div>
                    </div>
                </div>

                <h2>${escapeHTML(review.attraction_name || "Unknown Attraction")}</h2>

                <p class="review-location">
                    ${escapeHTML(review.city_name || "")}, ${escapeHTML(review.country_name || "")}
                </p>

                <p class="review-comment">
                    ${escapeHTML(review.comment || "No comment provided.")}
                </p>

                <div class="review-buttons">
                    <button class="view-btn" data-id="${review.review_id}">
                        View
                    </button>

                    <button class="delete-btn" data-id="${review.review_id}">
                        Delete
                    </button>
                </div>
            </div>
        `;

        reviewGrid.appendChild(card);
    });

    bindReviewButtons();
}

function bindReviewButtons() {
    document.querySelectorAll(".view-btn").forEach(button => {
        button.addEventListener("click", () => {
            const reviewId = button.dataset.id;
            const review = allReviews.find(r => String(r.review_id) === String(reviewId));

            if (review) openReviewModal(review);
        });
    });

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", () => {
            const reviewId = button.dataset.id;
            const review = allReviews.find(r => String(r.review_id) === String(reviewId));

            deleteReviewId = reviewId;
            document.getElementById("deleteReviewName").textContent =
                review ? review.attraction_name : "this review";

            openDeleteModal();
        });
    });
}

function openReviewModal(review) {
    const reviewImage = review.photo
        ? `/Trev/assets/images/review/${review.photo}`
        : `/Trev/assets/images/attraction/${review.attraction_image || "default.jpg"}`;

    const userImage = review.user_profile
        ? `/Trev/assets/images/profile${review.user_profile}`
        : `/Trev/assets/images/profile/black.png`;

    document.getElementById("modalUser").innerText = review.username || "User";
    document.getElementById("modalLocation").innerText =
        `${review.city_name || ""}, ${review.country_name || ""}`;
    document.getElementById("modalRating").innerHTML = generateStars(review.rating);
    document.getElementById("modalComment").innerText = review.comment || "No comment provided.";
    document.getElementById("modalAttractionName").innerText =
        review.attraction_name || "Unknown Attraction";
    document.getElementById("modalDate").innerText = review.review_date || "";

    document.getElementById("modalImage").src = reviewImage;
    document.getElementById("modalImage").onerror = function () {
        this.src = "https://placehold.co/600x400?text=No+Image";
    };

    document.getElementById("modalUserImage").src = userImage;
    document.getElementById("modalUserImage").onerror = function () {
        this.src = "/Trev/assets/images/profile/black.png";
    };

    document.getElementById("reviewModal").classList.add("active");
}

function closeReviewModal() {
    document.getElementById("reviewModal").classList.remove("active");
}

function openDeleteModal() {
    document.getElementById("deleteModal").classList.add("active");
}

function closeDeleteModal() {
    document.getElementById("deleteModal").classList.remove("active");
    deleteReviewId = null;
}

function bindModalEvents() {
    document.getElementById("closeReviewModal").addEventListener("click", closeReviewModal);
    document.getElementById("closeReviewModalBottom").addEventListener("click", closeReviewModal);
    document.getElementById("cancelDeleteBtn").addEventListener("click", closeDeleteModal);

    document.getElementById("confirmDeleteBtn").addEventListener("click", deleteReview);

    document.getElementById("reviewModal").addEventListener("click", event => {
        if (event.target.id === "reviewModal") closeReviewModal();
    });

    document.getElementById("deleteModal").addEventListener("click", event => {
        if (event.target.id === "deleteModal") closeDeleteModal();
    });
}

async function deleteReview() {
    if (!deleteReviewId) return;

    const formData = new FormData();
    formData.append("action", "delete");
    formData.append("review_id", deleteReviewId);

    try {
        const response = await fetch("M_reviews.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.status === "success") {
            closeDeleteModal();
            await loadReviews();
        } else {
            alert(result.message || "Failed to delete review.");
        }

    } catch (error) {
        console.error("Delete failed:", error);
        alert("Something went wrong while deleting the review.");
    }
}

function generateStars(rating) {
    const value = Number(rating || 0);
    let stars = "";

    for (let i = 1; i <= 5; i++) {
        stars += i <= value ? "★" : "☆";
    }

    return stars;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}