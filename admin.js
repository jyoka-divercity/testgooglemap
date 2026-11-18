// unimap - Admin Console Application Logic
// Handles Store Addition/Editing, Real-time Live Preview, List Management, and Data Export/Import

(function () {
  'use strict';

  const Store = window.UnimapStore;
  const escapeHtml = (Store && typeof Store.escapeHtml === 'function') ? Store.escapeHtml : (s => s || '');

  // State
  const state = {
    lang: localStorage.getItem('unimap_lang') || 'ja',
    previewLang: 'ja',
    editingId: null,
    selectedBrands: new Set(['Visa', 'Mastercard', 'PayPay', 'Cash']),
    pendingDeleteId: null
  };

  // Translations for Admin UI
  const adminI18n = {
    ja: {
      headerBadge: '管理画面 / Admin',
      backHome: 'メイン画面に戻る',
      statsTitle: '🍜 店舗管理ダッシュボード',
      statsSubtitle: '別府の新しい飲食店を追加したり、支払い方法や食の配慮情報を編集できます。',
      statTotal: '登録店舗総数',
      statCustom: '追加した店舗',
      statCashless: 'キャッシュレス可',
      statCashonly: '現金のみ ⚠️',
      tabForm: '店舗を追加・編集',
      tabList: '登録店舗一覧',
      tabBackup: 'データバックアップ・出力',
      formTitleNew: '新しい店舗を登録',
      formTitleEdit: '店舗情報を編集',
      formSubNew: '店舗の基本情報や食の配慮、決済ブランドを入力してください。',
      formSubEdit: '登録済み店舗の情報を更新して保存します。',
      submitNew: 'この内容で店舗を登録する',
      submitEdit: '変更内容を保存・更新する',
      clearForm: 'クリア',
      editingBadge: '編集中',
      btnCancelEdit: '新規追加に戻る',
      livePreviewTitle: 'リアルタイム表示プレビュー',
      previewNotice: '💡 入力内容に合わせて本番と同じカードデザインがリアルタイムに更新されます。',
      searchPlaceholder: '店舗名、エリア、ジャンルで検索...',
      thStore: '店舗情報',
      thArea: 'エリア',
      thDietary: '食の配慮',
      thPayment: '支払い方法',
      thType: '種別',
      thActions: '操作',
      customBadge: '👤 登録店舗',
      defaultBadge: '初期店舗',
      btnEdit: '✏️ 編集',
      btnDelete: '🗑️ 削除',
      addedToast: '新しい店舗を追加しました！🎉 メイン画面に反映されました。',
      updatedToast: '店舗情報を更新しました！✨',
      deletedToast: '店舗を削除しました。🗑️',
      resetToast: '標準店舗（30店舗）にリセットしました。',
      copiedToast: 'data.js用のコードをクリップボードにコピーしました！📋',
      importedToast: '店舗データをインポートしました！✨',
      invalidImportToast: '無効なJSONファイルです。フォーマットを確認してください。',
      fillRequiredToast: '日本語と英語の店舗名を入力してください。'
    },
    en: {
      headerBadge: 'Store Admin Console',
      backHome: 'Back to Guide',
      statsTitle: '🍜 Restaurant Management Dashboard',
      statsSubtitle: 'Add new Beppu restaurants, update dietary policies, or manage cashless/cash-only payments.',
      statTotal: 'Total Places',
      statCustom: 'Custom Added',
      statCashless: 'Cashless OK',
      statCashonly: 'Cash Only ⚠️',
      tabForm: 'Add / Edit Place',
      tabList: 'Manage All Places',
      tabBackup: 'Data Backup & Export',
      formTitleNew: 'Register New Restaurant',
      formTitleEdit: 'Edit Restaurant Details',
      formSubNew: 'Fill in restaurant details, dietary restrictions, and accepted payments.',
      formSubEdit: 'Update and save the restaurant profile.',
      submitNew: 'Register Restaurant',
      submitEdit: 'Save & Update Details',
      clearForm: 'Clear',
      editingBadge: 'Editing',
      btnCancelEdit: 'Back to New Place',
      livePreviewTitle: 'Real-time Card Preview',
      previewNotice: '💡 Live preview updates instantaneously as you type.',
      searchPlaceholder: 'Search name, area, genre...',
      thStore: 'Restaurant',
      thArea: 'Area',
      thDietary: 'Dietary',
      thPayment: 'Payment',
      thType: 'Type',
      thActions: 'Actions',
      customBadge: '👤 Custom Added',
      defaultBadge: 'Default Place',
      btnEdit: '✏️ Edit',
      btnDelete: '🗑️ Delete',
      addedToast: 'New restaurant registered successfully! 🎉',
      updatedToast: 'Restaurant updated successfully! ✨',
      deletedToast: 'Restaurant deleted. 🗑️',
      resetToast: 'Reset to default 30 restaurants.',
      copiedToast: 'data.js code copied to clipboard! 📋',
      importedToast: 'Restaurants imported successfully! ✨',
      invalidImportToast: 'Invalid JSON file. Please check file format.',
      fillRequiredToast: 'Please fill both Japanese and English restaurant names.'
    },
    ko: {
      headerBadge: '관리 화면 / Admin',
      backHome: '메인 화면으로 돌아가기',
      statsTitle: '🍜 매장 관리 대시보드',
      statsSubtitle: '벳푸의 새로운 음식점을 추가하거나, 결제 수단 및 식단 배려 정보를 편집할 수 있습니다.',
      statTotal: '등록 매장 수',
      statCustom: '직접 추가한 매장',
      statCashless: '카드/전자결제 가능',
      statCashonly: '현금 전용 ⚠️',
      tabForm: '매장 추가·편집',
      tabList: '등록 매장 목록',
      tabBackup: '데이터 백업·내보내기',
      formTitleNew: '새로운 매장 등록',
      formTitleEdit: '매장 정보 편집',
      formSubNew: '매장의 기본 정보, 식단 배려, 결제 브랜드를 입력하세요.',
      formSubEdit: '등록된 매장 정보를 수정하고 저장합니다.',
      submitNew: '이 내용으로 매장 등록',
      submitEdit: '변경사항 저장·업데이트',
      clearForm: '초기화',
      editingBadge: '편집 중',
      btnCancelEdit: '새 매장 등록으로 돌아가기',
      livePreviewTitle: '실시간 미리보기',
      previewNotice: '💡 입력한 내용에 따라 실제 카드 디자인이 실시간으로 업데이트됩니다.',
      searchPlaceholder: '매장명, 지역, 음식 종류로 검색...',
      thStore: '매장 정보',
      thArea: '지역',
      thDietary: '식단 배려',
      thPayment: '결제 수단',
      thType: '구분',
      thActions: '관리',
      customBadge: '👤 직접 등록',
      defaultBadge: '기본 매장',
      btnEdit: '✏️ 편집',
      btnDelete: '🗑️ 삭제',
      addedToast: '새로운 매장이 추가되었습니다! 🎉 메인 화면에 반영되었습니다.',
      updatedToast: '매장 정보가 업데이트되었습니다! ✨',
      deletedToast: '매장이 삭제되었습니다. 🗑️',
      resetToast: '기본 30개 매장으로 초기화되었습니다.',
      copiedToast: 'data.js용 코드가 클립보드에 복사되었습니다! 📋',
      importedToast: '매장 데이터를 가져왔습니다! ✨',
      invalidImportToast: '올바르지 않은 JSON 파일입니다. 형식을 확인하세요.',
      fillRequiredToast: '매장 이름을 입력해주세요.'
    },
    zh: {
      headerBadge: '管理后台 / Admin',
      backHome: '返回主页面',
      statsTitle: '🍜 餐厅管理控制台',
      statsSubtitle: '添加别府新餐厅，编辑支付方式及清真、纯素等饮食偏好信息。',
      statTotal: '已登记餐厅总数',
      statCustom: '自定义添加',
      statCashless: '支持电子支付/刷卡',
      statCashonly: '仅收现金 ⚠️',
      tabForm: '添加与编辑餐厅',
      tabList: '餐厅列表管理',
      tabBackup: '数据备份与导出',
      formTitleNew: '登记新餐厅',
      formTitleEdit: '编辑餐厅信息',
      formSubNew: '请输入餐厅基本信息、饮食偏好及支持的支付品牌。',
      formSubEdit: '更新已登记餐厅的信息并保存。',
      submitNew: '保存并登记餐厅',
      submitEdit: '保存修改',
      clearForm: '清空表单',
      editingBadge: '编辑中',
      btnCancelEdit: '返回新增',
      livePreviewTitle: '实时效果预览',
      previewNotice: '💡 随着输入实时更新展示真实卡片预览。',
      searchPlaceholder: '搜索餐厅名称、区域、菜系...',
      thStore: '餐厅信息',
      thArea: '区域',
      thDietary: '饮食限制',
      thPayment: '支付方式',
      thType: '类别',
      thActions: '操作',
      customBadge: '👤 自定义添加',
      defaultBadge: '默认预设',
      btnEdit: '✏️ 编辑',
      btnDelete: '🗑️ 删除',
      addedToast: '已成功添加新餐厅！🎉 已同步至主界面。',
      updatedToast: '餐厅信息已更新！✨',
      deletedToast: '餐厅已删除。🗑️',
      resetToast: '已重置为默认30家餐厅。',
      copiedToast: '已复制 data.js 代码到剪贴板！📋',
      importedToast: '已导入餐厅数据！✨',
      invalidImportToast: '无效的 JSON 文件，请检查格式。',
      fillRequiredToast: '请填写餐厅名称。'
    }
  };

  // DOM Elements
  const el = {
    // Nav & Stats
    adminHeaderBadge: document.getElementById('adminHeaderBadge'),
    labelBackHome: document.getElementById('labelBackHome'),
    adminLangEnBtn: document.getElementById('adminLangEnBtn'),
    adminLangJaBtn: document.getElementById('adminLangJaBtn'),
    adminLangKoBtn: document.getElementById('adminLangKoBtn'),
    adminLangZhBtn: document.getElementById('adminLangZhBtn'),
    statsHeaderTitle: document.getElementById('statsHeaderTitle'),
    statsHeaderSubtitle: document.getElementById('statsHeaderSubtitle'),
    statTotalCount: document.getElementById('statTotalCount'),
    statCustomCount: document.getElementById('statCustomCount'),
    statCashlessCount: document.getElementById('statCashlessCount'),
    statCashonlyCount: document.getElementById('statCashonlyCount'),
    statLabelTotal: document.getElementById('statLabelTotal'),
    statLabelCustom: document.getElementById('statLabelCustom'),
    statLabelCashless: document.getElementById('statLabelCashless'),
    statLabelCashonly: document.getElementById('statLabelCashonly'),

    // Tabs
    tabBtnForm: document.getElementById('tabBtnForm'),
    tabBtnList: document.getElementById('tabBtnList'),
    tabBtnBackup: document.getElementById('tabBtnBackup'),
    tabLabelForm: document.getElementById('tabLabelForm'),
    tabLabelList: document.getElementById('tabLabelList'),
    tabLabelBackup: document.getElementById('tabLabelBackup'),
    tabListBadge: document.getElementById('tabListBadge'),
    tabContentForm: document.getElementById('tabContentForm'),
    tabContentList: document.getElementById('tabContentList'),
    tabContentBackup: document.getElementById('tabContentBackup'),

    // Form
    restaurantForm: document.getElementById('restaurantForm'),
    formMainTitle: document.getElementById('formMainTitle'),
    formTitleText: document.getElementById('formTitleText'),
    formSubText: document.getElementById('formSubText'),
    editingModeIndicator: document.getElementById('editingModeIndicator'),
    editingBadgeText: document.getElementById('editingBadgeText'),
    btnCancelEdit: document.getElementById('btnCancelEdit'),
    formStoreId: document.getElementById('formStoreId'),
    inputNameJa: document.getElementById('inputNameJa'),
    inputNameEn: document.getElementById('inputNameEn'),
    selectArea: document.getElementById('selectArea'),
    inputPriceRange: document.getElementById('inputPriceRange'),
    inputGenreJa: document.getElementById('inputGenreJa'),
    inputGenreEn: document.getElementById('inputGenreEn'),
    inputImageUrl: document.getElementById('inputImageUrl'),
    presetGallery: document.getElementById('presetGallery'),

    // Dietary
    checkVegan: document.getElementById('checkVegan'),
    checkVegetarian: document.getElementById('checkVegetarian'),
    checkHalal: document.getElementById('checkHalal'),
    cardDietaryVegan: document.getElementById('cardDietaryVegan'),
    cardDietaryVeg: document.getElementById('cardDietaryVeg'),
    cardDietaryHalal: document.getElementById('cardDietaryHalal'),
    inputDietaryNotesJa: document.getElementById('inputDietaryNotesJa'),
    inputDietaryNotesEn: document.getElementById('inputDietaryNotesEn'),

    // Payment
    radioCashless: document.getElementById('radioCashless'),
    radioCashonly: document.getElementById('radioCashonly'),
    modeCashlessCard: document.getElementById('modeCashlessCard'),
    modeCashonlyCard: document.getElementById('modeCashonlyCard'),
    brandChipsWrap: document.getElementById('brandChipsWrap'),
    inputCustomBrands: document.getElementById('inputCustomBrands'),
    inputPaymentNoteJa: document.getElementById('inputPaymentNoteJa'),
    inputPaymentNoteEn: document.getElementById('inputPaymentNoteEn'),

    // Services
    checkStudentDiscount: document.getElementById('checkStudentDiscount'),
    checkEnglishMenu: document.getElementById('checkEnglishMenu'),
    checkEnglishStaff: document.getElementById('checkEnglishStaff'),
    checkWifi: document.getElementById('checkWifi'),
    checkTakeout: document.getElementById('checkTakeout'),

    // Details
    inputRecommendJa: document.getElementById('inputRecommendJa'),
    inputRecommendEn: document.getElementById('inputRecommendEn'),
    inputHoursJa: document.getElementById('inputHoursJa'),
    inputHoursEn: document.getElementById('inputHoursEn'),
    inputHolidayJa: document.getElementById('inputHolidayJa'),
    inputHolidayEn: document.getElementById('inputHolidayEn'),
    inputAddressJa: document.getElementById('inputAddressJa'),
    inputAddressEn: document.getElementById('inputAddressEn'),
    inputMapsUrl: document.getElementById('inputMapsUrl'),
    inputDescJa: document.getElementById('inputDescJa'),
    inputDescEn: document.getElementById('inputDescEn'),

    // Action buttons
    btnResetForm: document.getElementById('btnResetForm'),
    btnSubmitForm: document.getElementById('btnSubmitForm'),
    labelClearForm: document.getElementById('labelClearForm'),
    labelSubmitForm: document.getElementById('labelSubmitForm'),

    // Preview
    liveCardPreview: document.getElementById('liveCardPreview'),
    previewLangJaBtn: document.getElementById('previewLangJaBtn'),
    previewLangEnBtn: document.getElementById('previewLangEnBtn'),
    previewLangKoBtn: document.getElementById('previewLangKoBtn'),
    previewLangZhBtn: document.getElementById('previewLangZhBtn'),
    labelLivePreview: document.getElementById('labelLivePreview'),
    labelPreviewNotice: document.getElementById('labelPreviewNotice'),

    // Manage List
    manageSearchInput: document.getElementById('manageSearchInput'),
    manageTableBody: document.getElementById('manageTableBody'),
    btnQuickAddNew: document.getElementById('btnQuickAddNew'),
    labelQuickAddNew: document.getElementById('labelQuickAddNew'),

    // Backup
    btnDownloadJson: document.getElementById('btnDownloadJson'),
    btnTriggerImport: document.getElementById('btnTriggerImport'),
    fileImportJson: document.getElementById('fileImportJson'),
    dataJsCodePreview: document.getElementById('dataJsCodePreview'),
    btnCopyDataJs: document.getElementById('btnCopyDataJs'),
    btnResetToDefaults: document.getElementById('btnResetToDefaults'),

    // Modals
    confirmDeleteModal: document.getElementById('confirmDeleteModal'),
    btnCancelDelete: document.getElementById('btnCancelDelete'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete'),
    confirmResetModal: document.getElementById('confirmResetModal'),
    btnCancelReset: document.getElementById('btnCancelReset'),
    btnConfirmReset: document.getElementById('btnConfirmReset'),

    // Toast
    adminToast: document.getElementById('adminToast'),
    adminToastMsg: document.getElementById('adminToastMsg'),

    // QR Modal
    adminQrBtn: document.getElementById('adminQrBtn'),
    adminQrModal: document.getElementById('adminQrModal'),
    adminQrModalCloseBtn: document.getElementById('adminQrModalCloseBtn'),
    adminQrModalImage: document.getElementById('adminQrModalImage'),
    adminQrModalUrlText: document.getElementById('adminQrModalUrlText'),
    adminBtnCopyQrUrl: document.getElementById('adminBtnCopyQrUrl'),
    adminBtnSwitchQrMain: document.getElementById('adminBtnSwitchQrMain'),
    adminBtnSwitchQrAdmin: document.getElementById('adminBtnSwitchQrAdmin')
  };

  // ==========================================================================
  // Initialization
  // ==========================================================================
  function init() {
    renderPresets();
    renderBrandChips();
    setupEventListeners();
    updateLanguage();
    refreshData();
    updateLivePreview();

    // Check if URL has ?edit=id parameter
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
      loadForEdit(editId);
    }
  }

  // ==========================================================================
  // Event Listeners
  // ==========================================================================
  function setupEventListeners() {
    // Language Switchers
    if (el.adminLangEnBtn) el.adminLangEnBtn.addEventListener('click', () => setAdminLang('en'));
    if (el.adminLangJaBtn) el.adminLangJaBtn.addEventListener('click', () => setAdminLang('ja'));
    if (el.adminLangKoBtn) el.adminLangKoBtn.addEventListener('click', () => setAdminLang('ko'));
    if (el.adminLangZhBtn) el.adminLangZhBtn.addEventListener('click', () => setAdminLang('zh'));

    // Preview Language Switch
    const previewBtns = [
      { btn: el.previewLangJaBtn, lang: 'ja' },
      { btn: el.previewLangEnBtn, lang: 'en' },
      { btn: el.previewLangKoBtn, lang: 'ko' },
      { btn: el.previewLangZhBtn, lang: 'zh' }
    ];
    previewBtns.forEach(item => {
      if (item.btn) {
        item.btn.addEventListener('click', () => {
          state.previewLang = item.lang;
          previewBtns.forEach(b => { if (b.btn) b.btn.classList.toggle('active', b.lang === item.lang); });
          updateLivePreview();
        });
      }
    });

    // Tab Navigation
    [el.tabBtnForm, el.tabBtnList, el.tabBtnBackup].forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    // Payment Mode Radio Changes
    el.radioCashless.addEventListener('change', () => {
      el.modeCashlessCard.classList.add('selected-cashless');
      el.modeCashonlyCard.classList.remove('selected-cashonly');
      updateLivePreview();
    });
    el.radioCashonly.addEventListener('change', () => {
      el.modeCashonlyCard.classList.add('selected-cashonly');
      el.modeCashlessCard.classList.remove('selected-cashless');
      updateLivePreview();
    });

    // Form live change listeners for instant preview
    const formInputElements = el.restaurantForm.querySelectorAll('input, select, textarea');
    formInputElements.forEach(input => {
      input.addEventListener('input', updateLivePreview);
      input.addEventListener('change', updateLivePreview);
    });

    // Checkbox styling sync
    [el.checkVegan, el.checkVegetarian, el.checkHalal].forEach(chk => {
      chk.addEventListener('change', () => {
        chk.closest('.custom-checkbox-card').classList.toggle('checked-card', chk.checked);
        updateLivePreview();
      });
    });

    // Form submit
    el.restaurantForm.addEventListener('submit', handleFormSubmit);
    el.btnResetForm.addEventListener('click', resetForm);
    el.btnCancelEdit.addEventListener('click', resetForm);
    el.btnQuickAddNew.addEventListener('click', () => {
      resetForm();
      switchTab('form');
    });

    // Manage List Search
    el.manageSearchInput.addEventListener('input', (e) => {
      renderManageTable(e.target.value.trim().toLowerCase());
    });

    // Backup actions
    el.btnDownloadJson.addEventListener('click', downloadJsonBackup);
    el.btnTriggerImport.addEventListener('click', () => el.fileImportJson.click());
    el.fileImportJson.addEventListener('change', handleFileImport);
    el.btnCopyDataJs.addEventListener('click', copyDataJsCode);

    // Delete Modal
    el.btnCancelDelete.addEventListener('click', () => {
      el.confirmDeleteModal.classList.remove('active');
      state.pendingDeleteId = null;
    });
    el.btnConfirmDelete.addEventListener('click', executeDelete);

    // Reset Modal
    el.btnResetToDefaults.addEventListener('click', () => {
      el.confirmResetModal.classList.add('active');
    });
    el.btnCancelReset.addEventListener('click', () => {
      el.confirmResetModal.classList.remove('active');
    });
    el.btnConfirmReset.addEventListener('click', executeResetDefaults);

    // QR Modal Handlers (URL for mobile access)
    const DEFAULT_TUNNEL_URL = 'https://gilbert-mobility-learning-motors.trycloudflare.com';
    let activeQrType = 'admin';

    function getTargetMobileUrl(type) {
      let base = window.location.origin;
      if (window.location.protocol === 'file:') {
        base = DEFAULT_TUNNEL_URL || 'http://localhost:8080';
      } else if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && DEFAULT_TUNNEL_URL) {
        base = DEFAULT_TUNNEL_URL;
      }
      return type === 'admin' ? `${base}/admin.html` : `${base}/index.html`;
    }

    function updateAdminQr(type) {
      activeQrType = type;
      const url = getTargetMobileUrl(type);
      if (el.adminQrModalUrlText) el.adminQrModalUrlText.textContent = url;
      if (el.adminQrModalImage) {
        el.adminQrModalImage.src = type === 'admin' ? 'qrcode_admin.png' : 'qrcode_main.png';
      }
      if (el.adminBtnSwitchQrMain) {
        el.adminBtnSwitchQrMain.className = type === 'main' ? 'btn btn-primary' : 'btn btn-secondary';
      }
      if (el.adminBtnSwitchQrAdmin) {
        el.adminBtnSwitchQrAdmin.className = type === 'admin' ? 'btn btn-primary' : 'btn btn-secondary';
      }
    }

    if (el.adminQrBtn && el.adminQrModal) {
      el.adminQrBtn.addEventListener('click', () => {
        updateAdminQr('admin');
        el.adminQrModal.classList.add('active');
      });

      if (el.adminQrModalCloseBtn) {
        el.adminQrModalCloseBtn.addEventListener('click', () => {
          el.adminQrModal.classList.remove('active');
        });
      }

      el.adminQrModal.addEventListener('click', (e) => {
        if (e.target === el.adminQrModal) {
          el.adminQrModal.classList.remove('active');
        }
      });

      if (el.adminBtnSwitchQrMain) {
        el.adminBtnSwitchQrMain.addEventListener('click', () => updateAdminQr('main'));
      }
      if (el.adminBtnSwitchQrAdmin) {
        el.adminBtnSwitchQrAdmin.addEventListener('click', () => updateAdminQr('admin'));
      }

      if (el.adminBtnCopyQrUrl) {
        el.adminBtnCopyQrUrl.addEventListener('click', () => {
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

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (el.adminQrModal && el.adminQrModal.classList.contains('active')) {
          el.adminQrModal.classList.remove('active');
        }
      }
    });
  }

  // ==========================================================================
  // Tab Switching
  // ==========================================================================
  function switchTab(tab) {
    [el.tabBtnForm, el.tabBtnList, el.tabBtnBackup].forEach(b => b.classList.remove('active'));
    [el.tabContentForm, el.tabContentList, el.tabContentBackup].forEach(c => c.classList.remove('active'));

    if (tab === 'form') {
      el.tabBtnForm.classList.add('active');
      el.tabContentForm.classList.add('active');
    } else if (tab === 'list') {
      el.tabBtnList.classList.add('active');
      el.tabContentList.classList.add('active');
      renderManageTable();
    } else if (tab === 'backup') {
      el.tabBtnBackup.classList.add('active');
      el.tabContentBackup.classList.add('active');
      refreshCodePreview();
    }
  }

  // ==========================================================================
  // Preset Photos & Brands
  // ==========================================================================
  function renderPresets() {
    const isEn = state.lang === 'en';
    el.presetGallery.innerHTML = Store.PRESET_IMAGES.map((preset, idx) => `
      <div class="preset-card ${idx === 0 ? 'active' : ''}" data-url="${preset.url}" title="${isEn ? preset.labelEn : preset.labelJa}">
        <img src="${preset.url}" alt="${preset.labelJa}" loading="lazy">
        <span class="preset-card-label">${isEn ? preset.labelEn : preset.labelJa}</span>
      </div>
    `).join('');

    el.presetGallery.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        el.presetGallery.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        el.inputImageUrl.value = card.getAttribute('data-url');
        updateLivePreview();
      });
    });
  }

  function renderBrandChips() {
    el.brandChipsWrap.innerHTML = Store.COMMON_BRANDS.map(brand => {
      const isSelected = state.selectedBrands.has(brand);
      return `
        <button type="button" class="brand-chip-toggle ${isSelected ? 'active' : ''}" data-brand="${brand}">
          <span>${isSelected ? '✓' : '+'}</span>
          <span>${brand}</span>
        </button>
      `;
    }).join('');

    el.brandChipsWrap.querySelectorAll('.brand-chip-toggle').forEach(chip => {
      chip.addEventListener('click', () => {
        const brand = chip.getAttribute('data-brand');
        if (state.selectedBrands.has(brand)) {
          state.selectedBrands.delete(brand);
          chip.classList.remove('active');
          chip.querySelector('span:first-child').textContent = '+';
        } else {
          state.selectedBrands.add(brand);
          chip.classList.add('active');
          chip.querySelector('span:first-child').textContent = '✓';
        }
        updateLivePreview();
      });
    });
  }

  // ==========================================================================
  // Live Card Preview
  // ==========================================================================
  function updateLivePreview() {
    const lang = state.previewLang;
    const isEn = lang === 'en';

    const labels = {
      cashOnly: { en: 'Cash Only ⚠️', ja: '現金のみ ⚠️', ko: '현금 전용 ⚠️', zh: '仅收现金 ⚠️' }[lang] || '現金のみ ⚠️',
      billsCoins: { en: 'Bills & Coins', ja: '券売機・現金', ko: '지폐・동전', zh: '纸币・硬币' }[lang] || '券売機・現金',
      cashlessOk: { en: 'Cashless OK 💳', ja: 'キャッシュレス可 💳', ko: '카드/전자결제 가능 💳', zh: '支持电子支付/刷卡 💳' }[lang] || 'キャッシュレス可 💳',
      studentDisc: { en: 'Student Disc.', ja: '学割', ko: '학생 할인', zh: '学生优惠' }[lang] || '学割',
      englishMenu: { en: 'English Menu', ja: '英語メニュー', ko: '영어 메뉴', zh: '英语菜单' }[lang] || '英語メニュー',
      viewDetails: { en: 'View Details & Payment', ja: '詳細・決済一覧を見る', ko: '상세정보 및 결제 확인', zh: '查看详情与支付方式' }[lang] || '詳細・決済一覧を見る'
    };

    const nameJa = el.inputNameJa.value.trim() || '（店舗名を入力）';
    const nameEn = el.inputNameEn.value.trim() || 'Restaurant Name';
    const title = escapeHtml(lang === 'en' ? nameEn : nameJa);
    const subTitle = escapeHtml(lang === 'en' ? nameJa : nameEn);

    const genreJa = el.inputGenreJa.value.trim() || 'ジャンル未設定';
    const genreEn = el.inputGenreEn.value.trim() || 'Dining';
    const genre = escapeHtml(lang === 'en' ? genreEn : genreJa);

    const areaValue = el.selectArea.value;
    const areaPreset = Store.PRESET_AREAS.find(a => a.id === areaValue) || { nameJa: '別府市内', nameEn: 'Beppu Area' };
    let rawArea = areaPreset.nameJa;
    if (lang === 'en') rawArea = areaPreset.nameEn;
    else if (lang === 'ko') rawArea = areaPreset.nameKo || areaPreset.nameJa;
    else if (lang === 'zh') rawArea = areaPreset.nameZh || areaPreset.nameJa;
    const area = escapeHtml(rawArea);

    const price = escapeHtml(el.inputPriceRange.value.trim() || '¥1,000〜¥1,500');
    const image = escapeHtml(el.inputImageUrl.value.trim() || Store.PRESET_IMAGES[0].url);

    // Dietary
    const isVegan = el.checkVegan.checked;
    const isVeg = el.checkVegetarian.checked;
    const isHalal = el.checkHalal.checked;

    let dietaryBadgesHtml = '';
    if (isVegan) dietaryBadgesHtml += `<span class="badge-dietary badge-vegan">🌿 Vegan</span>`;
    else if (isVeg) dietaryBadgesHtml += `<span class="badge-dietary badge-veg">🥗 Veg</span>`;
    if (isHalal) dietaryBadgesHtml += `<span class="badge-dietary badge-halal">🍖 Halal</span>`;

    // Payment
    const isCashOnly = el.radioCashonly.checked;
    let paymentBannerHtml = '';
    if (isCashOnly) {
      paymentBannerHtml = `
        <div class="card-payment-banner is-cashonly">
          <span class="payment-banner-icon">⚠️</span>
          <span>${labels.cashOnly}</span>
          <span class="payment-brands-preview">${labels.billsCoins}</span>
        </div>
      `;
    } else {
      const brandList = Array.from(state.selectedBrands);
      const topBrands = brandList.slice(0, 3).join(', ') || 'Credit, PayPay';
      paymentBannerHtml = `
        <div class="card-payment-banner is-cashless">
          <span class="payment-banner-icon">💳</span>
          <span>${labels.cashlessOk}</span>
          <span class="payment-brands-preview">${topBrands}</span>
        </div>
      `;
    }

    // Perks
    let perkBadges = '';
    if (el.checkStudentDiscount.checked) {
      perkBadges += `<span class="mini-badge has-perk">🎓 ${labels.studentDisc}</span>`;
    }
    if (el.checkEnglishMenu.checked) {
      perkBadges += `<span class="mini-badge">📖 ${labels.englishMenu}</span>`;
    }

    el.liveCardPreview.innerHTML = `
      <article class="restaurant-card" style="box-shadow: var(--shadow-sm); cursor: default;">
        <div class="card-image-wrap">
          <img src="${image}" alt="${title}" class="card-image" onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';">
          <div class="card-dietary-badges">
            ${dietaryBadgesHtml}
          </div>
          <button type="button" class="favorite-btn" style="pointer-events: none;" title="Save">🤍</button>
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
            <span class="card-budget">💵 ${price}</span>
            <div class="card-badges-row">
              ${perkBadges}
            </div>
          </div>
          <button type="button" class="card-details-btn" style="pointer-events: none;">
            <span>${labels.viewDetails}</span>
            <span>→</span>
          </button>
        </div>
      </article>
    `;
  }

  // ==========================================================================
  // Form Submission (Add or Update)
  // ==========================================================================
  function handleFormSubmit(e) {
    e.preventDefault();

    const nameJa = el.inputNameJa.value.trim();
    const nameEn = el.inputNameEn.value.trim();

    if (!nameJa || !nameEn) {
      showToast(adminI18n[state.lang].fillRequiredToast);
      return;
    }

    const areaId = el.selectArea.value;
    const areaPreset = Store.PRESET_AREAS.find(a => a.id === areaId) || { nameJa: '別府市内', nameEn: 'Beppu Area' };

    // Dietary
    const dietary = [];
    if (el.checkVegan.checked) dietary.push('vegan');
    if (el.checkVegetarian.checked) dietary.push('vegetarian');
    if (el.checkHalal.checked) dietary.push('halal-friendly');

    // Payment brands
    const isCashOnly = el.radioCashonly.checked;
    let brands = [];
    let methods = [];

    if (isCashOnly) {
      methods = ['cash'];
      brands = ['Cash Only (¥1,000 bills & coins)'];
    } else {
      brands = Array.from(state.selectedBrands);
      const customBrands = el.inputCustomBrands.value.trim();
      if (customBrands) {
        customBrands.split(',').map(s => s.trim()).filter(Boolean).forEach(b => {
          if (!brands.includes(b)) brands.push(b);
        });
      }
      if (brands.length === 0) brands.push('Cash');

      methods = [];
      if (brands.some(b => /visa|master|jcb|amex|express/i.test(b))) methods.push('credit');
      if (brands.some(b => /paypay/i.test(b))) methods.push('paypay');
      if (brands.some(b => /suica|nimoca|sugoca|ic/i.test(b))) methods.push('ic');
      if (!methods.includes('cash')) methods.push('cash');
    }

    const restaurantData = {
      nameJa,
      nameEn,
      areaId,
      areaNameJa: areaPreset.nameJa,
      areaNameEn: areaPreset.nameEn,
      genreJa: el.inputGenreJa.value.trim() || '和食・カフェ',
      genreEn: el.inputGenreEn.value.trim() || 'Dining & Cafe',
      priceRange: el.inputPriceRange.value.trim() || '¥1,000〜¥1,500',
      image: el.inputImageUrl.value.trim() || Store.PRESET_IMAGES[0].url,
      dietary,
      dietaryNotesJa: el.inputDietaryNotesJa.value.trim(),
      dietaryNotesEn: el.inputDietaryNotesEn.value.trim(),
      payment: {
        isCashOnly,
        methods,
        brands,
        noteJa: el.inputPaymentNoteJa.value.trim() || (isCashOnly ? '現金専用店舗です。食券機をご利用ください。' : '各種キャッシュレス決済に対応しています。'),
        noteEn: el.inputPaymentNoteEn.value.trim() || (isCashOnly ? 'Cash only store. Ticket machine inside.' : 'Cashless payments accepted.')
      },
      englishMenu: el.checkEnglishMenu.checked,
      englishStaff: el.checkEnglishStaff.checked,
      studentDiscount: el.checkStudentDiscount.checked,
      wifi: el.checkWifi.checked,
      takeout: el.checkTakeout.checked,
      recommendedDishJa: el.inputRecommendJa.value.trim(),
      recommendedDishEn: el.inputRecommendEn.value.trim(),
      hoursJa: el.inputHoursJa.value.trim() || '11:00 - 20:00',
      hoursEn: el.inputHoursEn.value.trim() || '11:00 - 20:00',
      holidayJa: el.inputHolidayJa.value.trim() || '不定休',
      holidayEn: el.inputHolidayEn.value.trim() || 'Irregular holidays',
      addressJa: el.inputAddressJa.value.trim() || '大分県別府市',
      addressEn: el.inputAddressEn.value.trim() || 'Beppu-shi, Oita',
      googleMapsUrl: el.inputMapsUrl.value.trim() || 'https://maps.google.com/?q=Beppu+Station',
      descriptionJa: el.inputDescJa.value.trim(),
      descriptionEn: el.inputDescEn.value.trim()
    };

    if (state.editingId) {
      // Update
      Store.update(state.editingId, restaurantData);
      showToast(adminI18n[state.lang].updatedToast);
    } else {
      // Add
      Store.add(restaurantData);
      showToast(adminI18n[state.lang].addedToast);
    }

    resetForm();
    refreshData();
    switchTab('list');
  }

  function resetForm() {
    state.editingId = null;
    el.formStoreId.value = '';
    el.restaurantForm.reset();

    // Default presets
    el.inputImageUrl.value = Store.PRESET_IMAGES[0].url;
    el.presetGallery.querySelectorAll('.preset-card').forEach((c, idx) => {
      c.classList.toggle('active', idx === 0);
    });

    state.selectedBrands = new Set(['Visa', 'Mastercard', 'PayPay', 'Cash']);
    renderBrandChips();

    el.radioCashless.checked = true;
    el.modeCashlessCard.classList.add('selected-cashless');
    el.modeCashonlyCard.classList.remove('selected-cashonly');

    [el.cardDietaryVegan, el.cardDietaryVeg, el.cardDietaryHalal].forEach(c => c.classList.remove('checked-card'));

    el.editingModeIndicator.style.display = 'none';
    el.formTitleText.textContent = adminI18n[state.lang].formTitleNew;
    el.formSubText.textContent = adminI18n[state.lang].formSubNew;
    el.labelSubmitForm.textContent = adminI18n[state.lang].submitNew;

    updateLivePreview();
  }

  function loadForEdit(id) {
    const item = Store.getById(id);
    if (!item) return;

    state.editingId = item.id;
    el.formStoreId.value = item.id;

    el.inputNameJa.value = item.nameJa || '';
    el.inputNameEn.value = item.nameEn || '';
    el.selectArea.value = item.areaId || 'beppu-station';
    el.inputPriceRange.value = item.priceRange || '';
    el.inputGenreJa.value = item.genreJa || '';
    el.inputGenreEn.value = item.genreEn || '';
    el.inputImageUrl.value = item.image || '';

    // Match preset card
    el.presetGallery.querySelectorAll('.preset-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-url') === item.image);
    });

    // Dietary
    const dietary = item.dietary || [];
    el.checkVegan.checked = dietary.includes('vegan');
    el.cardDietaryVegan.classList.toggle('checked-card', el.checkVegan.checked);

    el.checkVegetarian.checked = dietary.includes('vegetarian');
    el.cardDietaryVeg.classList.toggle('checked-card', el.checkVegetarian.checked);

    el.checkHalal.checked = dietary.includes('halal-friendly');
    el.cardDietaryHalal.classList.toggle('checked-card', el.checkHalal.checked);

    el.inputDietaryNotesJa.value = item.dietaryNotesJa || '';
    el.inputDietaryNotesEn.value = item.dietaryNotesEn || '';

    // Payment
    const isCashOnly = !!(item.payment && item.payment.isCashOnly);
    el.radioCashless.checked = !isCashOnly;
    el.radioCashonly.checked = isCashOnly;
    el.modeCashlessCard.classList.toggle('selected-cashless', !isCashOnly);
    el.modeCashonlyCard.classList.toggle('selected-cashonly', isCashOnly);

    const brands = (item.payment && item.payment.brands) || ['Cash'];
    state.selectedBrands = new Set(brands);
    renderBrandChips();

    el.inputPaymentNoteJa.value = (item.payment && item.payment.noteJa) || '';
    el.inputPaymentNoteEn.value = (item.payment && item.payment.noteEn) || '';

    // Services
    el.checkStudentDiscount.checked = !!item.studentDiscount;
    el.checkEnglishMenu.checked = !!item.englishMenu;
    el.checkEnglishStaff.checked = !!item.englishStaff;
    el.checkWifi.checked = !!item.wifi;
    el.checkTakeout.checked = !!item.takeout;

    // Details
    el.inputRecommendJa.value = item.recommendedDishJa || '';
    el.inputRecommendEn.value = item.recommendedDishEn || '';
    el.inputHoursJa.value = item.hoursJa || '';
    el.inputHoursEn.value = item.hoursEn || '';
    el.inputHolidayJa.value = item.holidayJa || '';
    el.inputHolidayEn.value = item.holidayEn || '';
    el.inputAddressJa.value = item.addressJa || '';
    el.inputAddressEn.value = item.addressEn || '';
    el.inputMapsUrl.value = item.googleMapsUrl || '';
    el.inputDescJa.value = item.descriptionJa || '';
    el.inputDescEn.value = item.descriptionEn || '';

    // UI Mode Update
    el.editingModeIndicator.style.display = 'flex';
    el.formTitleText.textContent = adminI18n[state.lang].formTitleEdit;
    el.formSubText.textContent = adminI18n[state.lang].formSubEdit;
    el.labelSubmitForm.textContent = adminI18n[state.lang].submitEdit;

    switchTab('form');
    updateLivePreview();
    window.scrollTo({ top: 180, behavior: 'smooth' });
  }

  // ==========================================================================
  // Manage Table
  // ==========================================================================
  function renderManageTable(searchQuery = '') {
    const all = Store.getAll();
    const isEn = state.lang === 'en';
    const t = adminI18n[state.lang];

    let filtered = all;
    if (searchQuery) {
      filtered = all.filter(item => {
        const name = (item.nameJa + ' ' + item.nameEn).toLowerCase();
        const genre = (item.genreJa + ' ' + item.genreEn).toLowerCase();
        const area = (item.areaNameJa + ' ' + item.areaNameEn).toLowerCase();
        return name.includes(searchQuery) || genre.includes(searchQuery) || area.includes(searchQuery);
      });
    }

    if (filtered.length === 0) {
      el.manageTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            店舗が見つかりませんでした。「新しい店舗を登録」ボタンから追加できます。
          </td>
        </tr>
      `;
      return;
    }

    el.manageTableBody.innerHTML = filtered.map(item => {
      const isCustom = !!item.isCustom;
      const langCap = state.lang.charAt(0).toUpperCase() + state.lang.slice(1);
      const rawTitle = item['name' + langCap] || (state.lang === 'en' ? item.nameEn : item.nameJa);
      const rawSub = state.lang === 'ja' ? item.nameEn : item.nameJa;
      const rawArea = item['areaName' + langCap] || (state.lang === 'en' ? item.areaNameEn : item.areaNameJa);

      const title = escapeHtml(rawTitle);
      const subTitle = escapeHtml(rawSub);
      const area = escapeHtml(rawArea);
      const priceRange = escapeHtml(item.priceRange);
      const imageUrl = escapeHtml(item.image);
      const isCashOnly = item.payment && item.payment.isCashOnly;

      // Dietary badges
      let dietHtml = '';
      if (item.dietary.includes('vegan')) dietHtml += '<span class="badge-dietary badge-vegan" style="font-size:0.7rem; padding: 2px 6px;">🌿 Vegan</span> ';
      if (item.dietary.includes('vegetarian')) dietHtml += '<span class="badge-dietary badge-veg" style="font-size:0.7rem; padding: 2px 6px;">🥗 Veg</span> ';
      if (item.dietary.includes('halal-friendly')) dietHtml += '<span class="badge-dietary badge-halal" style="font-size:0.7rem; padding: 2px 6px;">🍖 Halal</span>';
      if (!dietHtml) dietHtml = '<span style="color: #94a3b8; font-size: 0.8rem;">なし</span>';

      // Payment badge
      const payHtml = isCashOnly
        ? '<span style="color: #e11d48; font-weight: 700; font-size: 0.82rem;">⚠️ 現金のみ</span>'
        : '<span style="color: #059669; font-weight: 700; font-size: 0.82rem;">💳 キャッシュレス可</span>';

      // Custom badge
      const typeHtml = isCustom
        ? `<span class="store-type-badge badge-custom-store">${t.customBadge}</span>`
        : `<span class="store-type-badge badge-default-store">${t.defaultBadge}</span>`;

      return `
        <tr>
          <td>
            <div class="store-row-info">
              <img src="${imageUrl}" alt="${title}" class="store-row-thumb" onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';">
              <div class="store-row-names">
                <h4>${title}</h4>
                <div class="sub">${subTitle} • ${priceRange}</div>
              </div>
            </div>
          </td>
          <td>${area}</td>
          <td>${dietHtml}</td>
          <td>${payHtml}</td>
          <td>${typeHtml}</td>
          <td style="text-align: right;">
            <div class="row-actions-group" style="justify-content: flex-end;">
              <button type="button" class="btn-action-edit" data-edit-id="${item.id}" title="${t.btnEdit}">
                ${t.btnEdit}
              </button>
              <button type="button" class="btn-action-delete" data-delete-id="${item.id}" title="${t.btnDelete}">
                ${t.btnDelete}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach actions
    el.manageTableBody.querySelectorAll('.btn-action-edit').forEach(b => {
      b.addEventListener('click', () => loadForEdit(b.getAttribute('data-edit-id')));
    });

    el.manageTableBody.querySelectorAll('.btn-action-delete').forEach(b => {
      b.addEventListener('click', () => {
        state.pendingDeleteId = b.getAttribute('data-delete-id');
        el.confirmDeleteModal.classList.add('active');
      });
    });
  }

  function executeDelete() {
    if (!state.pendingDeleteId) return;
    Store.delete(state.pendingDeleteId);
    el.confirmDeleteModal.classList.remove('active');
    state.pendingDeleteId = null;
    showToast(adminI18n[state.lang].deletedToast);
    refreshData();
  }

  function executeResetDefaults() {
    Store.resetToDefault();
    el.confirmResetModal.classList.remove('active');
    showToast(adminI18n[state.lang].resetToast);
    resetForm();
    refreshData();
    switchTab('list');
  }

  // ==========================================================================
  // Statistics & Code Preview
  // ==========================================================================
  function refreshData() {
    const all = Store.getAll();
    const customCount = all.filter(r => r.isCustom).length;
    const cashonlyCount = all.filter(r => r.payment && r.payment.isCashOnly).length;
    const cashlessCount = all.length - cashonlyCount;

    el.statTotalCount.textContent = all.length;
    el.statCustomCount.textContent = customCount;
    el.statCashonlyCount.textContent = cashonlyCount;
    el.statCashlessCount.textContent = cashlessCount;
    el.tabListBadge.textContent = all.length;

    renderManageTable();
    refreshCodePreview();
  }

  function refreshCodePreview() {
    el.dataJsCodePreview.textContent = Store.generateDataJsCode();
  }

  // ==========================================================================
  // Backup & Import
  // ==========================================================================
  function downloadJsonBackup() {
    const jsonStr = Store.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unimap-restaurants-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('JSONファイルをダウンロードしました！📥');
  }

  function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const result = Store.importJSON(event.target.result);
      if (result.success) {
        showToast(adminI18n[state.lang].importedToast);
        refreshData();
        switchTab('list');
      } else {
        showToast(adminI18n[state.lang].invalidImportToast);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
  }

  function copyDataJsCode() {
    const code = Store.generateDataJsCode();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        showToast(adminI18n[state.lang].copiedToast);
      }).catch(() => {
        fallbackCopy(code);
      });
    } else {
      fallbackCopy(code);
    }
  }

  function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(adminI18n[state.lang].copiedToast);
    } catch (err) {
      showToast('コピーできませんでした');
    }
    document.body.removeChild(textArea);
  }

  // ==========================================================================
  // Language & UI Update
  // ==========================================================================
  function setAdminLang(lang) {
    if (!lang) return;
    state.lang = lang;
    localStorage.setItem('unimap_lang', lang);
    updateLanguage();
  }

  // Expose setAdminLang globally
  if (typeof window !== 'undefined') {
    window.setAdminLang = setAdminLang;
  }

  function updateLanguage() {
    const t = adminI18n[state.lang] || adminI18n.ja;
    document.documentElement.lang = state.lang;

    document.querySelectorAll('.admin-nav .lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === state.lang);
    });

    el.adminHeaderBadge.textContent = t.headerBadge;
    el.labelBackHome.textContent = t.backHome;
    el.statsHeaderTitle.textContent = t.statsTitle;
    el.statsHeaderSubtitle.textContent = t.statsSubtitle;

    el.statLabelTotal.textContent = t.statTotal;
    el.statLabelCustom.textContent = t.statCustom;
    el.statLabelCashless.textContent = t.statCashless;
    el.statLabelCashonly.textContent = t.statCashonly;

    el.tabLabelForm.textContent = t.tabForm;
    el.tabLabelList.textContent = t.tabList;
    el.tabLabelBackup.textContent = t.tabBackup;

    el.formTitleText.textContent = state.editingId ? t.formTitleEdit : t.formTitleNew;
    el.formSubText.textContent = state.editingId ? t.formSubEdit : t.formSubNew;
    el.editingBadgeText.textContent = t.editingBadge;
    el.btnCancelEdit.textContent = t.btnCancelEdit;
    el.labelClearForm.textContent = t.clearForm;
    el.labelSubmitForm.textContent = state.editingId ? t.submitEdit : t.submitNew;

    el.labelLivePreview.textContent = t.livePreviewTitle;
    el.labelPreviewNotice.textContent = t.previewNotice;

    el.manageSearchInput.placeholder = t.searchPlaceholder;
    el.labelQuickAddNew.textContent = t.formTitleNew;

    renderPresets();
    renderManageTable();
    updateLivePreview();
  }

  // ==========================================================================
  // Toast Helper
  // ==========================================================================
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    el.adminToastMsg.textContent = msg;
    el.adminToast.classList.add('show');
    toastTimer = setTimeout(() => {
      el.adminToast.classList.remove('show');
    }, 2800);
  }

  // Boot
  document.addEventListener('DOMContentLoaded', init);

})();
