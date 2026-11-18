// unimap - Interactive Application Logic
(function () {
  'use strict';

  const { i18n } = window.UNIMAP_DATA || {};

function escapeHtml(str) {
  const store = window.UnimapStore;
  if (store && typeof store.escapeHtml === 'function') {
    return store.escapeHtml(str);
  }
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Dynamic Restaurant Store Access
function getRestaurantsList() {
  const store = window.UnimapStore;
  if (store && typeof store.getAll === 'function') {
    return store.getAll();
  }
  const data = window.UNIMAP_DATA;
  return (data && data.restaurants) || [];
}

// Application State
const state = {
  currentLang: localStorage.getItem('unimap_lang') || 'ja',
  searchQuery: '',
  selectedDietary: 'all',
  selectedPayment: 'all',
  selectedArea: 'all',
  viewFavoritesOnly: false,
  favorites: new Set(JSON.parse(localStorage.getItem('unimap_favorites') || '[]')),
  activeModalId: null
};

// DOM Element References
const elements = {
  // Nav & Header
  langEnBtn: document.getElementById('langEnBtn'),
  langJaBtn: document.getElementById('langJaBtn'),
  langKoBtn: document.getElementById('langKoBtn'),
  langZhBtn: document.getElementById('langZhBtn'),
  navAddStoreLabel: document.getElementById('navAddStoreLabel'),
  navAdminLabel: document.getElementById('navAdminLabel'),
  savedToggleBtn: document.getElementById('savedToggleBtn'),
  savedCounter: document.getElementById('savedCounter'),
  savedCountLabel: document.getElementById('savedCountLabel'),
  navBrandName: document.getElementById('navBrandName'),
  navBrandTagline: document.getElementById('navBrandTagline'),
  navQrBtn: document.getElementById('navQrBtn'),
  qrModal: document.getElementById('qrModal'),
  qrModalCloseBtn: document.getElementById('qrModalCloseBtn'),
  qrModalImage: document.getElementById('qrModalImage'),
  qrModalUrlText: document.getElementById('qrModalUrlText'),
  btnCopyQrUrl: document.getElementById('btnCopyQrUrl'),
  btnSwitchQrMain: document.getElementById('btnSwitchQrMain'),
  btnSwitchQrAdmin: document.getElementById('btnSwitchQrAdmin'),
  
  // Hero & Tips
  heroBadgeText: document.getElementById('heroBadgeText'),
  heroTitle: document.getElementById('heroTitle'),
  heroDesc: document.getElementById('heroDesc'),
  quickTipsBanner: document.getElementById('quickTipsBanner'),
  tipsHeaderToggle: document.getElementById('tipsHeaderToggle'),
  tipsTitle: document.getElementById('tipsTitle'),
  tipText1: document.getElementById('tipText1'),
  tipText2: document.getElementById('tipText2'),
  tipText3: document.getElementById('tipText3'),
  
  // Search & Filter
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  labelDietary: document.getElementById('labelDietary'),
  labelPayment: document.getElementById('labelPayment'),
  labelArea: document.getElementById('labelArea'),
  resultsCount: document.getElementById('resultsCount'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),
  resetFiltersLabel: document.getElementById('resetFiltersLabel'),
  activeFilterIndicators: document.getElementById('activeFilterIndicators'),
  
  // Chips
  chipDietaryAll: document.getElementById('chipDietaryAll'),
  chipDietaryVegan: document.getElementById('chipDietaryVegan'),
  chipDietaryVeg: document.getElementById('chipDietaryVeg'),
  chipDietaryHalal: document.getElementById('chipDietaryHalal'),
  chipPaymentAll: document.getElementById('chipPaymentAll'),
  chipPaymentCashless: document.getElementById('chipPaymentCashless'),
  chipPaymentCredit: document.getElementById('chipPaymentCredit'),
  chipPaymentPaypay: document.getElementById('chipPaymentPaypay'),
  chipPaymentIc: document.getElementById('chipPaymentIc'),
  chipPaymentCashonly: document.getElementById('chipPaymentCashonly'),
  chipAreaAll: document.getElementById('chipAreaAll'),
  chipAreaStation: document.getElementById('chipAreaStation'),
  chipAreaKamegawa: document.getElementById('chipAreaKamegawa'),
  chipAreaKannawa: document.getElementById('chipAreaKannawa'),
  chipAreaMochigahama: document.getElementById('chipAreaMochigahama'),
  
  // Grid & States
  restaurantGrid: document.getElementById('restaurantGrid'),
  noResultsState: document.getElementById('noResultsState'),
  noResultsTitle: document.getElementById('noResultsTitle'),
  noResultsDesc: document.getElementById('noResultsDesc'),
  noResultsResetBtn: document.getElementById('noResultsResetBtn'),
  
  // Modal Elements
  restaurantModal: document.getElementById('restaurantModal'),
  modalCloseBtn: document.getElementById('modalCloseBtn'),
  modalImage: document.getElementById('modalImage'),
  modalBadgeOverlay: document.getElementById('modalBadgeOverlay'),
  modalGenreTag: document.getElementById('modalGenreTag'),
  modalRestaurantName: document.getElementById('modalRestaurantName'),
  modalRestaurantSubname: document.getElementById('modalRestaurantSubname'),
  modalMetaAreaLabel: document.getElementById('modalMetaAreaLabel'),
  modalArea: document.getElementById('modalArea'),
  modalMetaBudgetLabel: document.getElementById('modalMetaBudgetLabel'),
  modalBudget: document.getElementById('modalBudget'),
  paymentHighlightBox: document.getElementById('paymentHighlightBox'),
  modalPaymentTitle: document.getElementById('modalPaymentTitle'),
  modalPaymentStatusPill: document.getElementById('modalPaymentStatusPill'),
  modalPaymentBrands: document.getElementById('modalPaymentBrands'),
  modalPaymentNote: document.getElementById('modalPaymentNote'),
  dietaryHighlightBox: document.getElementById('dietaryHighlightBox'),
  modalDietaryTitle: document.getElementById('modalDietaryTitle'),
  modalDietaryBadges: document.getElementById('modalDietaryBadges'),
  modalDietaryNotes: document.getElementById('modalDietaryNotes'),
  modalRecommendationLabel: document.getElementById('modalRecommendationLabel'),
  modalRecommendationText: document.getElementById('modalRecommendationText'),
  modalStudentFeatures: document.getElementById('modalStudentFeatures'),
  modalDescription: document.getElementById('modalDescription'),
  modalHoursLabel: document.getElementById('modalHoursLabel'),
  modalHours: document.getElementById('modalHours'),
  modalHoliday: document.getElementById('modalHoliday'),
  modalAddressLabel: document.getElementById('modalAddressLabel'),
  modalAddress: document.getElementById('modalAddress'),
  modalMapsLink: document.getElementById('modalMapsLink'),
  modalMapsBtnLabel: document.getElementById('modalMapsBtnLabel'),
  modalShareBtn: document.getElementById('modalShareBtn'),
  modalShareBtnLabel: document.getElementById('modalShareBtnLabel'),
  modalEditBtn: document.getElementById('modalEditBtn'),
  modalEditBtnLabel: document.getElementById('modalEditBtnLabel'),
  
  // Toast & Footer
  toastNotification: document.getElementById('toastNotification'),
  toastMessage: document.getElementById('toastMessage'),
  footerDesc: document.getElementById('footerDesc')
};

// ==========================================================================
// Initialization & Event Binding
// ==========================================================================
function init() {
  updateLanguageUI();
  updateFavoritesCounter();
  renderRestaurants();
  setupEventListeners();

  // Check URL parameters for direct restaurant link (e.g. ?id=green-herb-beppu)
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('id');
  if (targetId) {
    const list = getRestaurantsList();
    const matched = list.find(r => r.id === targetId);
    if (matched) {
      setTimeout(() => openModal(matched), 300);
    }
  }
}

function setupEventListeners() {
  // Language Switchers
  if (elements.langEnBtn) elements.langEnBtn.addEventListener('click', () => setLanguage('en'));
  if (elements.langJaBtn) elements.langJaBtn.addEventListener('click', () => setLanguage('ja'));
  if (elements.langKoBtn) elements.langKoBtn.addEventListener('click', () => setLanguage('ko'));
  if (elements.langZhBtn) elements.langZhBtn.addEventListener('click', () => setLanguage('zh'));
  
  // Tips Banner Toggle
  elements.tipsHeaderToggle.addEventListener('click', toggleTipsBanner);
  elements.tipsHeaderToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTipsBanner();
    }
  });

  // Favorites Toggle
  elements.savedToggleBtn.addEventListener('click', () => {
    state.viewFavoritesOnly = !state.viewFavoritesOnly;
    elements.savedToggleBtn.classList.toggle('active', state.viewFavoritesOnly);
    renderRestaurants();
  });

  // Search input
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    elements.clearSearchBtn.style.display = state.searchQuery ? 'inline-flex' : 'none';
    renderRestaurants();
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    state.searchQuery = '';
    elements.searchInput.value = '';
    elements.clearSearchBtn.style.display = 'none';
    elements.searchInput.focus();
    renderRestaurants();
  });

  // Filter Chips Delegation
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const filterType = chip.getAttribute('data-filter');
      const filterValue = chip.getAttribute('data-value');

      // Update active state in group
      chip.parentElement.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      if (filterType === 'dietary') state.selectedDietary = filterValue;
      if (filterType === 'payment') state.selectedPayment = filterValue;
      if (filterType === 'area') state.selectedArea = filterValue;

      renderRestaurants();
    });
  });

  // Reset Filters Buttons
  elements.resetFiltersBtn.addEventListener('click', resetFilters);
  elements.noResultsResetBtn.addEventListener('click', resetFilters);

  // Modal Close Events
  elements.modalCloseBtn.addEventListener('click', closeModal);
  elements.restaurantModal.addEventListener('click', (e) => {
    if (e.target === elements.restaurantModal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (elements.restaurantModal && elements.restaurantModal.classList.contains('active')) {
        closeModal();
      }
      if (elements.qrModal && elements.qrModal.classList.contains('active')) {
        elements.qrModal.classList.remove('active');
      }
    }
  });

  // QR Modal Logic (URL for mobile access)
  const DEFAULT_TUNNEL_URL = 'https://gilbert-mobility-learning-motors.trycloudflare.com';
  let activeQrType = 'main';

  function getTargetMobileUrl(type) {
    let base = window.location.origin;
    if (window.location.protocol === 'file:') {
      base = DEFAULT_TUNNEL_URL || 'http://localhost:8080';
    } else if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && DEFAULT_TUNNEL_URL) {
      base = DEFAULT_TUNNEL_URL;
    }
    return type === 'admin' ? `${base}/admin.html` : `${base}/index.html`;
  }

  function updateQrDisplay(type) {
    activeQrType = type;
    const url = getTargetMobileUrl(type);
    if (elements.qrModalUrlText) elements.qrModalUrlText.textContent = url;
    if (elements.qrModalImage) {
      elements.qrModalImage.src = type === 'admin' ? 'qrcode_admin.png' : 'qrcode_main.png';
    }
    if (elements.btnSwitchQrMain) {
      elements.btnSwitchQrMain.className = type === 'main' ? 'btn btn-primary' : 'btn btn-secondary';
    }
    if (elements.btnSwitchQrAdmin) {
      elements.btnSwitchQrAdmin.className = type === 'admin' ? 'btn btn-primary' : 'btn btn-secondary';
    }
  }

  if (elements.navQrBtn && elements.qrModal) {
    elements.navQrBtn.addEventListener('click', () => {
      updateQrDisplay('main');
      elements.qrModal.classList.add('active');
    });

    if (elements.qrModalCloseBtn) {
      elements.qrModalCloseBtn.addEventListener('click', () => {
        elements.qrModal.classList.remove('active');
      });
    }

    elements.qrModal.addEventListener('click', (e) => {
      if (e.target === elements.qrModal) {
        elements.qrModal.classList.remove('active');
      }
    });

    if (elements.btnSwitchQrMain) {
      elements.btnSwitchQrMain.addEventListener('click', () => updateQrDisplay('main'));
    }
    if (elements.btnSwitchQrAdmin) {
      elements.btnSwitchQrAdmin.addEventListener('click', () => updateQrDisplay('admin'));
    }

    if (elements.btnCopyQrUrl) {
      elements.btnCopyQrUrl.addEventListener('click', () => {
        const url = getTargetMobileUrl(activeQrType);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            showToast('URLをコピーしました！📋');
          }).catch(() => {
            showToast('URL: ' + url);
          });
        } else {
          showToast('URL: ' + url);
        }
      });
    }
  }

  // Share restaurant button
  elements.modalShareBtn.addEventListener('click', () => {
    if (!state.activeModalId) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${state.activeModalId}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast(i18n[state.currentLang].copiedLink);
      }).catch(() => {
        showToast("URL: " + shareUrl);
      });
    } else {
      showToast("URL: " + shareUrl);
    }
  });
}

