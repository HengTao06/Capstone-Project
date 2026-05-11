document.addEventListener("DOMContentLoaded", () => {

    loadReviews();
    loadPopup();

});

async function loadPopup() {

    const response = await fetch("popup.html");

    const html = await response.text();

    document.getElementById("popup-container").innerHTML = html;
}

async function loadReviews() {

    const response = await fetch("reviews.php");

    const reviews = await response.json();

    const reviewGrid = document.getElementById("reviewGrid");

    reviewGrid.innerHTML = "";

    reviews.forEach(review => {

        const stars = "★".repeat(review.rating);

        reviewGrid.innerHTML += `

        <div class="review-card">

            <img class="review-image"
                 src="/Capstone-Project/assets/images/${review.attraction_image}">

            <div class="review-content">

                <div class="review-user">

                    <img src="/Capstone-Project/assets/images/black.png">

                    <div>

                        <h3>${review.username}</h3>

                        <div class="stars">${stars}</div>

                    </div>

                </div>

                <h2>${review.attraction_name}</h2>

                <p>
                    ${review.comment}
                </p>

                <div class="review-buttons">

                    <button class="view-btn"
                            onclick="openModal(
                            '${review.username}',
                            '${review.rating}',
                            '${review.comment}',
                            '/Capstone-Project/assets/images/${review.attraction_image}'
                            )">

                        View
                    </button>

                    <button class="delete-btn"
                            onclick="openDelete(${review.review_id})">

                        Delete
                    </button>

                </div>

            </div>

        </div>

        `;
    });
}

function openModal(user, rating, comment, image) {

    document.getElementById("reviewModal").style.display = "flex";

    document.getElementById("modalUser").innerText = user;

    document.getElementById("modalComment").innerText = comment;

    document.getElementById("modalImage").src = image;

    document.getElementById("modalRating").innerHTML =
        "★".repeat(rating);
}

function closeModal() {

    document.getElementById("reviewModal").style.display = "none";
}

let deleteReviewId = null;

function openDelete(id) {

    deleteReviewId = id;

    document.getElementById("deleteModal").style.display = "flex";
}

function closeDelete() {

    document.getElementById("deleteModal").style.display = "none";
}

document.addEventListener("click", async (e) => {

    if (e.target.id === "confirmDeleteBtn") {

        await fetch("delete_review.php?id=" + deleteReviewId);

        closeDelete();

        loadReviews();
    }
});

window.onclick = function (event) {

    const reviewModal = document.getElementById("reviewModal");

    const deleteModal = document.getElementById("deleteModal");

    if (event.target === reviewModal) {

        closeModal();
    }

    if (event.target === deleteModal) {

        closeDelete();
    }
};