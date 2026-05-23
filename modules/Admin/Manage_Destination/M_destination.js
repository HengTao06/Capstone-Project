let destinations = [];
let selectedDestination = null;
let countries = [];

document.addEventListener("DOMContentLoaded", () => {
    loadInitialData();

    document.getElementById("searchInput").addEventListener("input", filterDestinations);
    document.getElementById("countryFilter").addEventListener("change", filterDestinations);
    document.getElementById("categoryFilter").addEventListener("change", filterDestinations);

    document.getElementById("countrySelect").addEventListener("change", function () {
        loadCities(this.value);
    });
});

async function loadInitialData() {
    await loadCountries();
    await loadDestinations();
}

async function loadCountries() {
    const response = await fetch("M_destination.php?action=countries");
    const data = await response.json();

    countries = data.countries || [];

    const countryFilter = document.getElementById("countryFilter");
    const countrySelect = document.getElementById("countrySelect");

    countryFilter.innerHTML = `<option value="">All Countries</option>`;
    countrySelect.innerHTML = `<option value="">Select country</option>`;

    countries.forEach(country => {
        countryFilter.innerHTML += `
            <option value="${country.country_name}">
                ${country.country_name}
            </option>
        `;

        countrySelect.innerHTML += `
            <option value="${country.country_id}">
                ${country.country_name}
            </option>
        `;
    });
}

async function loadCities(countryId, selectedCityId = "") {
    const citySelect = document.getElementById("citySelect");

    citySelect.innerHTML = `<option value="">Select city</option>`;

    if (!countryId) return;

    const response = await fetch("M_destination.php?action=cities&country_id=" + countryId);
    const data = await response.json();

    if (data.cities) {
        data.cities.forEach(city => {
            citySelect.innerHTML += `
                <option value="${city.city_id}">
                    ${city.city_name}
                </option>
            `;
        });
    }

    if (selectedCityId) {
        citySelect.value = selectedCityId;
    }
}

async function loadDestinations() {
    const response = await fetch("M_destination.php?action=list");
    const data = await response.json();

    destinations = data.destinations || [];

    loadCategoryFilter();
    displayDestinations(destinations);
}

function loadCategoryFilter() {
    const categoryFilter = document.getElementById("categoryFilter");

    categoryFilter.innerHTML = `<option value="">All Categories</option>`;

    const categories = [
        ...new Set(destinations.map(d => d.attraction_category).filter(Boolean))
    ];

    categories.forEach(category => {
        categoryFilter.innerHTML += `
            <option value="${category}">
                ${category}
            </option>
        `;
    });
}

function filterDestinations() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const country = document.getElementById("countryFilter").value;
    const category = document.getElementById("categoryFilter").value;

    const filtered = destinations.filter(d => {
        return (
            (
                d.attraction_name.toLowerCase().includes(search) ||
                d.city_name.toLowerCase().includes(search) ||
                d.country_name.toLowerCase().includes(search) ||
                d.attraction_category.toLowerCase().includes(search)
            ) &&
            (country === "" || d.country_name === country) &&
            (category === "" || d.attraction_category === category)
        );
    });

    displayDestinations(filtered);
}

function displayDestinations(data) {
    console.log("displayDestinations called");
    console.log("Data received:", data);

    const grid = document.getElementById("destinationGrid");

    console.log("destinationGrid:", grid);

    if (!grid) {
        console.error("ERROR: #destinationGrid not found");
        alert("Debug: destinationGrid not found");
        return;
    }

    if (!data || data.length === 0) {
        grid.innerHTML = `
            <div class="empty-box">
                No destinations found.
            </div>
        `;
        return;
    }

    grid.innerHTML = "";

    data.forEach((destination) => {
        console.log("Creating card for:", destination);

        const image = destination.attraction_image
            ? `/Trev/assets/images/attraction/${destination.attraction_image}`
            : "https://placehold.co/600x400?text=No+Image";

        const card = document.createElement("div");
        card.className = "destination-card";

        card.innerHTML = `
            <img class="destination-image"
                 src="${image}"
                 onerror="this.src='https://placehold.co/600x400?text=No+Image'">

            <div class="destination-content">
                <h2>${destination.attraction_name}</h2>

                <p class="destination-location">
                    ${destination.city_name}, ${destination.country_name}
                </p>

                <span class="destination-category">
                    ${destination.attraction_category}
                </span>

                <div class="stars">
                    ${generateStars(destination.avg_rating)}
                    <span>${destination.avg_rating}</span>
                </div>
            </div>
        `;

        card.addEventListener("click", function () {
            console.log("Card clicked:", destination);
            openInfoModal(destination);
        });

        grid.appendChild(card);
    });
}

function generateStars(rating) {
    let stars = "";
    let rounded = Math.round(Number(rating));

    for (let i = 1; i <= 5; i++) {
        stars += i <= rounded ? "★" : "☆";
    }

    return stars;
}

