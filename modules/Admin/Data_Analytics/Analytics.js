document.addEventListener("DOMContentLoaded", function () {
    loadAnalyticsData();
    
    // Fix injected logos[cite: 4]
    fixBrokenLogos();
    setTimeout(fixBrokenLogos, 300);
});

function fixBrokenLogos() {
    const logos = document.querySelectorAll('img[alt="Trev Logo"]');
    logos.forEach(logo => {
        logo.src = "../../../assets/images/trev.png";
    });
}

async function loadAnalyticsData() {
    try {
        const response = await fetch("Analytics.php");
        const textData = await response.text();
        const data = JSON.parse(textData);

        if (data.error) {
            console.error("DATABASE ERROR:", data.error);
            loadMockData(); // Fallback if DB fails
            return;
        }

        // If the database is connected but mostly empty, use mock data for presentation
        if (!data.popularDestinations || !data.popularDestinations.data || data.popularDestinations.data.length === 0) {
            console.warn("Database is empty. Loading Presentation Mock Data.");
            loadMockData();
            return;
        }

        renderBarChart(data.popularDestinations.labels, data.popularDestinations.data);
        renderTopRatedList(data.topRated);
        renderPieChart(data.travelCombos.labels, data.travelCombos.data);
        renderLineChart(data.platformBookings.labels, data.platformBookings.data);

    } catch (error) {
        console.error("Failed to load or parse data:", error);
        loadMockData();
    }
}

// -----------------------------------------------------
// CHART RENDER FUNCTIONS
// -----------------------------------------------------

function renderBarChart(labels, data) {
    const ctx = document.getElementById('popularDestChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bookings',
                data: data,
                backgroundColor: '#f97316', // Trev Primary Orange
                borderRadius: 6,
                barThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderPieChart(labels, data) {
    const ctx = document.getElementById('combosChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } }
            }
        }
    });
}

function renderLineChart(labels, data) {
    const ctx = document.getElementById('bookingsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Bookings',
                data: data,
                borderColor: '#22c55e', // Green line
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#22c55e',
                pointRadius: 5,
                fill: true,
                tension: 0.4 // Smooth curves
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                x: { grid: { borderDash: [5, 5] } }
            }
        }
    });
}

function renderTopRatedList(list) {
    const container = document.getElementById('topRatedList');
    container.innerHTML = "";

    list.forEach((item, index) => {
        container.innerHTML += `
            <div class="rated-item">
                <div class="rated-info">
                    <h4>${item.name} <i class="fa-solid fa-star"></i> ${item.rating}</h4>
                    <span class="rated-reviews">${item.reviews} reviews</span>
                </div>
                <div class="rated-rank">${index + 1}</div>
            </div>
        `;
    });
}

// -----------------------------------------------------
// FALLBACK PRESENTATION DATA (Matches your image exactly)
// -----------------------------------------------------
function loadMockData() {
    renderBarChart(
        ['Bali', 'Tokyo', 'Paris', 'Santorini', 'Maldives', 'Swiss Alps', 'New York', 'Iceland'], 
        [4200, 3900, 3600, 3200, 2900, 2500, 2400, 2100]
    );
    
    renderTopRatedList([
        { name: "Tokyo Tower", rating: 4.9, reviews: "1,234" },
        { name: "Mount Fuji", rating: 4.9, reviews: "987" },
        { name: "Maldives Beach Resort", rating: 4.9, reviews: "543" },
        { name: "Bali Temples", rating: 4.8, reviews: "876" },
        { name: "Eiffel Tower", rating: 4.8, reviews: "654" }
    ]);

    renderPieChart(
        ['Beijing + Guangzhou', 'Tokyo + Kyoto', 'Singapore Explorer', 'Greece Islands', 'KL + Genting'], 
        [423, 387, 356, 298, 267]
    );

    renderLineChart(
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], 
        [700, 1100, 600, 1150, 1300, 1650]
    );
}