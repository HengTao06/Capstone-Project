document.addEventListener('DOMContentLoaded', () => {

  /* ---------- URL PARAMS ---------- */
  const params = new URLSearchParams(window.location.search);

  /* ---------- STATE ---------- */
  const state = {
    activeTab: params.get('tab') || 'recommended',
    budget: '',
    country: '',
    interests: [],
    minRating: 0,
    search: params.get('q') || '',
    city_id: params.get('city_id') || ''
  };

  /* ---------- ELEMENTS ---------- */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panelRec = document.getElementById('panel-recommended');
  const panelPop = document.getElementById('panel-popular');
  const recCards = document.getElementById('recommended-cards');
  const comboCards = document.getElementById('combo-cards');
  const noRec = document.getElementById('no-rec');
  const noCombo = document.getElementById('no-combo');
  const budgetSel = document.getElementById('budget-select');
  const countrySel = document.getElementById('country-select');
  const interestCont = document.getElementById('interest-tags');
  const starFilter = document.getElementById('star-filter');
  const stars = starFilter.querySelectorAll('.star');
  const btnApply = document.getElementById('btn-apply');
  const btnClear = document.getElementById('btn-clear');

  /* ---------- INIT ---------- */
  loadCountries();
  loadCategories();
  initTabs();
  loadData();

  /* ---------- TAB SWITCH ---------- */
  function initTabs() {

    tabBtns.forEach(btn => {
      btn.classList.remove('active');

      if (btn.dataset.tab === state.activeTab) {
        btn.classList.add('active');
      }
    });

    tabBtns.forEach(btn => {
      btn.addEventListener('click', function () {

        // 1. update state
        state.activeTab = this.dataset.tab;

        // 2. update button UI
        tabBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // 3. switch panel
        switchTab();

        // 4. load data
        loadData();
      });
    });

    switchTab();
  }

  function switchTab() {
    if (state.activeTab === 'popular') {

      panelPop.classList.add('active');
      panelPop.classList.remove('hidden');

      panelRec.classList.remove('active');
      panelRec.classList.add('hidden');

    } else {

      panelRec.classList.add('active');
      panelRec.classList.remove('hidden');

      panelPop.classList.remove('active');
      panelPop.classList.add('hidden');
    }
  }

  /* ---------- FILTER APPLY ---------- */
  btnApply.addEventListener('click', () => {
    state.budget = budgetSel.value;
    state.country = countrySel.value;

    // clear header search keyword when using filters
    state.search = "";
    state.city_id = "";

    if (state.activeTab === 'recommended') loadRecommended();
    else loadPopularCombos();
  });

  /* ---------- FILTER CLEAR ---------- */
  btnClear.addEventListener('click', () => {
    budgetSel.value = '';
    countrySel.value = '';

    state.budget = '';
    state.country = '';
    state.interests = [];
    state.minRating = 0;

    document.querySelectorAll('.interest-tag').forEach(t => t.classList.remove('active'));
    updateStars();

    loadData();
  });

  /* ---------- STAR FILTER ---------- */
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.val);
      state.minRating = (state.minRating === val) ? 0 : val;
      updateStars();
    });

    star.addEventListener('mouseover', () => highlightStars(parseInt(star.dataset.val)));
    star.addEventListener('mouseout', updateStars);
  });

  function highlightStars(n) {
    stars.forEach(s => s.classList.toggle('lit', parseInt(s.dataset.val) <= n));
  }

  function updateStars() {
    stars.forEach(s => s.classList.toggle('lit', parseInt(s.dataset.val) <= state.minRating));
  }

  /* ---------- INTEREST TAGS ---------- */
  interestCont.addEventListener('click', e => {
    const tag = e.target.closest('.interest-tag');
    if (!tag) return;

    tag.classList.toggle('active');
    const cat = tag.dataset.category;

    if (tag.classList.contains('active')) {
      if (!state.interests.includes(cat)) state.interests.push(cat);
    } else {
      state.interests = state.interests.filter(i => i !== cat);
    }
  });

  /* =============================================
     LOAD DATA
  ============================================= */

  function loadData() {
    if (state.activeTab === 'popular') loadPopularCombos();
    else loadRecommended();
  }

  async function loadCountries() {
    try {
      const res = await fetch('discover.php?action=get_countries');
      const data = await res.json();

      if (data.status === 'ok') {
        data.countries.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.country_id;
          opt.textContent = c.country_name;
          countrySel.appendChild(opt);
        });
      }
    } catch (e) {
      console.warn('Countries load failed', e);
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch('discover.php?action=get_categories');
      const data = await res.json();

      if (data.status === 'ok') {
        interestCont.innerHTML = '';
        data.categories.forEach(cat => {
          const btn = document.createElement('button');
          btn.className = 'interest-tag';
          btn.dataset.category = cat;
          btn.textContent = cat;
          interestCont.appendChild(btn);
        });
      }
    } catch (e) {
      console.warn('Categories load failed', e);
    }
  }

  /* ---------- RECOMMENDED ---------- */
  async function loadRecommended() {
    recCards.innerHTML = skeletons(6);
    noRec.classList.add('hidden');

    try {
      const res = await fetch(`discover.php?action=get_recommended&${buildParams()}`);
      const data = await res.json();

      recCards.innerHTML = '';

      if (!data.attractions || data.attractions.length === 0) {
        noRec.classList.remove('hidden');
        return;
      }

      data.attractions.forEach(a => recCards.appendChild(buildCard(a)));

    } catch (e) {
      recCards.innerHTML = '<p style="color:red;padding:20px">Failed to load destinations.</p>';
    }
  }

  /* ---------- COMBOS ---------- */
  async function loadPopularCombos() {
    comboCards.innerHTML = skeletons(6);
    noCombo.classList.add('hidden');

    try {
      const res = await fetch(`discover.php?action=get_combos&${buildParams()}`);
      const data = await res.json();

      comboCards.innerHTML = '';

      if (!data.combos || data.combos.length === 0) {
        noCombo.classList.remove('hidden');
        return;
      }

      data.combos.forEach(c => comboCards.appendChild(buildComboCard(c)));

    } catch (e) {
      comboCards.innerHTML = '<p style="color:red;padding:20px">Failed to load combos.</p>';
    }
  }

  /* ---------- PARAM BUILDER ---------- */
  function buildParams() {
    const p = new URLSearchParams();

    if (state.city_id) p.set('city_id', state.city_id);
    if (state.search) p.set('q', state.search);
    if (state.budget) p.set('budget', state.budget);
    if (state.country) p.set('country', state.country);
    if (state.minRating) p.set('min_rating', state.minRating);
    if (state.interests.length) p.set('interests', state.interests.join(','));

    console.log("FILTER PARAMS:", p.toString());

    return p.toString();
  }

  /* ---------- CARD BUILD ---------- */
  function buildCard(a) {
    const div = document.createElement('div');
    div.className = 'card';

    const img = a.attraction_image
      ? `../../../assets/images/attraction/${a.attraction_image}`
      : 'https://placehold.co/400x190';

    div.innerHTML = `
      <div class="card-img-wrap">
        <img src="${img}" onerror="this.src='https://placehold.co/400x190'">
        <div class="card-rating">★ ${a.avg_rating}</div>
      </div>
      <div class="card-body">
        <h4>${a.city_name}, ${a.country_name}</h4>
        <p>${a.review_count} reviews</p>
        <a href="#" class="view-details-btn">View Details</a>
      </div>
    `;

    div.querySelector('.view-details-btn').addEventListener('click', () => {
      window.location.href = `../attraction_details/attraction_details.html?type=attraction&id=${a.attraction_id}`;
    });

    return div;
  }

  /* ---------- COMBO CARD ---------- */
  function buildComboCard(c) {
    const div = document.createElement('div');
    div.className = 'combo-card';

    const img = c.image
      ? `../../../assets/images/attraction/${c.image}`
      : 'https://placehold.co/400x160';

    const names = (c.combo_name || '').split(' + ');
    const shortName = names.slice(0, 3).join(' + ');
    const finalName = names.length > 3 ? shortName + ' + more' : shortName;

    div.innerHTML = `
      <div class="combo-img-wrap">
        <img src="${img}" onerror="this.src='https://placehold.co/400x160'">
      </div>
      <div class="combo-body">
        <h4>${finalName}</h4>
        <p>${c.city_name}, ${c.country_name}</p>
        <span>${c.stop_count} attractions</span>
        <a href="#" class="combo-view-btn">View Combo</a>
      </div>
    `;

    div.querySelector('.combo-view-btn').addEventListener('click', () => {
      window.location.href = `../attraction_details/attraction_details.html?type=combo&id=${c.trip_id}`;
    });

    return div;
  }

  function skeletons(n) {
    return Array(n).fill('<div class="skeleton-card"></div>').join('');
  }

});