// ==========================================================================
// Language Switching & Translation Engine
// ==========================================================================
function getLocalized(item, prop) {
  if (!item) return '';
  const lang = state.currentLang;
  const capitalized = lang.charAt(0).toUpperCase() + lang.slice(1);
  if (item[prop + capitalized]) return item[prop + capitalized];

  // Lookup in restaurantI18n if available
  const dataObj = window.UNIMAP_DATA;
  if (dataObj && dataObj.restaurantI18n && dataObj.restaurantI18n[item.id] && dataObj.restaurantI18n[item.id][lang]) {
    const val = dataObj.restaurantI18n[item.id][lang][prop];
    if (val) return val;
  }

  if (lang === 'ja') return item[prop + 'Ja'] || item[prop + 'En'] || '';
  return item[prop + 'En'] || item[prop + 'Ja'] || '';
}

function getLocalizedSub(item, prop) {
  if (!item) return '';
  const lang = state.currentLang;
  if (lang === 'ja') {
    return item[prop + 'En'] || '';
  }
  return item[prop + 'Ja'] || item[prop + 'En'] || '';
}

function getLocalizedPaymentNote(item) {
  if (!item || !item.payment) return '';
  const lang = state.currentLang;
  const capitalized = lang.charAt(0).toUpperCase() + lang.slice(1);
  if (item.payment['note' + capitalized]) {
    return item.payment['note' + capitalized];
  }
  const dataObj = window.UNIMAP_DATA;
  if (dataObj && dataObj.restaurantI18n && dataObj.restaurantI18n[item.id] && dataObj.restaurantI18n[item.id][lang]) {
    const val = dataObj.restaurantI18n[item.id][lang].note;
    if (val) return val;
  }
  if (lang === 'ja') return item.payment.noteJa || item.payment.noteEn || '';
  return item.payment.noteEn || item.payment.noteJa || '';
}

