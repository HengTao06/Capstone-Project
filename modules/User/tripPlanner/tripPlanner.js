document.addEventListener("DOMContentLoaded", function () {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    const attractionModal = document.getElementById("attractionModal");
    const scheduleModal = document.getElementById("scheduleModal");
    const comboModal = document.getElementById("comboModal");
    const detailModal = document.getElementById("detailModal");

    const openAttractionList = document.getElementById("openAttractionList");
    const selectedAttractions = document.getElementById("selectedAttractions");
    const itineraryList = document.getElementById("itineraryList");
    const emptyItinerary = document.getElementById("emptyItinerary");

    const scheduleName = document.getElementById("scheduleName");
    const scheduleImg = document.getElementById("scheduleImg");
    const scheduleTime = document.getElementById("scheduleTime");
    const confirmSchedule = document.getElementById("confirmSchedule");

    const comboTitle = document.getElementById("comboTitle");
    const comboDesc = document.getElementById("comboDesc");
    const comboDetailList = document.getElementById("comboDetailList");
    const confirmCombo = document.getElementById("confirmCombo");

    const detailName = document.getElementById("detailName");
    const detailImg = document.getElementById("detailImg");

    let currentAttraction = null;
    let selectedDay = 1;
    let selectedCombo = null;

    const itineraryData = {
        1: [],
        2: [],
        3: []
    };

    const comboData = {
        weekend: {
            title: "Weekend Getaway",
            desc: "A short and simple trip combo suitable for first-time visitors.",
            attractions: [
                {
                    name: "Eiffel Tower",
                    day: 1,
                    time: "09:00",
                    img: "../../../assets/images/eiffel-tower.jpg",
                    desc: "A famous landmark with beautiful city views."
                },
                {
                    name: "Louvre Museum",
                    day: 1,
                    time: "13:00",
                    img: "../../../assets/images/louvre.jpg",
                    desc: "A world-famous museum for art and culture."
                },
                {
                    name: "Arc de Triomphe",
                    day: 2,
                    time: "10:00",
                    img: "../../../assets/images/arc.jpg",
                    desc: "A historical monument located in the heart of the city."
                },
                {
                    name: "Champs-Élysées",
                    day: 2,
                    time: "15:00",
                    img: "../../../assets/images/champs.jpg",
                    desc: "A popular shopping and sightseeing street."
                }
            ]
        },

        culture: {
            title: "Art & Culture Tour",
            desc: "A cultural travel combo focused on museums, landmarks and historical places.",
            attractions: [
                {
                    name: "Louvre Museum",
                    day: 1,
                    time: "09:00",
                    img: "../../../assets/images/louvre.jpg",
                    desc: "A world-famous museum for art and culture."
                },
                {
                    name: "Musée d'Orsay",
                    day: 1,
                    time: "14:00",
                    img: "../../../assets/images/orsay.jpg",
                    desc: "A museum known for impressionist artworks."
                },
                {
                    name: "Notre-Dame Cathedral",
                    day: 2,
                    time: "10:00",
                    img: "../../../assets/images/notre-dame.jpg",
                    desc: "A historic cathedral with beautiful architecture."
                },
                {
                    name: "Sacré-Cœur",
                    day: 2,
                    time: "15:00",
                    img: "../../../assets/images/sacre-coeur.jpg",
                    desc: "A famous basilica with panoramic city views."
                }
            ]
        },

        complete: {
            title: "Complete Paris Experience",
            desc: "A complete combo for users who want to explore the main attractions.",
            attractions: [
                {
                    name: "Eiffel Tower",
                    day: 1,
                    time: "09:00",
                    img: "../../../assets/images/eiffel-tower.jpg",
                    desc: "A famous landmark with beautiful city views."
                },
                {
                    name: "Louvre Museum",
                    day: 1,
                    time: "13:00",
                    img: "../../../assets/images/louvre.jpg",
                    desc: "A world-famous museum for art and culture."
                },
                {
                    name: "Versailles Palace",
                    day: 2,
                    time: "09:00",
                    img: "../../../assets/images/versailles.jpg",
                    desc: "A royal palace known for gardens and history."
                },
                {
                    name: "Arc de Triomphe",
                    day: 3,
                    time: "10:00",
                    img: "../../../assets/images/arc.jpg",
                    desc: "A historical monument located in the heart of the city."
                },
                {
                    name: "Musée d'Orsay",
                    day: 3,
                    time: "14:00",
                    img: "../../../assets/images/orsay.jpg",
                    desc: "A museum known for impressionist artworks."
                }
            ]
        }
    };

    tabButtons.forEach(button => {
        button.addEventListener("click", function () {
            const target = this.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            this.classList.add("active");
            document.getElementById(target).classList.add("active");
        });
    });

    openAttractionList.addEventListener("click", function () {
        openModal(attractionModal);
    });

    document.querySelectorAll("[data-close]").forEach(button => {
        button.addEventListener("click", function () {
            const modalId = this.dataset.close;
            closeModal(document.getElementById(modalId));
        });
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) {
                closeModal(overlay);
            }
        });
    });

    document.querySelectorAll(".add-attraction-btn").forEach(button => {
        button.addEventListener("click", function () {
            currentAttraction = {
                name: this.dataset.name,
                img: this.dataset.img,
                day: Number(this.dataset.day)
            };

            scheduleName.textContent = currentAttraction.name;
            scheduleImg.src = currentAttraction.img;

            selectedDay = currentAttraction.day;
            updateDayButtons();

            closeModal(attractionModal);
            openModal(scheduleModal);
        });
    });

    document.querySelectorAll(".day-btn").forEach(button => {
        button.addEventListener("click", function () {
            selectedDay = Number(this.dataset.day);
            updateDayButtons();
        });
    });

    confirmSchedule.addEventListener("click", function () {
        if (!currentAttraction) return;

        const item = {
            name: currentAttraction.name,
            img: currentAttraction.img,
            day: selectedDay,
            time: scheduleTime.value || "09:00"
        };

        addAttractionToSelected(item);
        addItemToItinerary(item);

        closeModal(scheduleModal);
    });

    document.querySelectorAll(".use-combo-btn").forEach(button => {
        button.addEventListener("click", function () {
            const comboKey = this.dataset.combo;
            selectedCombo = comboData[comboKey];

            comboTitle.textContent = selectedCombo.title;
            comboDesc.textContent = selectedCombo.desc;
            comboDetailList.innerHTML = "";

            selectedCombo.attractions.forEach(attraction => {
                const div = document.createElement("div");
                div.className = "combo-detail-item";
                div.innerHTML = `
                    <img src="${attraction.img}" alt="${attraction.name}">
                    <div>
                        <span class="combo-day-label">Day ${attraction.day} · ${attraction.time}</span>
                        <h3>${attraction.name}</h3>
                        <p>${attraction.desc}</p>
                    </div>
                `;
                comboDetailList.appendChild(div);
            });

            openModal(comboModal);
        });
    });

    confirmCombo.addEventListener("click", function () {
        if (!selectedCombo) return;

        selectedCombo.attractions.forEach(attraction => {
            const item = {
                name: attraction.name,
                img: attraction.img,
                day: attraction.day,
                time: attraction.time
            };

            addAttractionToSelected(item);
            addItemToItinerary(item);
        });

        closeModal(comboModal);

        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(content => content.classList.remove("active"));

        document.querySelector('[data-tab="createTrip"]').classList.add("active");
        document.getElementById("createTrip").classList.add("active");
    });

    document.getElementById("saveTripBtn").addEventListener("click", function () {
        const tripName = document.getElementById("tripName").value.trim();
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;

        const hasItinerary = Object.values(itineraryData).some(day => day.length > 0);

        if (!tripName || !startDate || !endDate) {
            alert("Please fill in trip name, start date and end date before saving.");
            return;
        }

        if (!hasItinerary) {
            alert("Please add attractions or use a popular combo before saving.");
            return;
        }

        alert("Trip saved successfully! Later this will save into Trip and Trip_Details tables.");
    });

    function addAttractionToSelected(item) {
        const emptyText = selectedAttractions.querySelector(".empty-text");
        if (emptyText) {
            emptyText.remove();
        }

        const selectedItem = document.createElement("div");
        selectedItem.className = "selected-item";
        selectedItem.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div>
                <h3>${item.name}</h3>
                <p>Day ${item.day} · ${item.time}</p>
            </div>
        `;

        selectedItem.addEventListener("click", function () {
            showDetails(item);
        });

        selectedAttractions.appendChild(selectedItem);
    }

    function addItemToItinerary(item) {
        itineraryData[item.day].push(item);
        renderItinerary();
    }

    function renderItinerary() {
        itineraryList.innerHTML = "";

        const hasItems = Object.values(itineraryData).some(day => day.length > 0);

        if (hasItems) {
            emptyItinerary.style.display = "none";
        } else {
            emptyItinerary.style.display = "flex";
        }

        Object.keys(itineraryData).forEach(day => {
            if (itineraryData[day].length === 0) return;

            const dayDiv = document.createElement("div");
            dayDiv.className = "itinerary-day";

            let html = `<h3>Day ${day}</h3>`;

            itineraryData[day].forEach(item => {
                html += `
                    <div class="itinerary-item" data-name="${item.name}">
                        <img src="${item.img}" alt="${item.name}">
                        <div>
                            <h4>${item.name}</h4>
                            <p>${item.time} · Osaka, Japan</p>
                        </div>
                    </div>
                `;
            });

            dayDiv.innerHTML = html;
            itineraryList.appendChild(dayDiv);
        });

        document.querySelectorAll(".itinerary-item").forEach(itemDiv => {
            itemDiv.addEventListener("click", function () {
                const name = this.dataset.name;
                const item = findItineraryItem(name);
                if (item) {
                    showDetails(item);
                }
            });
        });
    }

    function findItineraryItem(name) {
        for (const day in itineraryData) {
            const found = itineraryData[day].find(item => item.name === name);
            if (found) return found;
        }

        return null;
    }

    function showDetails(item) {
        detailName.textContent = item.name;
        detailImg.src = item.img;
        openModal(detailModal);
    }

    function updateDayButtons() {
        document.querySelectorAll(".day-btn").forEach(button => {
            if (Number(button.dataset.day) === selectedDay) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });
    }

    function openModal(modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeModal(modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
});