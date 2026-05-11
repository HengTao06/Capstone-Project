let selectedDestination = null;
let destinations = [];

document.addEventListener("DOMContentLoaded", () => {
    loadCities();
    loadDestinations();
    bindEvents();
});

function bindEvents() {
    document.getElementById("openAddBtn").addEventListener("click", openAddModal);
    document.getElementById("closeInfoBtn").addEventListener("click", closeInfoModal);
    document.getElementById("closeInfoBottomBtn").addEventListener("click", closeInfoModal);
    document.getElementById("openEditBtn").addEventListener("click", openEditModal);
    document.getElementById("openDeleteBtn").addEventListener("click", openDeleteModal);

    document.getElementById("closeFormBtn").addEventListener("click", closeFormModal);
    document.getElementById("cancelFormBtn").addEventListener("click", closeFormModal);

    document.getElementById("cancelDeleteBtn").addEventListener("click", closeDeleteModal);
    document.getElementById("confirmDeleteBtn").addEventListener("click", deleteDestination);

    document.getElementById("destinationForm").addEventListener("submit", saveDestination);

    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                modal.classList.remove("active");
            }
        });
    });
}

async function loadCities() {
    try {
        const response = await fetch("M_destination.php?action=cities");
        const data = await response.json();

        const citySelect = document.getElementById("cityId");
        citySelect.innerHTML = `<option value="">Select city</option>`;

        if (!Array.isArray(data)) return;

        data.forEach(city => {
            citySelect.innerHTML += `
                <option value="${city.city_id}">
                    ${escapeHTML(city.city_name)}, ${escapeHTML(city.country_name)}
                </option>
            `;
        });

    } catch (error) {
        console.error("Failed to load cities:", error);
    }
}

async function loadDestinations() {
    const grid = document.getElementById("destinationGrid");

    try {
        grid.innerHTML = `<div class="empty-box">Loading destinations...</div>`;

        const response = await fetch("M_destination.php?action=list");
        const data = await response.json();

        destinations = data;
        grid.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            grid.innerHTML = `<div class="empty-box">No destinations available.</div>`;
            return;
        }

        data.forEach(destination => {
            const imagePath = destination.attraction_image
                ? `/Trev/assets/images/${destination.attraction_image}`
                : `/Trev/assets/images/default.jpg`;

            const card = document.createElement("div");
            card.className = "destination-card";

            card.innerHTML = `
                <img class="destination-image"
                     src="${imagePath}"
                     onerror="this.src='/Trev/assets/images/default.jpg'"
                     alt="${escapeHTML(destination.attraction_name)}">

                <div class="destination-content">
                    <h2>${escapeHTML(destination.attraction_name)}</h2>
                    <div class="destination-location">
                        ${escapeHTML(destination.city_name || "")}, ${escapeHTML(destination.country_name || "")}
                    </div>
                    <span class="destination-category">
                        ${escapeHTML(destination.attraction_category || "Uncategorized")}
                    </span>
                    <p>${escapeHTML(shortText(destination.attraction_description || "No description.", 110))}</p>
                </div>
            `;

            card.addEventListener("click", () => openInfoModal(destination));
            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Failed to load destinations:", error);
        grid.innerHTML = `<div class="empty-box">Failed to load destinations.</div>`;
    }
}

function openInfoModal(destination) {
    selectedDestination = destination;

    const imagePath = destination.attraction_image
        ? `/Trev/assets/images/${destination.attraction_image}`
        : `/Trev/assets/images/default.jpg`;

    document.getElementById("infoImage").src = imagePath;
    document.getElementById("infoTitle").innerText = destination.attraction_name || "Untitled";
    document.getElementById("infoLocation").innerText =
        `${destination.city_name || ""}, ${destination.country_name || ""}`;

    document.getElementById("infoDescription").innerText =
        destination.attraction_description || "No description.";

    document.getElementById("infoPrice").innerText =
        Number(destination.estimated_price || 0).toFixed(2);

    document.getElementById("infoSeason").innerText =
        destination.best_season || "Not specified";

    document.getElementById("infoTags").innerHTML = `
        <span>${escapeHTML(destination.attraction_category || "Uncategorized")}</span>
    `;

    document.getElementById("infoModal").classList.add("active");
}

function closeInfoModal() {
    document.getElementById("infoModal").classList.remove("active");
}

function openAddModal() {
    selectedDestination = null;
    document.getElementById("formTitle").innerText = "Add Destination";
    document.getElementById("saveFormBtn").innerText = "Add Destination";
    document.getElementById("destinationForm").reset();
    document.getElementById("attractionId").value = "";
    document.getElementById("formModal").classList.add("active");
}

function openEditModal() {
    if (!selectedDestination) return;

    closeInfoModal();

    document.getElementById("formTitle").innerText = "Edit Destination";
    document.getElementById("saveFormBtn").innerText = "Save Changes";

    document.getElementById("attractionId").value = selectedDestination.attraction_id;
    document.getElementById("attractionName").value = selectedDestination.attraction_name || "";
    document.getElementById("cityId").value = selectedDestination.city_id || "";
    document.getElementById("category").value = selectedDestination.attraction_category || "";
    document.getElementById("estimatedPrice").value = selectedDestination.estimated_price || "";
    document.getElementById("bestSeason").value = selectedDestination.best_season || "";
    document.getElementById("imageName").value = selectedDestination.attraction_image || "";
    document.getElementById("description").value = selectedDestination.attraction_description || "";

    document.getElementById("formModal").classList.add("active");
}

function closeFormModal() {
    document.getElementById("formModal").classList.remove("active");
}

async function saveDestination(event) {
    event.preventDefault();

    const attractionId = document.getElementById("attractionId").value;

    const payload = {
        attraction_id: attractionId,
        attraction_name: document.getElementById("attractionName").value.trim(),
        city_id: document.getElementById("cityId").value,
        attraction_category: document.getElementById("category").value.trim(),
        estimated_price: document.getElementById("estimatedPrice").value || 0,
        best_season: document.getElementById("bestSeason").value.trim(),
        attraction_image: document.getElementById("imageName").value.trim(),
        attraction_description: document.getElementById("description").value.trim()
    };

    const action = attractionId ? "update" : "add";

    try {
        const response = await fetch(`M_destination.php?action=${action}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === "success") {
            closeFormModal();
            loadDestinations();
        } else {
            alert(result.message || "Failed to save destination.");
        }

    } catch (error) {
        console.error("Save failed:", error);
        alert("Something went wrong while saving.");
    }
}

function openDeleteModal() {
    if (!selectedDestination) return;

    closeInfoModal();
    document.getElementById("deleteModal").classList.add("active");
}

function closeDeleteModal() {
    document.getElementById("deleteModal").classList.remove("active");
}

async function deleteDestination() {
    if (!selectedDestination) return;

    try {
        const response = await fetch(`M_destination.php?action=delete&id=${encodeURIComponent(selectedDestination.attraction_id)}`);
        const result = await response.json();

        if (result.status === "success") {
            closeDeleteModal();
            selectedDestination = null;
            loadDestinations();
        } else {
            alert(result.message || "Failed to delete destination.");
        }

    } catch (error) {
        console.error("Delete failed:", error);
        alert("Something went wrong while deleting.");
    }
}

function shortText(text, max) {
    if (text.length <= max) return text;
    return text.substring(0, max) + "...";
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}