function setLanguage(lang, force = false) {
  if (!lang) return;
  state.currentLang = lang;
  localStorage.setItem('unimap_lang', lang);
  
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
  
  updateLanguageUI();
  renderRestaurants();

  // If modal is currently open, refresh its content with the new language
  if (state.activeModalId) {
    const list = getRestaurantsList();
    const restaurant = list.find(r => r.id === state.activeModalId);
    if (restaurant) updateModalContent(restaurant);
  }
}

// Expose setLanguage globally for direct inline and script access
if (typeof window !== 'undefined') {
  window.setLanguage = setLanguage;
}

function updateLanguageUI() {
  const t = i18n[state.currentLang] || i18n.ja;
  document.documentElement.lang = state.currentLang;

  // Sync button active classes
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === state.currentLang);
  });

  // Header & Brand
  elements.navBrandName.textContent = t.appTitle;
  elements.navBrandTagline.textContent = t.appSubtitle;
  elements.savedCountLabel.textContent = t.favoritesTab;

  if (elements.navAddStoreLabel) {
    const labels = {
      en: '+ Add Store',
      ja: 'お店を追加',
      ko: '+ 매장 추가',
      zh: '+ 添加餐厅'
    };
    elements.navAddStoreLabel.textContent = labels[state.currentLang] || labels.ja;
  }
  if (elements.navAdminLabel) {
    const labels = {
      en: 'Admin',
      ja: '管理画面',
      ko: '관리 화면',
      zh: '管理后台'
    };
    elements.navAdminLabel.textContent = labels[state.currentLang] || labels.ja;
  }
  if (elements.modalEditBtnLabel) {
    const labels = {
      en: 'Edit in Admin ✏️',
      ja: '管理画面で編集 ✏️',
      ko: '관리 화면에서 편집 ✏️',
      zh: '在管理后台编辑 ✏️'
    };
    elements.modalEditBtnLabel.textContent = labels[state.currentLang] || labels.ja;
  }

  // Hero Section
  elements.heroBadgeText.textContent = t.heroBadge;
  elements.heroTitle.textContent = t.heroTitle;
  elements.heroDesc.textContent = t.heroDesc;

  // Tips Banner
  elements.tipsTitle.textContent = t.tipsTitle;
  elements.tipText1.innerHTML = t.tip1;
  elements.tipText2.innerHTML = t.tip2;
  elements.tipText3.innerHTML = t.tip3;

  // Search & Filter Headings
  elements.searchInput.placeholder = t.searchPlaceholder;
  elements.labelDietary.textContent = t.dietaryHeading;
  elements.labelPayment.textContent = t.paymentHeading;
  elements.labelArea.textContent = t.areaHeading;
  elements.resetFiltersLabel.textContent = t.clearAll;

  // Filter Chips Labels
  elements.chipDietaryAll.textContent = t.dietaryAll;
  elements.chipDietaryVegan.textContent = t.dietaryVegan;
  elements.chipDietaryVeg.textContent = t.dietaryVegetarian;
  elements.chipDietaryHalal.textContent = t.dietaryHalal;

  elements.chipPaymentAll.textContent = t.paymentAll;
  elements.chipPaymentCashless.textContent = t.paymentCashless;
  elements.chipPaymentCredit.textContent = t.paymentCredit;
  elements.chipPaymentPaypay.textContent = t.paymentPaypay;
  elements.chipPaymentIc.textContent = t.paymentIc;
  elements.chipPaymentCashonly.textContent = t.paymentCashOnly;

  elements.chipAreaAll.textContent = t.areaAll;
  elements.chipAreaStation.textContent = t.areaBeppuStation;
  elements.chipAreaKamegawa.textContent = t.areaKamegawa;
  elements.chipAreaKannawa.textContent = t.areaKannawa;
  elements.chipAreaMochigahama.textContent = t.areaMochigahama;

  // Empty State & Footer
  elements.noResultsTitle.textContent = t.noResultsTitle;
  elements.noResultsDesc.textContent = t.noResultsDesc;
  elements.noResultsResetBtn.textContent = t.clearAll;
  elements.footerDesc.textContent = t.appSubtitle;
}

