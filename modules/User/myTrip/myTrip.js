document.addEventListener('DOMContentLoaded', function () {
    const plannedTripsContainer = document.getElementById('plannedTripsContainer')
    const completedTripsContainer = document.getElementById('completedTripsContainer')

    const totalTripsCount = document.getElementById('totalTripsCount')
    const plannedTripsCount = document.getElementById('plannedTripsCount')
    const completedTripsCount = document.getElementById('completedTripsCount')

    const viewTripModal = document.getElementById('viewTripModal')
    const completeConfirmModal = document.getElementById('completeConfirmModal')
    const deleteConfirmModal = document.getElementById('deleteConfirmModal')

    const viewTripTitle = document.getElementById('viewTripTitle')
    const viewTripDate = document.getElementById('viewTripDate')
    const viewTripStatus = document.getElementById('viewTripStatus')
    const viewTripItinerary = document.getElementById('viewTripItinerary')

    const confirmCompleteBtn = document.getElementById('confirmCompleteBtn')
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn')

    let selectedTripId = null

    let trips = [];

    async function loadTrips() {
        try {
            const response = await fetch('myTrip.php');
            const text = await response.text();
            console.log('MYTRIP RESPONSE:', text);
            const data = JSON.parse(text);

            if (data.status === 'success') {
                trips = data.trips;
                renderTrips();
            } else {
                console.error(data.message);
            }

        } catch (error) {
            console.error('Failed to load trips:', error);
        }
    }

    loadTrips()

    function renderTrips() {
        plannedTripsContainer.innerHTML = ''
        completedTripsContainer.innerHTML = ''

        const plannedTrips = trips.filter(trip => trip.status === 'Planned')
        const completedTrips = trips.filter(trip => trip.status === 'Completed')

        totalTripsCount.textContent = trips.length
        plannedTripsCount.textContent = plannedTrips.length
        completedTripsCount.textContent = completedTrips.length

        if (plannedTrips.length === 0) {
            plannedTripsContainer.innerHTML = `<div class="empty-section">No planned trips yet.</div>`
        } else {
            plannedTrips.forEach(trip => {
                plannedTripsContainer.appendChild(createTripCard(trip))
            })
        }

        if (completedTrips.length === 0) {
            completedTripsContainer.innerHTML = `<div class="empty-section">No completed trips yet.</div>`
        } else {
            completedTrips.forEach(trip => {
                completedTripsContainer.appendChild(createTripCard(trip))
            })
        }

        attachTripButtonEvents()
    }

    function createTripCard(trip) {
        const card = document.createElement('article')
        card.className = 'trip-card'

        const statusClass = trip.status === 'Planned' ? 'planned' : 'completed'

        card.innerHTML = `
            <div class="trip-card-header">
                <h3>${trip.name}</h3>
                <span class="status-badge ${statusClass}">${trip.status}</span>
            </div>

            <div class="trip-meta">
                <p>
                    <i class="bi bi-calendar-event"></i>
                    ${trip.startDate} - ${trip.endDate}
                </p>

                <p>
                    <i class="bi bi-geo-alt"></i>
                    ${trip.attractions} attractions
                </p>
            </div>

            <div class="trip-actions">
                <button class="view-btn" data-id="${trip.id}">
                    <i class="bi bi-eye-fill"></i>
                    View
                </button>

                <a class="edit-btn" href="../tripPlanner/tripPlanner.html?trip_id=${trip.id}">
                    <i class="bi bi-pencil-square"></i>
                    Edit
                </a>

                ${trip.status === 'Planned'
                ? `
                    <button class="complete-btn" data-id="${trip.id}">
                        <i class="bi bi-check-circle-fill"></i>
                        Mark Completed
                    </button>
                    `
                : ''
            }

                <button class="delete-btn" data-id="${trip.id}">
                    <i class="bi bi-trash-fill"></i>
                    Delete
                </button>
            </div>
        `

        return card
    }

    function attachTripButtonEvents() {
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', function () {
                const tripId = Number(this.dataset.id)
                const trip = trips.find(item => item.id === tripId)

                if (trip) {
                    openViewTripModal(trip)
                }
            })
        })

        document.querySelectorAll('.complete-btn').forEach(button => {
            button.addEventListener('click', function () {
                selectedTripId = Number(this.dataset.id)
                openModal(completeConfirmModal)
            })
        })

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                selectedTripId = Number(this.dataset.id)
                openModal(deleteConfirmModal)
            })
        })
    }

    function openViewTripModal(trip) {
        viewTripTitle.textContent = trip.name
        viewTripDate.textContent = `${trip.startDate} - ${trip.endDate}`
        viewTripStatus.textContent = trip.status

        viewTripStatus.classList.remove('planned', 'completed')
        viewTripStatus.classList.add(trip.status === 'Planned' ? 'planned' : 'completed')

        viewTripItinerary.innerHTML = renderItineraryHTML(trip.itinerary)

        openModal(viewTripModal)
    }

    function renderItineraryHTML(itinerary) {
        let html = ''

        Object.keys(itinerary).forEach(day => {
            const items = itinerary[day]

            html += `
                <div class="itinerary-day-card">
                    <div class="itinerary-day-header">
                        <div class="day-number">${day}</div>
                        <h3>Day ${day}</h3>
                    </div>

                    <div class="itinerary-divider"></div>
            `

            if (items.length === 0) {
                html += `<p class="empty-section">No attractions planned for this day</p>`
            } else {
                html += `<div class="timeline-list">`

                items.forEach((item, index) => {
                    html += `
                        <div class="timeline-row">
                            <div class="timeline-left">
                                <div class="timeline-index">${index + 1}</div>
                                <div class="timeline-line"></div>
                            </div>

                            <div class="timeline-attraction-card">
                                <h4>
                                    <i class="bi bi-geo-alt-fill"></i>
                                    ${item.name}
                                </h4>
                                <p>${item.category}</p>
                                <span>
                                    <i class="bi bi-clock"></i>
                                    2-3 hours recommended
                                </span>
                            </div>
                        </div>
                    `
                })

                html += `</div>`
            }

            html += `</div>`
        })

        return html
    }

    confirmCompleteBtn.addEventListener('click', async function () {
        const trip = trips.find(item => item.id === selectedTripId)

        if (trip) {
            await updateTripStatus(selectedTripId, 'Completed');
            closeModal(completeConfirmModal);
            loadTrips();
        }
    })

    confirmDeleteBtn.addEventListener('click', async function () {
        await deleteTrip(selectedTripId);
        closeModal(deleteConfirmModal);
        loadTrips();
    })

    document.querySelectorAll('[data-close]').forEach(button => {
        button.addEventListener('click', function () {
            const modalId = this.dataset.close
            closeModal(document.getElementById(modalId))
        })
    })

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                closeModal(overlay)
            }
        })
    })

    function openModal(modal) {
        modal.classList.add('active')
        document.body.style.overflow = 'hidden'
    }

    function closeModal(modal) {
        modal.classList.remove('active')
        document.body.style.overflow = ''
    }
})

async function updateTripStatus(tripId, status) {
    await fetch('myTrip.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'updateStatus',
            trip_id: tripId,
            status: status
        })
    });
}

async function deleteTrip(tripId) {
    await fetch('myTrip.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'delete',
            trip_id: tripId
        })
    });
}