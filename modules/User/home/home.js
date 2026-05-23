document.addEventListener('DOMContentLoaded', function () {
    loadHomeData()

    const nextBtn = document.getElementById('recommendedNextBtn')

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            document.getElementById('recommendedGrid').scrollBy({
                left: 320,
                behavior: 'smooth'
            })
        })
    }
})

async function loadHomeData() {
    try {
        const response = await fetch('home.php')
        const data = await response.json()

        loadRecommended(data.recommended || [])
        loadPopularCombos(data.popularCombos || [])
        loadTrending(data.trending || [])

        initScrollFadeAnimation()
    } catch (error) {
        console.error('Failed to load home data:', error)
    }
}

function loadRecommended(list) {

    const container = document.getElementById('recommendedGrid');

    container.innerHTML = '';

    if (list.length === 0) {

        container.innerHTML = `
            <p>No recommended destinations available.</p>
        `;

        return;
    }

    list.forEach(item => {

        console.log("Recommended Item:", item);

        const image = item.attraction_image
            ? `../../../assets/images/attraction/${item.attraction_image}`
            : 'https://placehold.co/400x250?text=No+Image';

        container.innerHTML += `
            <article class="destination-card">

                <div class="destination-image">

                    <img 
                        src="${image}" 
                        alt="${item.attraction_name}"
                        onerror="this.src='https://placehold.co/400x250?text=No+Image'"
                    >

                    <div class="rating-badge">
                        <span>★ ${item.average_rating || '0.0'}</span>
                    </div>

                </div>

                <div class="destination-info">

                    <h3>
                        ${item.city_name}, ${item.country_name}
                    </h3>

                    <p>
                        ${item.total_reviews || 0} reviews
                    </p>

                    <a 
                        href="../attraction_details/attraction_details.html?type=attraction&id=${item.attraction_id}" 
                        class="view-details-btn"
                    >
                        View Details
                    </a>

                </div>

            </article>
        `;

    });

}

function loadPopularCombos(list) {

    const container = document.getElementById('comboGrid');

    container.innerHTML = '';

    if (list.length === 0) {

        container.innerHTML = `
            <p>No popular combos available yet.</p>
        `;

        return;
    }

    list.forEach(item => {

        console.log("Combo Item:", item);

        const comboNames = item.combo_name.split(' + ');

        const shortComboName = comboNames
            .slice(0, 4)
            .join(' + ');

        const finalComboName =
            comboNames.length > 4
                ? `${shortComboName} + more`
                : shortComboName;

        const image = item.combo_image
            ? `../../../assets/images/attraction/${item.combo_image}`
            : 'https://placehold.co/400x250?text=No+Image';

        container.innerHTML += `
            <article class="combo-card">

                <img 
                    src="${image}" 
                    alt="${finalComboName}"
                    onerror="this.src='https://placehold.co/400x250?text=No+Image'"
                >

                <div class="combo-info">

                    <h4>${finalComboName}</h4>

                    <p>
                        ${item.city_name}, ${item.country_name}
                    </p>

                    <span>
                        ${item.total_attractions} attractions
                    </span>

                    <a 
                        href="../attraction_details/attraction_details.html?type=combo&id=${item.trip_id}" 
                        class="combo-view-btn"
                    >
                        View Combo
                    </a>

                </div>

            </article>
        `;

    });

}

function loadTrending(list) {
    const container = document.getElementById('trendingGrid')
    container.innerHTML = ''

    if (list.length === 0) {
        container.innerHTML = `<p>No trending destinations available yet.</p>`
        return
    }

    list.forEach(item => {
        container.innerHTML += `
      <a href="../discovers/discover.html?city_id=${item.city_id}" class="trend-card">
        <img src="../../../assets/images/attraction/${item.attraction_image}">
        <div class="trend-overlay"></div>
        <span class="trend-badge">Trending</span>
        <div class="trend-text">
          <h3>${item.city_name}</h3>
          <p>${item.country_name}</p>
        </div>
      </a>
    `
    })
}

function initScrollFadeAnimation() {
    const fadeItems = document.querySelectorAll('.destination-card, .combo-card')

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show')
                } else {
                    entry.target.classList.remove('show')
                }
            })
        },
        {
            threshold: 0.2
        }
    )

    fadeItems.forEach(item => {
        item.classList.add('scroll-fade')
        observer.observe(item)
    })
}