function toggleTipsBanner() {
  const isOpen = elements.quickTipsBanner.classList.toggle('open');
  elements.tipsHeaderToggle.setAttribute('aria-expanded', isOpen);
}

// ==========================================================================
// Filtering Logic
// ==========================================================================
function getFilteredRestaurants() {
  const restaurants = getRestaurantsList();
  return restaurants.filter(item => {
    // 1. Favorites-only tab filter
    if (state.viewFavoritesOnly && !state.favorites.has(item.id)) {
      return false;
    }

    // 2. Keyword Search (names, genres, descriptions, dish)
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const allNames = (item.nameEn + ' ' + item.nameJa + ' ' + (item.nameKo || '') + ' ' + (item.nameZh || '')).toLowerCase();
      const allGenres = (item.genreEn + ' ' + item.genreJa + ' ' + (item.genreKo || '') + ' ' + (item.genreZh || '')).toLowerCase();
      const allDescs = (item.descriptionEn + ' ' + item.descriptionJa + ' ' + (item.descriptionKo || '') + ' ' + (item.descriptionZh || '')).toLowerCase();
      const allDishes = (item.recommendedDishEn + ' ' + item.recommendedDishJa + ' ' + (item.recommendedDishKo || '') + ' ' + (item.recommendedDishZh || '')).toLowerCase();
      const matchBrand = item.payment.brands.some(b => b.toLowerCase().includes(q));

      if (!allNames.includes(q) && !allGenres.includes(q) && !allDescs.includes(q) && !allDishes.includes(q) && !matchBrand) {
        return false;
      }
    }

    // 3. Dietary Filter
    if (state.selectedDietary !== 'all') {
      if (state.selectedDietary === 'vegan') {
        if (!item.dietary.includes('vegan')) return false;
      } else if (state.selectedDietary === 'vegetarian') {
        // Vegetarians can also eat Vegan food
        if (!item.dietary.includes('vegetarian') && !item.dietary.includes('vegan')) return false;
      } else if (state.selectedDietary === 'halal-friendly') {
        if (!item.dietary.includes('halal-friendly')) return false;
      }
    }

    // 4. Payment Filter
    if (state.selectedPayment !== 'all') {
      if (state.selectedPayment === 'cashless') {
        if (item.payment.isCashOnly) return false;
      } else if (state.selectedPayment === 'cashonly') {
        if (!item.payment.isCashOnly) return false;
      } else if (state.selectedPayment === 'credit') {
        if (!item.payment.methods.includes('credit')) return false;
      } else if (state.selectedPayment === 'paypay') {
        if (!item.payment.methods.includes('paypay')) return false;
      } else if (state.selectedPayment === 'ic') {
        if (!item.payment.methods.includes('ic')) return false;
      }
    }

    // 5. Area Filter
    if (state.selectedArea !== 'all') {
      if (item.areaId !== state.selectedArea) return false;
    }

    return true;
  });
}

