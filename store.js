// unimap - Central Data Store & Management Layer
// Handles restaurant CRUD, LocalStorage persistence, presets, and export/import.

(function (window) {
  'use strict';

  const STORAGE_KEY = 'unimap_restaurants_v2';
  const BACKUP_STORAGE_KEY = 'unimap_restaurants_backup_v2';

  // High quality Unsplash curated presets for Beppu eateries
  const PRESET_IMAGES = [
    {
      id: 'organic-cafe',
      labelJa: 'オーガニックカフェ・サラダ',
      labelEn: 'Organic Cafe & Salad',
      url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'curry-spice',
      labelJa: 'スパイスカレー・ハラール料理',
      labelEn: 'Spiced Curry & Halal Kitchen',
      url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'onsen-steam',
      labelJa: '地獄蒸し・和風蒸し野菜',
      labelEn: 'Onsen Steam & Fresh Veggies',
      url: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'ramen-noodles',
      labelJa: 'ラーメン・麺類',
      labelEn: 'Japanese Ramen & Noodles',
      url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'italian-pizza',
      labelJa: 'ピザ・パスタ・イタリアン',
      labelEn: 'Pizza, Pasta & Italian',
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'craft-beer-bar',
      labelJa: 'バー・クラフトビール・バル',
      labelEn: 'Craft Beer Bar & Pub Food',
      url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'asian-ethnic',
      labelJa: 'エスニック・アジアン・フォー',
      labelEn: 'Asian Ethnic & Pho',
      url: 'https://images.unsplash.com/photo-1569058242252-623df46b5025?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'japanese-tea-sweets',
      labelJa: '和カフェ・抹茶・和菓子',
      labelEn: 'Japanese Tea Cafe & Sweets',
      url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'japanese-teishoku',
      labelJa: '定食・日本の家庭料理',
      labelEn: 'Japanese Set Meal (Teishoku)',
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'bakery-cafe',
      labelJa: 'ベーカリー・パン・サンドイッチ',
      labelEn: 'Bakery, Bread & Sandwiches',
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'yakitori-izakaya',
      labelJa: '焼き鳥・大衆居酒屋',
      labelEn: 'Yakitori & Japanese Izakaya',
      url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'sushi-seafood',
      labelJa: '寿司・海鮮丼・魚料理',
      labelEn: 'Sushi & Fresh Seafood',
      url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80'
    }
  ];

  // Standard Areas in Beppu
  const PRESET_AREAS = [
    { id: 'beppu-station', nameJa: '別府駅周辺 (Beppu Station)', nameEn: 'Beppu Station Area', nameKo: '벳푸역 주변 (別府駅)', nameZh: '别府站周边 (別府駅)' },
    { id: 'kamegawa', nameJa: '亀川・APU周辺 (Kamegawa)', nameEn: 'Kamegawa / Near APU', nameKo: '가메가와 / APU 통학로 (亀川)', nameZh: '龟川 / APU通学路 (亀川)' },
    { id: 'kannawa', nameJa: '鉄輪温泉 (Kannawa)', nameEn: 'Kannawa Onsen', nameKo: '간나와 온천 (鉄輪)', nameZh: '铁轮温泉街 (鉄輪)' },
    { id: 'mochigahama', nameJa: '餅ヶ浜・石垣 (Mochigahama)', nameEn: 'Mochigahama / Ishigaki', nameKo: '모치가하마·이시가키 (餅ヶ浜・石垣)', nameZh: '饼之滨・石垣 (餅ヶ浜・石垣)' },
    { id: 'other', nameJa: 'その他の別府市内 (Other Beppu)', nameEn: 'Other Area in Beppu', nameKo: '기타 벳푸 시내', nameZh: '别府其他区域' }
  ];

  // Standard Payment Brands
  const COMMON_BRANDS = [
    'Visa', 'Mastercard', 'JCB', 'American Express',
    'PayPay', 'Suica / Nimoca / Sugoca', 'Rakuten Pay', 'd-Barai', 'LINE Pay',
    'iD', 'QUICPay', 'Cash'
  ];

  // Store Object
  const UnimapStore = {
    PRESET_IMAGES,
    PRESET_AREAS,
    COMMON_BRANDS,

    /**
     * Escape HTML special characters to prevent XSS
     */
    escapeHtml: function (str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    /**
     * Get default restaurant list from window.UNIMAP_DATA
     */
    getDefaultRestaurants: function () {
      const dataObj = window.UNIMAP_DATA;
      if (dataObj && Array.isArray(dataObj.restaurants)) {
        return JSON.parse(JSON.stringify(dataObj.restaurants)).map(item => ({
          ...item,
          isCustom: false
        }));
      }
      return [];
    },

    /**
     * Load all restaurants from LocalStorage or initialize with defaults
     */
    getAll: function () {
      const defaults = this.getDefaultRestaurants();
      try {
        let stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          // Migrate any custom restaurants from v1
          const oldV1 = localStorage.getItem('unimap_restaurants_v1');
          if (oldV1) {
            try {
              const oldParsed = JSON.parse(oldV1);
              const customOnly = (Array.isArray(oldParsed) ? oldParsed : []).filter(item => item.isCustom);
              const initialV2 = [...defaults, ...customOnly];
              this.saveAll(initialV2);
              return initialV2;
            } catch (e) {
              console.warn('Migration from v1 failed:', e);
            }
          }
          this.saveAll(defaults);
          return defaults;
        }
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Automatically merge any newly added defaults while preserving custom stores
            // AND ensure defaults have latest language fields (ko/zh)
            const defaultsMap = new Map(defaults.map(d => [d.id, d]));
            const updated = parsed.map(item => {
              if (!item.isCustom && defaultsMap.has(item.id)) {
                const def = defaultsMap.get(item.id);
                return {
                  ...def,
                  ...item,
                  nameKo: def.nameKo,
                  nameZh: def.nameZh,
                  genreKo: def.genreKo,
                  genreZh: def.genreZh,
                  recommendedDishKo: def.recommendedDishKo,
                  recommendedDishZh: def.recommendedDishZh,
                  descriptionKo: def.descriptionKo,
                  descriptionZh: def.descriptionZh,
                  areaNameKo: def.areaNameKo,
                  areaNameZh: def.areaNameZh,
                  dietaryNotesKo: def.dietaryNotesKo,
                  dietaryNotesZh: def.dietaryNotesZh,
                  payment: {
                    ...def.payment,
                    ...item.payment,
                    noteKo: def.payment && def.payment.noteKo,
                    noteZh: def.payment && def.payment.noteZh
                  }
                };
              }
              return item;
            });
            const storedIds = new Set(updated.map(r => r.id));
            const missingDefaults = defaults.filter(d => !storedIds.has(d.id));
            const finalList = missingDefaults.length > 0 ? [...updated, ...missingDefaults] : updated;
            this.saveAll(finalList);
            return finalList;
          }
        }
      } catch (err) {
        console.warn('Failed to parse stored restaurants, falling back to defaults:', err);
      }

      // Initialize with defaults
      this.saveAll(defaults);
      return defaults;
    },

    /**
     * Save full list to LocalStorage
     */
    saveAll: function (list) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return true;
      } catch (err) {
        console.error('LocalStorage save error:', err);
        return false;
      }
    },

    /**
     * Find single restaurant by id
     */
    getById: function (id) {
      const all = this.getAll();
      return all.find(r => r.id === id) || null;
    },

    /**
     * Add a new restaurant
     */
    add: function (data) {
      const all = this.getAll();

      // Generate unique ID if not provided
      let id = (data.id || '').trim();
      if (!id) {
        const slug = (data.nameEn || data.nameJa || 'store')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        id = `${slug || 'custom'}-${Date.now().toString(36)}`;
      }

      // Ensure ID uniqueness
      let uniqueId = id;
      let counter = 1;
      while (all.some(r => r.id === uniqueId)) {
        uniqueId = `${id}-${counter++}`;
      }

      const newRecord = {
        ...data,
        id: uniqueId,
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      // Add to beginning of the list so it is immediately visible
      all.unshift(newRecord);
      this.saveAll(all);
      return newRecord;
    },

    /**
     * Update existing restaurant
     */
    update: function (id, data) {
      const all = this.getAll();
      const index = all.findIndex(r => r.id === id);
      if (index === -1) return null;

      const existing = all[index];
      const updated = {
        ...existing,
        ...data,
        id: existing.id, // preserve ID
        isCustom: existing.isCustom !== undefined ? existing.isCustom : true,
        updatedAt: new Date().toISOString()
      };

      all[index] = updated;
      this.saveAll(all);
      return updated;
    },

    /**
     * Delete a restaurant by id
     */
    delete: function (id) {
      const all = this.getAll();
      const filtered = all.filter(r => r.id !== id);
      if (filtered.length === all.length) return false;

      this.saveAll(filtered);
      return true;
    },

    /**
     * Reset to the default original 8 restaurants
     */
    resetToDefault: function () {
      const defaults = this.getDefaultRestaurants();
      this.saveAll(defaults);
      return defaults;
    },

    /**
     * Export all restaurants as formatted JSON string
     */
    exportJSON: function () {
      const all = this.getAll();
      return JSON.stringify(all, null, 2);
    },

    /**
     * Import restaurants from JSON string or Array
     */
    importJSON: function (jsonOrArray) {
      try {
        const data = typeof jsonOrArray === 'string' ? JSON.parse(jsonOrArray) : jsonOrArray;
        if (!Array.isArray(data)) {
          throw new Error('Imported data must be an array of restaurants');
        }

        // Validate basic fields
        const validated = data.map((item, index) => {
          if (!item.nameJa && !item.nameEn) {
            throw new Error(`Item at #${index + 1} is missing restaurant name`);
          }
          return {
            id: item.id || `imported-${Date.now().toString(36)}-${index}`,
            nameJa: item.nameJa || item.nameEn,
            nameEn: item.nameEn || item.nameJa,
            areaId: item.areaId || 'beppu-station',
            areaNameJa: item.areaNameJa || '別府駅周辺',
            areaNameEn: item.areaNameEn || 'Beppu Station Area',
            genreJa: item.genreJa || '和食・カフェ',
            genreEn: item.genreEn || 'Dining & Cafe',
            priceRange: item.priceRange || '¥1,000〜¥1,500',
            image: item.image || PRESET_IMAGES[0].url,
            dietary: Array.isArray(item.dietary) ? item.dietary : [],
            dietaryNotesJa: item.dietaryNotesJa || '',
            dietaryNotesEn: item.dietaryNotesEn || '',
            payment: {
              isCashOnly: !!(item.payment && item.payment.isCashOnly),
              methods: item.payment && Array.isArray(item.payment.methods) ? item.payment.methods : ['cash'],
              brands: item.payment && Array.isArray(item.payment.brands) ? item.payment.brands : ['Cash'],
              noteJa: (item.payment && item.payment.noteJa) || '',
              noteEn: (item.payment && item.payment.noteEn) || ''
            },
            englishMenu: !!item.englishMenu,
            englishStaff: !!item.englishStaff,
            studentDiscount: !!item.studentDiscount,
            wifi: !!item.wifi,
            takeout: !!item.takeout,
            recommendedDishJa: item.recommendedDishJa || '',
            recommendedDishEn: item.recommendedDishEn || '',
            hoursJa: item.hoursJa || '11:00 - 20:00',
            hoursEn: item.hoursEn || '11:00 - 20:00',
            holidayJa: item.holidayJa || '不定休',
            holidayEn: item.holidayEn || 'Irregular holidays',
            addressJa: item.addressJa || '大分県別府市',
            addressEn: item.addressEn || 'Beppu-shi, Oita',
            googleMapsUrl: item.googleMapsUrl || 'https://maps.google.com/?q=Beppu+Station',
            descriptionJa: item.descriptionJa || '',
            descriptionEn: item.descriptionEn || '',
            isCustom: item.isCustom !== undefined ? item.isCustom : true
          };
        });

        this.saveAll(validated);
        return { success: true, count: validated.length };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    /**
     * Generate code ready to be pasted into data.js
     */
    generateDataJsCode: function () {
      const all = this.getAll().map(item => {
        const clean = { ...item };
        delete clean.isCustom;
        delete clean.createdAt;
        delete clean.updatedAt;
        return clean;
      });

      return `const restaurants = ${JSON.stringify(all, null, 2)};\n\nif (typeof window !== 'undefined') {\n  window.UNIMAP_DATA = { i18n, restaurants, restaurantI18n };\n}\n\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = { i18n, restaurants, restaurantI18n };\n}\n`;
    }
  };

  // Expose globally
  window.UnimapStore = UnimapStore;

})(typeof window !== 'undefined' ? window : this);
