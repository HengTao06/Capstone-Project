document.addEventListener("DOMContentLoaded", function () {
    loadAdminData();
});

document.addEventListener("DOMContentLoaded", function () {
    loadAdminData();
    fixBrokenLogos();
    setTimeout(fixBrokenLogos, 300);
    setTimeout(fixBrokenLogos, 1000);
});

function fixBrokenLogos() {
    const logos = document.querySelectorAll('img[alt="Trev Logo"]');
    logos.forEach(logo => {
        logo.src = "../../../assets/images/home_logo/trev.png";
    });
}
async function loadAdminData() {
    try {
        const response = await fetch("Dashboard.php");
        const textData = await response.text(); 

        try {
            const data = JSON.parse(textData);

            if (data.error) {
                console.error("DATABASE ERROR:", data.error);
                return;
            }

            if (data.stats) {
                document.getElementById("stat-users").textContent = data.stats.users;
                document.getElementById("stat-trips").textContent = data.stats.trips;
                document.getElementById("stat-reviews").textContent = data.stats.reviews;
                document.getElementById("stat-dest").textContent = data.stats.destinations;
            }

            loadTopDestinations(data.topDestinations || []);
            loadTopReviews(data.topReviews || []);
            initScrollFadeAnimation();

        } catch (jsonError) {
            console.error("PHP file did not return valid JSON. Here is what it returned:", textData);
        }

    } catch (error) {
        console.error("Fetch request failed entirely:", error);
    }
}

function loadTopDestinations(list) {
    const container = document.getElementById("adminDestGrid");
    if (!container) return;
    container.innerHTML = ""; 

    if (list.length === 0) {
        container.innerHTML = `<p>No destinations found in database.</p>`;
        return;
    }

    list.forEach((item, index) => {
        container.innerHTML += `
        <article class="dest-card scroll-fade">
            <div class="dest-card__img-wrap">
                <span class="admin-rank-badge">${index + 1}</span>
                <img src="${item.attraction_image}" alt="${item.attraction_name}">
            </div>
            <div class="dest-card__body">
                <h3 class="dest-card__name">${item.attraction_name}</h3>
                <div class="dest-card__meta"><i class="fa-solid fa-location-dot"></i> ${item.location}</div>
                <div class="dest-visits"><i class="fa-solid fa-chart-line"></i> ${item.visits} visits</div>
            </div>
        </article>
        `;
    });
}

function loadTopReviews(list) {
    const container = document.getElementById("adminReviewGrid");
    if (!container) return;
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = `<p>No reviews found in database.</p>`;
        return;
    }

    list.forEach(item => {
        const starsHtml = '<i class="fa-solid fa-star"></i>'.repeat(item.rating);
        container.innerHTML += `
        <div class="review-card scroll-fade">
            <div class="review-header">
                <div class="user-info">
                    <img src="${item.user_image}" alt="${item.user_name}">
                    <div class="user-details">
                        <h4>${item.user_name}</h4>
                        <div class="attraction-name">${item.attraction_name}</div>
                        <div class="stars">${starsHtml} <span>(${item.rating})</span></div>
                    </div>
                </div>
                <div class="review-date">${item.date_posted}</div>
            </div>
            <img src="${item.review_image}" alt="Review" class="review-img">
            <p class="review-text">${item.review_text}</p>
        </div>
        `;
    });
}

function initScrollFadeAnimation() {
    const fadeItems = document.querySelectorAll(".stat-card, .dest-card, .review-card");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("show");
        });
    }, { threshold: 0.1 });

    fadeItems.forEach(item => {
        item.classList.add("scroll-fade");
        observer.observe(item);
    });
}