function resetFilters() {
  state.searchQuery = '';
  state.selectedDietary = 'all';
  state.selectedPayment = 'all';
  state.selectedArea = 'all';
  state.viewFavoritesOnly = false;
  elements.savedToggleBtn.classList.remove('active');

  elements.searchInput.value = '';
  elements.clearSearchBtn.style.display = 'none';

  // Reset active classes
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.classList.toggle('active', chip.getAttribute('data-value') === 'all');
  });

  renderRestaurants();
}

// ==========================================================================
// Rendering Functions
// ==========================================================================
function renderRestaurants() {
  const filtered = getFilteredRestaurants();
  const t = i18n[state.currentLang];
  const isEn = state.currentLang === 'en';

  // Results count badge
  elements.resultsCount.textContent = t.resultsCount(filtered.length);
  renderActiveFilterPills();

  if (filtered.length === 0) {
    elements.restaurantGrid.style.display = 'none';
    elements.noResultsState.style.display = 'block';
    if (state.viewFavoritesOnly) {
      elements.noResultsDesc.textContent = t.noFavoritesText;
    }
    return;
  }

  elements.restaurantGrid.style.display = 'grid';
  elements.noResultsState.style.display = 'none';

  elements.restaurantGrid.innerHTML = filtered.map(item => {
    const isFavorited = state.favorites.has(item.id);
    const title = escapeHtml(getLocalized(item, 'name'));
    const subTitle = escapeHtml(getLocalizedSub(item, 'name'));
    const genre = escapeHtml(getLocalized(item, 'genre'));
    const area = escapeHtml(getLocalized(item, 'areaName'));
    const priceRange = escapeHtml(item.priceRange);
    const image = escapeHtml(item.image);
    const isCashOnly = item.payment.isCashOnly;

    // Dietary Badges HTML
    let dietaryBadgesHtml = '';
    if (item.dietary.includes('vegan')) {
      dietaryBadgesHtml += `<span class="badge-dietary badge-vegan">🌿 Vegan</span>`;
    } else if (item.dietary.includes('vegetarian')) {
      dietaryBadgesHtml += `<span class="badge-dietary badge-veg">🥗 Vegetarian</span>`;
    }
    if (item.dietary.includes('halal-friendly')) {
      dietaryBadgesHtml += `<span class="badge-dietary badge-halal">🍖 Halal</span>`;
    }

    // Payment Banner HTML
    let paymentBannerHtml = '';
    const coinsLabel = {
      en: 'Bills & Coins Only',
      ja: '千円札・小銭のみ',
      ko: '지폐 및 동전 전용',
      zh: '仅支持纸币与硬币'
    }[state.currentLang] || 'Bills & Coins Only';

    if (isCashOnly) {
      paymentBannerHtml = `
        <div class="card-payment-banner is-cashonly">
          <span class="payment-banner-icon">⚠️</span>
          <span>${t.cashOnlyWarning}</span>
          <span class="payment-brands-preview">${coinsLabel}</span>
        </div>
      `;
    } else {
      const topBrands = item.payment.brands.slice(0, 3).join(', ');
      paymentBannerHtml = `
        <div class="card-payment-banner is-cashless">
          <span class="payment-banner-icon">💳</span>
          <span>${t.cashlessAccepted}</span>
          <span class="payment-brands-preview">${topBrands}</span>
        </div>
      `;
    }

    // Student Perks / Features
    let perkBadges = '';
    if (item.studentDiscount) {
      perkBadges += `<span class="mini-badge has-perk">${t.studentDiscountBadge}</span>`;
    }
    if (item.englishMenu) {
      perkBadges += `<span class="mini-badge">${t.englishMenuAvailable}</span>`;
    }

    // Custom Store Badge HTML
    const customBadgeHtml = item.isCustom
      ? `<span class="badge-custom-user">👤 ${isEn ? 'Custom' : '登録店舗'}</span>`
      : '';

    return `
      <article class="restaurant-card" data-id="${item.id}" role="button" tabindex="0">
        <div class="card-image-wrap">
          <img 
            src="${image}" 
            alt="${title}" 
            class="card-image" 
            loading="lazy" 
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';"
          />
          ${customBadgeHtml}
          <div class="card-dietary-badges">
            ${dietaryBadgesHtml}
          </div>
          <button 
            type="button" 
            class="favorite-btn ${isFavorited ? 'favorited' : ''}" 
            data-favorite-id="${item.id}" 
            aria-label="Save ${title}"
            title="Save restaurant"
          >
            ${isFavorited ? '❤️' : '🤍'}
          </button>
        </div>

        <div class="card-body">
          <div class="card-genre-area">
            <span>${area}</span>
            <span class="genre-dot">•</span>
            <span>${genre}</span>
          </div>

          <h3 class="card-title">${title}</h3>
          <div class="card-subname">${subTitle}</div>

          ${paymentBannerHtml}

          <div class="card-meta-row">
            <span class="card-budget">💵 ${priceRange}</span>
            <div class="card-badges-row">
              ${perkBadges}
            </div>
            <a href="admin.html?edit=${item.id}" class="card-edit-shortcut" title="${isEn ? 'Edit in Admin' : '管理画面で編集'}" onclick="event.stopPropagation();">
              <span>✏️</span> <span>${isEn ? 'Edit' : '編集'}</span>
            </a>
          </div>

          <button type="button" class="card-details-btn" tabindex="-1">
            <span>${t.viewDetails}</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </article>
    `;
  }).join('');

  // Attach card click handlers
  elements.restaurantGrid.querySelectorAll('.restaurant-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't open modal if user clicked favorite heart button or edit link
      if (e.target.closest('.favorite-btn') || e.target.closest('.card-edit-shortcut')) return;
      const id = card.getAttribute('data-id');
      const list = getRestaurantsList();
      const item = list.find(r => r.id === id);
      if (item) openModal(item);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('.favorite-btn') || e.target.closest('.card-edit-shortcut')) return;
        e.preventDefault();
        const id = card.getAttribute('data-id');
        const list = getRestaurantsList();
        const item = list.find(r => r.id === id);
        if (item) openModal(item);
      }
    });
  });

  // Attach favorite button handlers
  elements.restaurantGrid.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-favorite-id');
      toggleFavorite(id);
    });
  });
}

