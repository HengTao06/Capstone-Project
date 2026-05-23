let popChartInstance = null;
let combosChartInstance = null;
let lineChartInstance = null;
let globalComboData = {};

document.addEventListener("DOMContentLoaded", function () {
    loadAnalyticsData();
    fixBrokenLogos();
    setTimeout(fixBrokenLogos, 300);
});

function fixBrokenLogos() {
    const logos = document.querySelectorAll('img[alt="Trev Logo"]');
    logos.forEach(logo => { logo.src = "../../../assets/images/home_logo/trev.png"; });
}

async function loadAnalyticsData() {
    try {
        const response = await fetch("Analytics.php");
        const textData = await response.text();
        const data = JSON.parse(textData);

        if (data.error || !data.popularDestinations || data.popularDestinations.data.length === 0) {
            loadMockData(); 
            return;
        }

        renderBarChart(data.popularDestinations.labels, data.popularDestinations.data);
        renderTopRatedList(data.topRated);
        
        const tripDataObj = data.platformTrips || { labels: [], data: [] };
        renderLineChart(tripDataObj.labels, tripDataObj.data);

        globalComboData = data.travelCombos || {};
        setupComboFilter();

    } catch (error) {
        console.error("Javascript crashed while loading data:", error);
        loadMockData();
    }
}

function setupComboFilter() {
    const filterSelect = document.getElementById("countryComboFilter");
    if (!filterSelect) return; 
    
    filterSelect.innerHTML = ""; 

    const countries = Object.keys(globalComboData);
    if (countries.length === 0 || countries[0] === "labels") {
        filterSelect.innerHTML = `<option>No Combo Data</option>`;
        return;
    }

    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        filterSelect.appendChild(option);
    });

    filterSelect.addEventListener("change", (e) => {
        const chartData = globalComboData[e.target.value];
        renderPieChart(chartData.labels, chartData.data);
    });

    renderPieChart(globalComboData[countries[0]].labels, globalComboData[countries[0]].data);
}

function renderBarChart(labels, data) {
    if (popChartInstance) popChartInstance.destroy();
    const ctx = document.getElementById('popularDestChart').getContext('2d');
    popChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Trips Planned',
                data: data,
                backgroundColor: '#f97316', 
                borderRadius: 6,
                barThickness: 60
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } }
        }
    });
}

function renderPieChart(labels, data) {
    if (combosChartInstance) combosChartInstance.destroy();
    const ctx = document.getElementById('combosChart').getContext('2d');
    combosChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#f97316', '#eab308', '#22c55e',
                 '#3b82f6', '#a855f7'],
                borderWidth: 2, borderColor: '#ffffff'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, 
        plugins: { legend: { position: 'bottom' } } }
    });
}

function renderLineChart(labels, data) {
    if (lineChartInstance) lineChartInstance.destroy();
    const ctx = document.getElementById('bookingsChart').getContext('2d');
    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Trips Planned',
                data: data,
                borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 3, pointBackgroundColor: '#22c55e', pointRadius: 5, fill: true, tension: 0.4 
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] }, suggestedMax: 10 }, x: { grid: { borderDash: [5, 5] } } }
        }
    });
}

function renderTopRatedList(list) {
    const container = document.getElementById('topRatedList');
    if (!container) return;
    container.innerHTML = "";
    list.forEach((item, index) => {
        container.innerHTML += `
            <div class="rated-item">
                <div class="rated-info"><h4>${item.name} <i class="fa-solid fa-star"></i> ${item.rating}</h4><span class="rated-reviews">${item.reviews} reviews</span></div>
                <div class="rated-rank">${index + 1}</div>
            </div>`;
    });
}

function loadMockData() {
    renderBarChart(['Osaka', 'Tokyo', 'Penang'], [8, 1, 1]);
    renderTopRatedList([{ name: "Dotonbori", rating: 5.0, reviews: "1" }, { name: "Tokyo Tower", rating: 5.0, reviews: "1" }]);
    globalComboData = { "Japan": { labels: ['Japan Trip', 'Osaka Trip'], data: [5, 1] } };
    setupComboFilter();
    renderLineChart(['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'], [0, 0, 0, 0, 10, 0]);
}