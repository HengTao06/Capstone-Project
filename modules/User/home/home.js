document.addEventListener("DOMContentLoaded", function () {
    loadRecommended();
    loadTrending();
});

async function loadRecommended() {
    const container = document.getElementById("recommendedGrid");

    const response = await fetch("home.php");
    const data = await response.json();

    const list = data.recommended; // IMPORTANT

    container.innerHTML = "";

    list.forEach(item => {
        container.innerHTML += `
        <article class="destination-card">
            <div class="destination-image">
                <img src="../../../assets/images/${item.attraction_image}" alt="${item.attraction_name}">
                <div class="rating-badge">
                    <span>★ ${item.average_rating}</span>
                </div>
            </div>

            <div class="destination-info">
                <h3>${item.city_name}, ${item.country_name}</h3>
                <p>${item.total_reviews} reviews</p>
                <button>View Details</button>
            </div>
        </article>
        `;
    });
}

async function loadTrending() {
    const container = document.getElementById("trendingGrid");

    const response = await fetch("home.php");
    const data = await response.json();

    const list = data.trending; // IMPORTANT

    container.innerHTML = "";

    list.forEach(item => {
        container.innerHTML += `
        <article class="trend-card">
            <img src="../../../assets/images/${item.attraction_image}">
            <div class="trend-overlay"></div>
            <span class="trend-badge">Trending</span>
            <div class="trend-text">
                <h3>${item.city_name}</h3>
                <p>${item.country_name}</p>
            </div>
        </article>
        `;
    });
}