function renderActiveFilterPills() {
  const pills = [];
  const t = i18n[state.currentLang];

  if (state.selectedDietary !== 'all') {
    const map = {
      'vegan': t.dietaryVegan,
      'vegetarian': t.dietaryVegetarian,
      'halal-friendly': t.dietaryHalal
    };
    pills.push(map[state.selectedDietary]);
  }

  if (state.selectedPayment !== 'all') {
    const map = {
      'cashless': t.paymentCashless,
      'credit': t.paymentCredit,
      'paypay': t.paymentPaypay,
      'ic': t.paymentIc,
      'cashonly': t.paymentCashOnly
    };
    pills.push(map[state.selectedPayment]);
  }

  if (state.selectedArea !== 'all') {
    const map = {
      'beppu-station': t.areaBeppuStation,
      'kamegawa': t.areaKamegawa,
      'kannawa': t.areaKannawa,
      'mochigahama': t.areaMochigahama
    };
    pills.push(map[state.selectedArea]);
  }

  elements.activeFilterIndicators.innerHTML = pills
    .map(label => `<span class="active-pill">${label}</span>`)
    .join('');
}

// ==========================================================================
// Favorites System
// ==========================================================================
function toggleFavorite(id) {
  const t = i18n[state.currentLang] || i18n.ja;
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    showToast(t.favoriteRemoved || 'お気に入りから削除しました');
  } else {
    state.favorites.add(id);
    showToast(t.favoriteAdded || 'お気に入りに保存しました！❤️');
  }

  localStorage.setItem('unimap_favorites', JSON.stringify([...state.favorites]));
  updateFavoritesCounter();
  renderRestaurants();
}

