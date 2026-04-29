document.addEventListener('DOMContentLoaded', () => {

  /* ---------- STATE ---------- */
  const state = {
    activeTab: 'recommended',
    budget: '',
    country: '',
    interests: [],
    minRating: 0,
    startDate: '',
    endDate: ''
  };

  /* ---------- ELEMENTS ---------- */
  const tabBtns      = document.querySelectorAll('.tab-btn');
  const panelRec     = document.getElementById('panel-recommended');
  const panelPop     = document.getElementById('panel-popular');
  const recCards     = document.getElementById('recommended-cards');
  const comboCards   = document.getElementById('combo-cards');
  const noRec        = document.getElementById('no-rec');
  const noCombo      = document.getElementById('no-combo');
  const budgetSel    = document.getElementById('budget-select');
  const countrySel   = document.getElementById('country-select');
  const interestCont = document.getElementById('interest-tags');
  const starFilter   = document.getElementById('star-filter');
  const stars        = starFilter.querySelectorAll('.star');
  const startDate    = document.getElementById('start-date');
  const endDate      = document.getElementById('end-date');
  const btnApply     = document.getElementById('btn-apply');
  const btnClear     = document.getElementById('btn-clear');

  /* ---------- INIT ---------- */
  loadCountries();
  loadCategories();
  loadRecommended();

  /* ---------- TAB SWITCHING ---------- */
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeTab = btn.dataset.tab;

      if (state.activeTab === 'recommended') {
        panelRec.classList.add('active');
        panelPop.classList.remove('active');
        panelPop.classList.add('hidden');
        panelRec.classList.remove('hidden');
        loadRecommended();
      } else {
        panelPop.classList.add('active');
        panelRec.classList.remove('active');
        panelRec.classList.add('hidden');
        panelPop.classList.remove('hidden');
        loadPopularCombos();
      }
    });
  });

  /* ---------- STAR FILTER ---------- */
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.val);
      state.minRating = (state.minRating === val) ? 0 : val; // toggle off if same
      updateStars();
    });
    star.addEventListener('mouseover', () => highlightStars(parseInt(star.dataset.val)));
    star.addEventListener('mouseout', () => updateStars());
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
      state.interests.push(cat);
    } else {
      state.interests = state.interests.filter(i => i !== cat);
    }
  });

  /* ---------- APPLY / CLEAR ---------- */
  btnApply.addEventListener('click', () => {
    state.budget    = budgetSel.value;
    state.country   = countrySel.value;

    if (state.activeTab === 'recommended') loadRecommended();
    else loadPopularCombos();
  });

  btnClear.addEventListener('click', () => {
    budgetSel.value   = '';
    countrySel.value  = '';
    state.budget      = '';
    state.country     = '';
    state.interests   = [];
    state.minRating   = 0;
    updateStars();
    document.querySelectorAll('.interest-tag').forEach(t => t.classList.remove('active'));

    if (state.activeTab === 'recommended') loadRecommended();
    else loadPopularCombos();
  });

  /* =============================================
     FETCH FUNCTIONS
     ============================================= */

  /* Load country dropdown */
  async function loadCountries() {
    try {
      const res  = await fetch('discover.php?action=get_countries');
      const data = await res.json();
      if (data.status === 'ok') {
        data.countries.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.country_id;
          opt.textContent = c.country_name;
          countrySel.appendChild(opt);
        });
      }
    } catch (e) { console.warn('Countries load failed', e); }
  }

  /* Load attraction categories as interest tags */
  async function loadCategories() {
    const icons = {
      'Historical': '🏛️',
      'City':       '🌆',
      'Food':       '🍜',
      'Nature':     '🌿',
      'Landmark':   '🗼',
    };
    try {
      const res  = await fetch('discover.php?action=get_categories');
      const data = await res.json();
      if (data.status === 'ok') {
        interestCont.innerHTML = '';
        data.categories.forEach(cat => {
          const icon = icons[cat] || '🌍';
          const btn  = document.createElement('button');
          btn.className    = 'interest-tag';
          btn.dataset.category = cat;
          btn.innerHTML    = `<span class="tag-icon">${icon}</span>${cat}`;
          interestCont.appendChild(btn);
        });
      }
    } catch (e) {
      /* Fallback static tags */
      const defaults = ['Historical','City','Food','Nature','Landmark'];
      defaults.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'interest-tag';
        btn.dataset.category = cat;
        btn.textContent = cat;
        interestCont.appendChild(btn);
      });
    }
  }

  /* Load recommended attractions */
  async function loadRecommended() {
    recCards.innerHTML = skeletons(6);
    noRec.classList.add('hidden');

    const params = buildParams();
    try {
      const res  = await fetch(`discover.php?action=get_recommended&${params}`);
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

  /* Load popular combo trips */
  async function loadPopularCombos() {
    comboCards.innerHTML = skeletons(6);
    noCombo.classList.add('hidden');

    try {
      const res  = await fetch('discover.php?action=get_combos');
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

  /* ---------- HELPERS ---------- */

  function buildParams() {
    const p = new URLSearchParams();
    if (state.budget)    p.set('budget',    state.budget);
    if (state.country)   p.set('country',   state.country);
    if (state.minRating) p.set('min_rating', state.minRating);
    if (state.interests.length) p.set('interests', state.interests.join(','));
    return p.toString();
  }

  function skeletons(n) {
    return Array(n).fill('<div class="skeleton-card"></div>').join('');
  }

  function buildCard(a) {
    const div = document.createElement('div');
    div.className = 'card';
    const img   = a.attraction_image
      ? `../../../assets/images/${a.attraction_image}`
      : 'https://placehold.co/400x190?text=No+Image';
    const rating = parseFloat(a.avg_rating || 0).toFixed(1);
    const reviews = a.review_count || 0;

    div.innerHTML = `
      <div class="card-img-wrap">
        <img src="${img}" alt="${a.attraction_name}" loading="lazy"
             onerror="this.src='https://placehold.co/400x190?text=No+Image'">
        <div class="card-rating">
          <span class="star-icon">★</span> ${rating}
        </div>
      </div>
      <div class="card-body">
        <h4>${a.attraction_name}</h4>
        <div class="card-reviews">${reviews.toLocaleString()} reviews</div>
        <p>${a.attraction_description || 'Explore this amazing destination.'}</p>
        <button class="btn-view" data-id="${a.attraction_id}">View Details</button>
      </div>`;

    div.querySelector('.btn-view').addEventListener('click', () => {
      window.location.href = `../attraction/attraction.html?id=${a.attraction_id}`;
    });
    return div;
  }

  function buildComboCard(c) {
    const div = document.createElement('div');
    div.className = 'combo-card';

    const badgeLabels = ['Most Popular', 'Best Value', 'Hot Deal', 'Top Rated'];
    const badgeClasses = ['', 'best', 'hot', 'deal'];
    const badgeIndex   = c.combo_index % 4;
    const badge        = badgeLabels[badgeIndex];
    const badgeCls     = badgeClasses[badgeIndex];

    const img = c.image
      ? `../../../assets/images/${c.image}`
      : 'https://placehold.co/400x160?text=Combo';

    const tagHtml = (c.categories || '').split(',').map(cat => {
      const cl = cat.trim().toLowerCase();
      return `<span class="combo-tag ${cl}">${cat.trim()}</span>`;
    }).join('');

    const price = c.total_price
      ? `From <span>RM${parseFloat(c.total_price).toLocaleString()}</span> per person`
      : '';

    div.innerHTML = `
      <div class="combo-img-wrap">
        <img src="${img}" alt="${c.combo_name}" loading="lazy"
             onerror="this.src='https://placehold.co/400x160?text=Combo'">
        <div class="combo-badge ${badgeCls}">${badge}</div>
      </div>
      <div class="combo-body">
        <h4>${c.combo_name}</h4>
        <div class="combo-meta">
          <span>🗓️ ${c.total_days || '?'} Days</span>
          ${price ? `<span>💰 ${price}</span>` : ''}
          <span>📍 ${c.cities || ''}</span>
        </div>
        <div class="combo-tags">${tagHtml}</div>
        <button class="btn-combo" data-id="${c.trip_id}">Use This Combo</button>
      </div>`;

    div.querySelector('.btn-combo').addEventListener('click', () => {
      window.location.href = `../tripPlanner/tripPlanner.html?combo=${c.trip_id}`;
    });
    return div;
  }

});
