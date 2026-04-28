document.addEventListener('DOMContentLoaded', function () {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  const attractionModal = document.getElementById('attractionModal');
  const scheduleModal = document.getElementById('scheduleModal');
  const comboModal = document.getElementById('comboModal');
  const detailModal = document.getElementById('detailModal');

  const openAttractionList = document.getElementById('openAttractionList');
  const selectedAttractions = document.getElementById('selectedAttractions');
  const itineraryList = document.getElementById('itineraryList');
  const emptyItinerary = document.getElementById('emptyItinerary');

  const attractionList = document.getElementById('attractionList');
  const attractionSearchInput = document.getElementById('attractionSearchInput');

  const scheduleName = document.getElementById('scheduleName');
  const scheduleImg = document.getElementById('scheduleImg');
  const scheduleTime = document.getElementById('scheduleTime');
  const confirmSchedule = document.getElementById('confirmSchedule');

  const comboTitle = document.getElementById('comboTitle');
  const comboDesc = document.getElementById('comboDesc');
  const comboDetailList = document.getElementById('comboDetailList');
  const confirmCombo = document.getElementById('confirmCombo');

  const detailName = document.getElementById('detailName');
  const detailImg = document.getElementById('detailImg');

  let currentAttraction = null;
  let selectedDay = 1;
  let selectedCombo = null;
  let attractionsData = [];

  let itineraryData = {};

  const startPicker = flatpickr('#startDate', {
    dateFormat: 'Y-m-d',
    minDate: 'today',
    onChange: function (selectedDates) {
      if (selectedDates.length > 0) {
        endPicker.set('minDate', selectedDates[0]);
      }

      generateTripDays();
    }
  });

  const endPicker = flatpickr('#endDate', {
    dateFormat: 'Y-m-d',
    minDate: 'today',
    onChange: function () {
      generateTripDays();
    }
  });

  flatpickr('#scheduleTime', {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    defaultDate: '09:00',
    time_24hr: true
  });

  function calculateDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays + 1;
  }

  function hasItineraryItems() {
    return Object.values(itineraryData).some(day => day.length > 0);
  }

  function generateTripDays() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
      itineraryData = {};
      selectedDay = 1;
      emptyItinerary.style.display = 'flex';
      itineraryList.innerHTML = '';
      clearDayButtons();
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be before start date.');
      document.getElementById('endDate').value = '';
      itineraryData = {};
      emptyItinerary.style.display = 'flex';
      itineraryList.innerHTML = '';
      clearDayButtons();
      return;
    }

    if (hasItineraryItems()) {
      const confirmReset = confirm('Changing the trip dates will reset your current itinerary. Continue?');

      if (!confirmReset) {
        return;
      }

      selectedAttractions.innerHTML = `
          <p class="empty-text">No attractions selected yet. Click “Add Attraction” to get started.</p>
        `;
    }

    const totalDays = calculateDays(startDate, endDate);

    itineraryData = {};

    for (let i = 1; i <= totalDays; i++) {
      itineraryData[i] = [];
    }

    selectedDay = 1;
    emptyItinerary.style.display = 'none';

    renderDayButtons(totalDays);
    renderItinerary();
  }

  function clearDayButtons() {
    const dayButtonsContainer = document.querySelector('.day-buttons');
    if (dayButtonsContainer) {
      dayButtonsContainer.innerHTML = '';
    }
  }

  function renderDayButtons(totalDays) {
    const dayButtonsContainer = document.querySelector('.day-buttons');

    if (!dayButtonsContainer) return;

    dayButtonsContainer.innerHTML = '';

    for (let i = 1; i <= totalDays; i++) {
      dayButtonsContainer.innerHTML += `
          <button class="day-btn ${i === 1 ? 'active' : ''}" data-day="${i}">
            Day ${i}
          </button>
        `;
    }

    document.querySelectorAll('.day-btn').forEach(button => {
      button.addEventListener('click', function () {
        selectedDay = Number(this.dataset.day);
        updateDayButtons();
      });
    });
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', function () {
      const target = this.dataset.tab;

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      this.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  openAttractionList.addEventListener('click', function () {
    openModal(attractionModal);
  });

  document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', function () {
      closeModal(document.getElementById(this.dataset.close));
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  async function loadAttractions() {
    try {
      const response = await fetch('tripPlanner.php');
      const data = await response.json();

      attractionsData = Array.isArray(data) ? data : data.attractions;

      renderAttractionList(attractionsData);
    } catch (error) {
      console.error('Failed to load attractions:', error);
      attractionList.innerHTML = `<p class="empty-text">Failed to load attractions.</p>`;
    }
  }



  function renderAttractionList(list) {
    attractionList.innerHTML = '';

    if (!list || list.length === 0) {
      attractionList.innerHTML = `<p class="empty-text">No attractions found.</p>`;
      return;
    }

    list.forEach(item => {
      attractionList.innerHTML += `
          <div class="attraction-option">
            <img src="../../../assets/images/${item.attraction_image}" alt="${item.attraction_name}">
            <div>
              <h3>${item.attraction_name}</h3>
              <p>${item.attraction_category} · ${item.city_name || ''}</p>
            </div>
            <button 
              class="add-attraction-btn"
              data-id="${item.attraction_id}"
              data-name="${item.attraction_name}"
              data-category="${item.attraction_category}"
              data-description="${item.attraction_description || ''}"
              data-price="${item.estimated_price || '0'}"
              data-season="${item.best_season || 'All Year'}"
              data-img="../../../assets/images/${item.attraction_image}">
              + Add
            </button>
          </div>
        `;
    });

    attachAddAttractionEvents();
  }

  function attachAddAttractionEvents() {
    document.querySelectorAll('.add-attraction-btn').forEach(button => {
      button.addEventListener('click', function () {
        if (!document.getElementById('startDate').value || !document.getElementById('endDate').value) {
          alert('Please select start date and end date first.');
          return;
        }

        currentAttraction = {
          id: Number(this.dataset.id),
          name: this.dataset.name,
          category: this.dataset.category,
          description: this.dataset.description,
          price: this.dataset.price,
          season: this.dataset.season,
          img: this.dataset.img
        };

        scheduleName.textContent = currentAttraction.name;
        scheduleImg.src = currentAttraction.img;

        selectedDay = 1;
        updateDayButtons();

        closeModal(attractionModal);
        openModal(scheduleModal);
      });
    });
  }

  if (attractionSearchInput) {
    attractionSearchInput.addEventListener('input', function () {
      const keyword = this.value.toLowerCase();

      const filtered = attractionsData.filter(item =>
        item.attraction_name.toLowerCase().includes(keyword) ||
        item.attraction_category.toLowerCase().includes(keyword)
      );

      renderAttractionList(filtered);
    });
  }

  confirmSchedule.addEventListener('click', function () {
    if (!currentAttraction) return;

    if (Object.keys(itineraryData).length === 0) {
      alert('Please select start date and end date first.');
      return;
    }

    const item = {
      id: currentAttraction.id,
      name: currentAttraction.name,
      category: currentAttraction.category,
      description: currentAttraction.description,
      price: currentAttraction.price,
      season: currentAttraction.season,
      img: currentAttraction.img,
      day: selectedDay,
      time: scheduleTime.value || '09:00'
    };

    addAttractionToSelected(item);
    addItemToItinerary(item);

    closeModal(scheduleModal);
  });

  function addAttractionToSelected(item) {
    const emptyText = selectedAttractions.querySelector('.empty-text');

    if (emptyText) {
      emptyText.remove();
    }

    const selectedItem = document.createElement('div');
    selectedItem.className = 'selected-item';
    selectedItem.dataset.id = item.id;
    selectedItem.dataset.day = item.day;
    selectedItem.dataset.time = item.time;

    selectedItem.innerHTML = `
      <img src="${item.img}" alt="${item.name}">

      <div>
        <h3>${item.name}</h3>
        <p>Day ${item.day} · ${item.time}</p>
      </div>

      <button class="remove-selected-btn" title="Remove attraction">×</button>
    `;

    selectedItem.addEventListener('click', function () {
      showDetails(item);
    });

    selectedItem.querySelector('.remove-selected-btn').addEventListener('click', function (event) {
      event.stopPropagation();

      const confirmRemove = confirm(`Remove ${item.name} from your trip?`);

      if (!confirmRemove) return;

      removeAttractionFromTrip(item);
    });

    selectedAttractions.appendChild(selectedItem);
  }

  function removeAttractionFromTrip(item) {
    selectedAttractions
      .querySelectorAll('.selected-item')
      .forEach(selectedItem => {
        const sameId = Number(selectedItem.dataset.id) === Number(item.id);
        const sameDay = Number(selectedItem.dataset.day) === Number(item.day);
        const sameTime = selectedItem.dataset.time === item.time;

        if (sameId && sameDay && sameTime) {
          selectedItem.remove();
        }
      });

    if (itineraryData[item.day]) {
      itineraryData[item.day] = itineraryData[item.day].filter(attraction => {
        return !(
          Number(attraction.id) === Number(item.id) &&
          Number(attraction.day) === Number(item.day) &&
          attraction.time === item.time
        );
      });
    }

    if (selectedAttractions.children.length === 0) {
      selectedAttractions.innerHTML = `
        <p class="empty-text">No attractions selected yet. Click “Add Attraction” to get started.</p>
      `;
    }

    renderItinerary();
  }

  function addItemToItinerary(item) {
    itineraryData[item.day].push(item);
    renderItinerary();
  }

  function renderItinerary() {
    itineraryList.innerHTML = '';

    if (Object.keys(itineraryData).length === 0) {
      emptyItinerary.style.display = 'flex';
      return;
    }

    emptyItinerary.style.display = 'none';

    Object.keys(itineraryData).forEach(day => {
      const dayItems = itineraryData[day];

      const dayBox = document.createElement('div');
      dayBox.className = 'itinerary-day-card';

      let html = `
          <div class="itinerary-day-header">
            <div class="day-number">${day}</div>
            <h3>Day ${day}</h3>
          </div>

          <div class="itinerary-divider"></div>
        `;

      if (dayItems.length === 0) {
        html += `<p class="no-day-attraction">No attractions planned for this day</p>`;
      } else {
        html += `<div class="timeline-list">`;

        dayItems.forEach((item, index) => {
          html += `
              <div class="timeline-row">
                <div class="timeline-left">
                  <div class="timeline-index">${index + 1}</div>
                  <div class="timeline-line"></div>
                </div>

                <div class="timeline-attraction-card" data-name="${item.name}">
                  <h4><i class="bi bi-geo-alt-fill"></i> ${item.name}</h4>
                  <p>${item.category || 'Landmark'}</p>
                  <span>${item.time} · 2-3 hours recommended</span>
                </div>
              </div>
            `;
        });

        html += `</div>`;
      }

      dayBox.innerHTML = html;
      itineraryList.appendChild(dayBox);
    });

    document.querySelectorAll('.timeline-attraction-card').forEach(card => {
      card.addEventListener('click', function () {
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

    document.querySelector('.detail-location').textContent = 'Selected Destination';

    const infoBoxes = document.querySelectorAll('.detail-info-grid strong');

    if (infoBoxes.length >= 4) {
      infoBoxes[0].textContent = item.category || 'Attraction';
      infoBoxes[1].textContent = item.price ? `RM ${item.price}` : 'Free';
      infoBoxes[2].textContent = item.season || 'All Year';
      infoBoxes[3].textContent = '★ 4.8';
    }

    const description = document.querySelector('.detail-description');
    description.textContent = item.description || 'This attraction is one of the recommended places to visit during your trip.';

    openModal(detailModal);
  }

  document.querySelectorAll('.use-combo-btn').forEach(button => {
    button.addEventListener('click', function () {
      if (!document.getElementById('startDate').value || !document.getElementById('endDate').value) {
        alert('Please select start date and end date first.');
        return;
      }

      const comboCard = this.closest('.combo-card');

      selectedCombo = {
        title: comboCard.querySelector('h3').textContent,
        desc: 'This combo is generated based on frequently selected attractions from saved trips.',
        attractions: Array.from(comboCard.querySelectorAll('.combo-tags span')).map((tag, index) => {
          return {
            id: 0,
            name: tag.textContent,
            category: 'Popular Attraction',
            description: 'This attraction is included in this popular travel combo.',
            price: '0',
            season: 'All Year',
            img: '../../../assets/images/default.jpg',
            day: index < 2 ? 1 : 2,
            time: index < 2 ? '09:00' : '14:00'
          };
        })
      };

      comboTitle.textContent = selectedCombo.title;
      comboDesc.textContent = selectedCombo.desc;
      comboDetailList.innerHTML = '';

      selectedCombo.attractions.forEach(attraction => {
        const div = document.createElement('div');
        div.className = 'combo-detail-item';
        div.innerHTML = `
            <img src="${attraction.img}" alt="${attraction.name}">
            <div>
              <span class="combo-day-label">Day ${attraction.day} · ${attraction.time}</span>
              <h3>${attraction.name}</h3>
              <p>${attraction.description}</p>
            </div>
          `;
        comboDetailList.appendChild(div);
      });

      openModal(comboModal);
    });
  });

  confirmCombo.addEventListener('click', function () {
    if (!selectedCombo) return;

    selectedCombo.attractions.forEach(attraction => {
      const maxDay = Object.keys(itineraryData).length;

      if (attraction.day > maxDay) {
        attraction.day = maxDay;
      }

      addAttractionToSelected(attraction);
      addItemToItinerary(attraction);
    });

    closeModal(comboModal);

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    document.querySelector('[data-tab="createTrip"]').classList.add('active');
    document.getElementById('createTrip').classList.add('active');
  });

  document.getElementById('saveTripBtn').addEventListener('click', async function () {
    const tripName = document.getElementById('tripName').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    hasItinerary = Object.values(itineraryData).some(day => day.length > 0);

    /* =============================
   VALIDATION SECTION
============================= */

    // 1. Trip Name
    if (!tripName || tripName.length < 3) {
      alert('Trip name must be at least 3 characters.');
      return;
    }

    // 2. Destination (optional but recommended)
    const destinationInput = document.getElementById('destination')?.value?.trim();
    if (!destinationInput || !destinationInput.includes(',')) {
      alert('Please enter destination in format: City, Country (e.g. Osaka, Japan)');
      return;
    }

    // 3. Dates
    if (!startDate || !endDate) {
      alert('Please select both start date and end date.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be before start date.');
      return;
    }

    // 4. Itinerary must exist
    const hasItinerary = Object.values(itineraryData).some(day => day.length > 0);

    if (!hasItinerary) {
      alert('Please add at least one attraction before saving.');
      return;
    }

    // 5. Validate each attraction
    for (const day in itineraryData) {
      for (const item of itineraryData[day]) {

        // invalid ID (important for your current bug)
        if (!item.id || Number(item.id) <= 0) {
          alert('Some attractions are invalid. Please add attractions from the list.');
          return;
        }

        //  invalid day
        if (Number(day) <= 0) {
          alert('Invalid itinerary day detected.');
          return;
        }
      }
    }

    const payload = {
      tripName: tripName,
      startDate: startDate,
      endDate: endDate,
      city_id: 1,
      itinerary: itineraryData
    };

    try {
      const response = await fetch('tripPlanner.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === 'success') {
        alert('Trip saved successfully!');
        window.location.href = '../myTrip/myTrip.html';
      } else {
        alert(result.message || 'Failed to save trip.');
      }
    } catch (error) {
      console.error('Save trip failed:', error);
      alert('Something went wrong while saving the trip.');
    }
  });

  function updateDayButtons() {
    document.querySelectorAll('.day-btn').forEach(button => {
      if (Number(button.dataset.day) === selectedDay) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  emptyItinerary.style.display = 'flex';
  itineraryList.innerHTML = '';
  clearDayButtons();
  loadAttractions();
});