function updateFavoritesCounter() {
  elements.savedCounter.textContent = state.favorites.size;
}

// ==========================================================================
// Modal Logic
// ==========================================================================
function openModal(restaurant) {
  state.activeModalId = restaurant.id;
  updateModalContent(restaurant);
  elements.restaurantModal.classList.add('active');
  elements.restaurantModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Lock background scroll
  elements.modalCloseBtn.focus();
}

function closeModal() {
  elements.restaurantModal.classList.remove('active');
  elements.restaurantModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  state.activeModalId = null;
}

function updateModalContent(restaurant) {
  const t = i18n[state.currentLang] || i18n.ja;

  elements.modalImage.src = restaurant.image;
  elements.modalImage.alt = getLocalized(restaurant, 'name');
  elements.modalRestaurantName.textContent = getLocalized(restaurant, 'name');
  elements.modalRestaurantSubname.textContent = getLocalizedSub(restaurant, 'name');
  elements.modalGenreTag.textContent = getLocalized(restaurant, 'genre');
  
  elements.modalMetaAreaLabel.textContent = t.areaLabel + ':';
  elements.modalArea.textContent = getLocalized(restaurant, 'areaName');
  elements.modalMetaBudgetLabel.textContent = t.budgetLabel + ':';
  elements.modalBudget.textContent = restaurant.priceRange;

  // Modal Badge Overlay
  let overlayHtml = '';
  if (restaurant.dietary.includes('vegan')) overlayHtml += `<span class="badge-dietary badge-vegan">🌿 Vegan</span>`;
  if (restaurant.dietary.includes('vegetarian')) overlayHtml += `<span class="badge-dietary badge-veg">🥗 Vegetarian</span>`;
  if (restaurant.dietary.includes('halal-friendly')) overlayHtml += `<span class="badge-dietary badge-halal">🍖 Halal-friendly</span>`;
  elements.modalBadgeOverlay.innerHTML = overlayHtml;

  // Payment Box
  elements.modalPaymentTitle.textContent = t.modalPaymentTitle;
  const isCashOnly = restaurant.payment.isCashOnly;
  
  elements.paymentHighlightBox.className = 'payment-highlight-box ' + (isCashOnly ? 'highlight-cashonly' : 'highlight-cashless');
  elements.modalPaymentStatusPill.className = 'payment-status-pill ' + (isCashOnly ? 'pill-cashonly' : 'pill-cashless');
  elements.modalPaymentStatusPill.textContent = isCashOnly ? t.cashOnlyWarning : t.cashlessAccepted;
  
  elements.modalPaymentBrands.innerHTML = restaurant.payment.brands.map(brand => 
    `<span class="brand-chip">${brand}</span>`
  ).join('');
  
  elements.modalPaymentNote.textContent = getLocalizedPaymentNote(restaurant);

  // Dietary Box
  elements.modalDietaryTitle.textContent = t.modalDietaryTitle;
  elements.modalDietaryBadges.innerHTML = overlayHtml;
  elements.modalDietaryNotes.textContent = getLocalized(restaurant, 'dietaryNotes');

  // Recommendation
  elements.modalRecommendationLabel.textContent = t.modalRecommendation;
  elements.modalRecommendationText.textContent = getLocalized(restaurant, 'recommendedDish');

  // Student Features
  let featuresHtml = '';
  if (restaurant.studentDiscount) featuresHtml += `<span class="feature-pill">${t.studentDiscountBadge}</span>`;
  if (restaurant.englishMenu) featuresHtml += `<span class="feature-pill">📖 ${t.englishMenuAvailable}</span>`;
  if (restaurant.englishStaff) featuresHtml += `<span class="feature-pill">🗣️ ${t.englishStaffAvailable}</span>`;
  if (restaurant.wifi) featuresHtml += `<span class="feature-pill">${t.wifiBadge}</span>`;
  if (restaurant.takeout) featuresHtml += `<span class="feature-pill">${t.takeoutBadge}</span>`;
  elements.modalStudentFeatures.innerHTML = featuresHtml;

  // Description
  elements.modalDescription.textContent = getLocalized(restaurant, 'description');

  // Opening Hours & Address
  elements.modalHoursLabel.textContent = t.modalHoursTitle + ':';
  elements.modalHours.textContent = getLocalized(restaurant, 'hours');
  elements.modalHoliday.textContent = getLocalized(restaurant, 'holiday');

  elements.modalAddressLabel.textContent = t.modalAddressTitle + ':';
  elements.modalAddress.textContent = getLocalized(restaurant, 'address');

  // Action Buttons
  elements.modalMapsLink.href = restaurant.googleMapsUrl;
  elements.modalMapsBtnLabel.textContent = t.openInGoogleMaps;
  elements.modalShareBtnLabel.textContent = t.shareRestaurant;

  // Edit in Admin button
  if (elements.modalEditBtn) {
    elements.modalEditBtn.style.display = 'inline-flex';
    elements.modalEditBtn.href = 'admin.html?edit=' + encodeURIComponent(restaurant.id);
  }
}

// ==========================================================================
// Toast Notification Helper
// ==========================================================================
let toastTimer = null;
function showToast(message) {
  if (toastTimer) clearTimeout(toastTimer);
  elements.toastMessage.textContent = message;
  elements.toastNotification.classList.add('show');

  toastTimer = setTimeout(() => {
    elements.toastNotification.classList.remove('show');
  }, 2600);
}

  // Boot up
  document.addEventListener('DOMContentLoaded', init);
})();
