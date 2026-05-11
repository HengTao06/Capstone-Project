document.addEventListener("DOMContentLoaded", () => {
    loadReviews();
    bindModalEvents();
});

let deleteReviewId = null;
let currentReviews = [];

async function loadReviews() {
    const reviewGrid = document.getElementById("reviewGrid");

    try {
        reviewGrid.innerHTML = `
            <div class="empty-review">Loading reviews...</div>
        `;

        const response = await fetch("M_reviews.php");
        const reviews = await response.json();

        currentReviews = reviews;

        reviewGrid.innerHTML = "";

        if (!Array.isArray(reviews) || reviews.length === 0) {
            reviewGrid.innerHTML = `
                <div class="empty-review">No reviews available.</div>
            `;
            return;
        }

        reviews.forEach(review => {
            const stars = "★".repeat(Number(review.rating || 0));
            const attractionImage = review.attraction_image
                ? `/Trev/assets/images/${review.attraction_image}`
                : `/Trev/assets/images/default.jpg`;

            const userImage = review.user_profile
                ? `/Trev/assets/images/${review.user_profile}`
                : `/Trev/assets/images/black.png`;

            const card = document.createElement("div");
            card.className = "review-card";

            card.innerHTML = `
                <img class="review-image" src="${attractionImage}" 
                     onerror="this.src='/Trev/assets/images/default.jpg'" 
                     alt="${escapeHTML(review.attraction_name || "Attraction")}">

                <div class="review-content">
                    <div class="review-user">
                        <img src="${userImage}" 
                             onerror="this.src='/Trev/assets/images/black.png'" 
                             alt="${escapeHTML(review.username || "User")}">

                        <div>
                            <h3>${escapeHTML(review.username || "User")}</h3>
                            <div class="stars">${stars}</div>
                        </div>
                    </div>

                    <h2>${escapeHTML(review.attraction_name || "Unknown Attraction")}</h2>

                    <p>${escapeHTML(review.comment || "No comment provided.")}</p>

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

    } catch (error) {
        console.error("Failed to load reviews:", error);

        reviewGrid.innerHTML = `
            <div class="empty-review">Failed to load reviews.</div>
        `;
    }
}

function bindReviewButtons() {
    document.querySelectorAll(".view-btn").forEach(button => {
        button.addEventListener("click", () => {
            const reviewId = button.dataset.id;
            const review = currentReviews.find(r => String(r.review_id) === String(reviewId));

            if (review) {
                openReviewModal(review);
            }
        });
    });

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", () => {
            deleteReviewId = button.dataset.id;
            openDeleteModal();
        });
    });
}

function openReviewModal(review) {
    const modal = document.getElementById("reviewModal");

    const attractionImage = review.attraction_image
        ? `/Trev/assets/images/${review.attraction_image}`
        : `/Trev/assets/images/default.jpg`;

    const userImage = review.user_profile
        ? `/Trev/assets/images/${review.user_profile}`
        : `/Trev/assets/images/black.png`;

    document.getElementById("modalUser").innerText = review.username || "User";
    document.getElementById("modalRating").innerHTML = "★".repeat(Number(review.rating || 0));
    document.getElementById("modalComment").innerText = review.comment || "No comment provided.";
    document.getElementById("modalAttractionName").innerText = review.attraction_name || "Unknown Attraction";

    document.getElementById("modalImage").src = attractionImage;
    document.getElementById("modalUserImage").src = userImage;

    modal.classList.add("active");
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

    document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
        if (!deleteReviewId) return;

        try {
            const response = await fetch(`delete_review.php?id=${encodeURIComponent(deleteReviewId)}`);
            const result = await response.json();

            if (result.status === "success") {
                closeDeleteModal();
                loadReviews();
            } else {
                alert(result.message || "Failed to delete review.");
            }

        } catch (error) {
            console.error("Delete failed:", error);
            alert("Something went wrong while deleting the review.");
        }
    });

    document.getElementById("reviewModal").addEventListener("click", event => {
        if (event.target.id === "reviewModal") {
            closeReviewModal();
        }
    });

    document.getElementById("deleteModal").addEventListener("click", event => {
        if (event.target.id === "deleteModal") {
            closeDeleteModal();
        }
    });
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}