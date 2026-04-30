document.addEventListener("DOMContentLoaded", function () {
  loadHomeData();
});

async function loadHomeData() {
  try {
    const response = await fetch("home.php");
    const data = await response.json();

    loadRecommended(data.recommended || []);
    loadPopularCombos(data.popularCombos || []);
    loadTrending(data.trending || []);
  } catch (error) {
    console.error("Failed to load home data:", error);
  }
}

function loadRecommended(list) {
  const container = document.getElementById("recommendedGrid");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p>No recommended destinations available.</p>`;
    return;
  }

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

function loadPopularCombos(list) {
  const container = document.getElementById("comboGrid");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p>No popular combos available yet.</p>`;
    return;
  }

  list.forEach(item => {
    const comboNames = item.combo_name.split(" + ");
    const shortComboName = comboNames.slice(0, 4).join(" + ");
    const finalComboName = comboNames.length > 3 ? `${shortComboName} + more` : shortComboName;

    container.innerHTML += `
      <article class="combo-card">
        <img src="../../../assets/images/${item.combo_image}" alt="${finalComboName}">

        <div class="combo-info">
          <h4>${finalComboName}</h4>
          <p>${item.city_name}, ${item.country_name}</p>
          <span>${item.total_attractions} attractions</span>
          <button href="../tripPlanner/tripPlanner.html" class="combo-view-btn">View Combo</button>
        </div>
      </article>
    `;
  });
}

function loadTrending(list) {
  const container = document.getElementById("trendingGrid");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p>No trending destinations available yet.</p>`;
    return;
  }

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

document.getElementById("recommendedNextBtn").addEventListener("click", function () {
  document.getElementById("recommendedGrid").scrollBy({
    left: 320,
    behavior: "smooth"
  });
});