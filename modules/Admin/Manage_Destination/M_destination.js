let destinations = [];
let selectedDestination = null;

document.addEventListener("DOMContentLoaded", () => {
    loadPopup();
    loadDestinations();

    document.getElementById("searchInput").addEventListener("input", filterDestinations);
    document.getElementById("countryFilter").addEventListener("change", filterDestinations);
    document.getElementById("categoryFilter").addEventListener("change", filterDestinations);
});

async function loadPopup() {
    const response = await fetch("popup.html");
    const html = await response.text();
    document.getElementById("popup-container").innerHTML = html;
}

async function loadDestinations() {
    const response = await fetch("destination.php");
    destinations = await response.json();

    loadFilters();
    displayDestinations(destinations);
}

function loadFilters() {
    const countryFilter = document.getElementById("countryFilter");
    const categoryFilter = document.getElementById("categoryFilter");

    const countries = [...new Set(destinations.map(d => d.country_name).filter(Boolean))];
    const categories = [...new Set(destinations.map(d => d.attraction_category).filter(Boolean))];

    countries.forEach(country => {
        countryFilter.innerHTML += `<option value="${country}">${country}</option>`;
    });

    categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    });
}

function filterDestinations() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const country = document.getElementById("countryFilter").value;
    const category = document.getElementById("categoryFilter").value;

    const filtered = destinations.filter(d => {
        return (
            d.attraction_name.toLowerCase().includes(search) &&
            (country === "" || d.country_name === country) &&
            (category === "" || d.attraction_category === category)
        );
    });

    displayDestinations(filtered);
}

function displayDestinations(data) {
    const grid = document.getElementById("destinationGrid");
    grid.innerHTML = "";

    data.forEach(destination => {
        grid.innerHTML += `
            <div class="destination-card" onclick='openInfoModal(${JSON.stringify(destination)})'>

                <img class="destination-image"
                     src="/Trev/assets/images/${destination.attraction_image}">

                <div class="destination-content">

                    <h2>${destination.attraction_name}</h2>

                    <p>${destination.country_name || ""} • ${destination.attraction_category || ""}</p>

                    <div class="stars">
                        ${generateStars(destination.avg_rating)}
                        <span>${destination.avg_rating}</span>
                    </div>

                </div>

            </div>
        `;
    });
}

function generateStars(rating) {
    let stars = "";
    let rounded = Math.round(rating);

    for(let i = 1; i <= 5; i++) {
        stars += i <= rounded ? "★" : "☆";
    }

    return stars;
}

function openInfoModal(destination) {
    selectedDestination = destination;

    document.getElementById("infoModal").style.display = "flex";
    document.getElementById("infoImage").src = "/Trev/assets/images/" + destination.attraction_image;
    document.getElementById("infoTitle").innerText = destination.attraction_name;
    document.getElementById("infoCategory").innerText = destination.country_name + " • " + destination.attraction_category;
    document.getElementById("infoStars").innerHTML = generateStars(destination.avg_rating) + " " + destination.avg_rating;
    document.getElementById("infoDescription").innerText = destination.attraction_description || "No description available.";
}

function closeInfoModal() {
    document.getElementById("infoModal").style.display = "none";
}

function openAddModal() {
    document.getElementById("addStep1").style.display = "flex";
}

function closeAddModal() {
    document.getElementById("addStep1").style.display = "none";
    document.getElementById("addStep2").style.display = "none";
    document.getElementById("addStep3").style.display = "none";
}

function nextAdd(step) {
    document.getElementById("addStep" + step).style.display = "none";
    document.getElementById("addStep" + (step + 1)).style.display = "flex";
}

function backAdd(step) {
    document.getElementById("addStep" + step).style.display = "none";
    document.getElementById("addStep" + (step - 1)).style.display = "flex";
}

function openEditModal() {
    closeInfoModal();

    document.getElementById("editName").value = selectedDestination.attraction_name;
    document.getElementById("editCategory").value = selectedDestination.attraction_category;
    document.getElementById("editImage").value = selectedDestination.attraction_image;
    document.getElementById("editDescription").value = selectedDestination.attraction_description || "";

    document.getElementById("editStep1").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editStep1").style.display = "none";
    document.getElementById("editStep2").style.display = "none";
    document.getElementById("editStep3").style.display = "none";
}

function nextEdit(step) {
    document.getElementById("editStep" + step).style.display = "none";
    document.getElementById("editStep" + (step + 1)).style.display = "flex";
}

function backEdit(step) {
    document.getElementById("editStep" + step).style.display = "none";
    document.getElementById("editStep" + (step - 1)).style.display = "flex";
}

function openDeleteModal() {
    closeInfoModal();
    document.getElementById("deleteName").innerText = selectedDestination.attraction_name;
    document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
}