function openInfoModal(destination) {
    console.log("openInfoModal called");
    console.log("Selected destination:", destination);

    selectedDestination = destination;

    const infoModal = document.getElementById("infoModal");
    const infoImage = document.getElementById("infoImage");
    const infoTitle = document.getElementById("infoTitle");
    const infoLocation = document.getElementById("infoLocation");
    const infoCategory = document.getElementById("infoCategory");
    const infoRating = document.getElementById("infoRating");
    const infoDescription = document.getElementById("infoDescription");

    console.log("infoModal:", infoModal);
    console.log("infoImage:", infoImage);
    console.log("infoTitle:", infoTitle);
    console.log("infoLocation:", infoLocation);
    console.log("infoCategory:", infoCategory);
    console.log("infoRating:", infoRating);
    console.log("infoDescription:", infoDescription);

    if (!infoModal) {
        console.error("ERROR: #infoModal not found in HTML");
        alert("Debug: infoModal not found");
        return;
    }

    if (!infoImage || !infoTitle || !infoLocation || !infoCategory || !infoRating || !infoDescription) {
        console.error("ERROR: Some modal elements are missing");
        alert("Debug: Some modal elements are missing. Check console.");
        return;
    }

    infoImage.src = destination.attraction_image
        ? `/Trev/assets/images/attraction/${destination.attraction_image}`
        : "https://placehold.co/600x400?text=No+Image";

    infoTitle.innerText = destination.attraction_name || "No Name";

    infoLocation.innerText =
        `${destination.city_name || ""}, ${destination.country_name || ""}`;

    infoCategory.innerText =
        destination.attraction_category || "No Category";

    infoRating.innerText =
        `★ ${destination.avg_rating || "0.0"}`;

    infoDescription.innerText =
        destination.attraction_description || "No description available.";

    openModal("infoModal");
}

function openAddModal() {
    selectedDestination = null;

    document.getElementById("formTitle").innerText = "Add Destination";
    document.getElementById("attractionId").value = "";
    document.getElementById("attractionName").value = "";
    document.getElementById("countrySelect").value = "";
    document.getElementById("citySelect").innerHTML = `<option value="">Select city</option>`;
    document.getElementById("attractionCategory").value = "";
    document.getElementById("attractionImage").value = "";
    document.getElementById("attractionDescription").value = "";

    openModal("formModal");
}

async function openEditModal() {
    if (!selectedDestination) return;

    closeModal("infoModal");

    document.getElementById("formTitle").innerText = "Edit Destination";

    document.getElementById("attractionId").value =
        selectedDestination.attraction_id;

    document.getElementById("attractionName").value =
        selectedDestination.attraction_name;

    document.getElementById("countrySelect").value =
        selectedDestination.country_id;

    await loadCities(
        selectedDestination.country_id,
        selectedDestination.city_id
    );

    document.getElementById("estimatedPrice").value =
        selectedDestination.estimated_price;

    document.getElementById("bestSeason").value =
        selectedDestination.best_season;

    document.getElementById("attractionCategory").value =
        selectedDestination.attraction_category;

    document.getElementById("attractionImage").value =
        selectedDestination.attraction_image;

    document.getElementById("currentImageText").textContent =
        "Current image: " + selectedDestination.attraction_image;

    document.getElementById("attractionDescription").value =
        selectedDestination.attraction_description || "";

    openModal("formModal");
}

function openDeleteModal() {
    if (!selectedDestination) return;

    closeModal("infoModal");

    document.getElementById("deleteName").innerText =
        selectedDestination.attraction_name;

    openModal("deleteModal");
}

async function saveDestination() {
    const id = document.getElementById("attractionId").value;
    const name = document.getElementById("attractionName").value.trim();
    const cityId = document.getElementById("citySelect").value;
    const category = document.getElementById("attractionCategory").value.trim();
    const description = document.getElementById("attractionDescription").value.trim();
    const estimatedPrice = document.getElementById("estimatedPrice").value;
    const bestSeason = document.getElementById("bestSeason").value;

    const oldImage = document.getElementById("attractionImage").value;
    const imageFile = document.getElementById("attractionImageFile").files[0];

    if (!name || !cityId || !category || !description ||
        !estimatedPrice ||
        !bestSeason) {
        alert("Please complete all required fields.");
        return;
    }

    if (!id && !imageFile) {
        alert("Please upload an image.");
        return;
    }

    const formData = new FormData();

    formData.append("action", id ? "update" : "add");
    formData.append("attraction_id", id);
    formData.append("attraction_name", name);
    formData.append("city_id", cityId);
    formData.append("attraction_category", category);
    formData.append("attraction_description", description);
    formData.append("estimated_price", estimatedPrice);
    formData.append("best_season", bestSeason);
    formData.append("old_image", oldImage);

    if (imageFile) {
        formData.append("attraction_image_file", imageFile);
    }

    const response = await fetch("M_destination.php", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    if (data.status === "success") {
        closeModal("formModal");
        await loadDestinations();
        alert(data.message);
    } else {
        alert(data.message || "Failed to save destination.");
    }
}

async function confirmDelete() {
    if (!selectedDestination) return;

    const formData = new FormData();

    formData.append("action", "delete");
    formData.append("attraction_id", selectedDestination.attraction_id);

    const response = await fetch("M_destination.php", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    if (data.status === "success") {
        closeModal("deleteModal");
        await loadDestinations();
        alert(data.message);
    } else {
        alert(data.message || "Failed to delete destination.");
    }
}

function openModal(id) {
    console.log("openModal called with id:", id);

    const modal = document.getElementById(id);

    console.log("Modal element:", modal);

    if (!modal) {
        console.error("ERROR: Modal not found:", id);
        alert("Debug: Modal not found: " + id);
        return;
    }

    modal.classList.add("active");

    console.log("Modal class after add active:", modal.className);
}

function closeModal(id) {
    document.getElementById(id).classList.remove("active");
}