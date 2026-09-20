const DYNAMIC_CONFIG = {
  newProductBoostHours: 48,
  newProductFadeoutHours: 72,
  recentProductsCount: 9,
  normalOrderPercent: 70,
  randomShufflePercent: 30,
  badgeNewToday: 1,
  badgeNewThisWeek: 7,
  badgeUpdated: 14,
  layoutVariations: true,
  massonryEnabled: false,
};

function getCurrentTimestamp() {
  return Date.now();
}

function daysBetween(date1, date2) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((date2 - date1) / msPerDay);
}

function parseFlexibleDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    let d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const y = Number(match[1]);
      const mo = Number(match[2]);
      const day = Number(match[3]);
      const h = Number(match[4]);
      const mi = Number(match[5]);
      const s = Number(match[6]);
      d = new Date(y, mo - 1, day, h, mi, s);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }
  return null;
}

function getProductCreatedDateRaw(product) {
  return parseFlexibleDate(product.fecha_creacion)
    || parseFlexibleDate(product.created_at)
    || parseFlexibleDate(product.fecha_actualizacion)
    || parseFlexibleDate(product.modified_at)
    || null;
}

function getProductCreatedDate(product) {
  const real = getProductCreatedDateRaw(product);
  if (real) return real;

  if (product.id) {
    const match = String(product.id).match(/prod_(\d+)_/);
    if (match && match[1] && match[1].length >= 10) {
      const timestamp = parseInt(match[1]);
      if (!isNaN(timestamp) && timestamp > 0) {
        return new Date(timestamp);
      }
    }
  }

  return null;
}

function getProductModifiedDate(product) {
  return parseFlexibleDate(product.fecha_actualizacion) || parseFlexibleDate(product.modified_at);
}

function calculateProductScore(product, currentTime = getCurrentTimestamp()) {
  let score = 0;

  if (!product.disponibilidad) return -1000;

  if (product.mas_vendido) score += 50;

  if (product.oferta && product.descuento > 0) score += 20;

  const createdDate = getProductCreatedDate(product);
  if (createdDate) {
    const hoursOld = (currentTime - createdDate.getTime()) / (1000 * 60 * 60);
    if (hoursOld >= 0 && hoursOld <= DYNAMIC_CONFIG.newProductBoostHours) {
      const boostFactor = Math.max(0, 1 - (hoursOld / DYNAMIC_CONFIG.newProductFadeoutHours));
      score += 100 * boostFactor;
    }
  }

  const idStr = String(product.id || '');
  const seed = idStr.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const randomBoost = (Math.abs(seed) % 5) - 2.5;
  score += randomBoost;

  return score;
}

function sortProductsDynamic(productsToSort, currentTime = getCurrentTimestamp()) {
  if (!productsToSort || productsToSort.length === 0) return [];

  const sorted = [...productsToSort];

  const scores = sorted.map(p => ({
    product: p,
    score: calculateProductScore(p, currentTime)
  }));

  scores.sort((a, b) => b.score - a.score);

  const randomPercent = Math.random() * 100;

  if (randomPercent < DYNAMIC_CONFIG.randomShufflePercent) {
    const shuffleCount = Math.min(15, Math.floor(scores.length * 0.15));
    const toShuffle = scores.splice(0, shuffleCount);

    for (let i = toShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [toShuffle[i], toShuffle[j]] = [toShuffle[j], toShuffle[i]];
    }

    scores.unshift(...toShuffle);
  }

  return scores.map(s => s.product);
}

function sortBestSellersDynamic(productsToSort, currentTime = getCurrentTimestamp()) {
  if (!productsToSort || productsToSort.length === 0) return [];

  const sorted = [...productsToSort];

  const scores = sorted.map(p => ({
    product: p,
    score: calculateProductScore(p, currentTime) - 50
  }));

  scores.sort((a, b) => b.score - a.score);

  const randomPercent = Math.random() * 100;

  if (randomPercent < 15) {
    const shuffleCount = Math.min(5, Math.floor(scores.length * 0.08));
    const toShuffle = scores.splice(0, shuffleCount);

    for (let i = toShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [toShuffle[i], toShuffle[j]] = [toShuffle[j], toShuffle[i]];
    }

    scores.unshift(...toShuffle);
  }

  return scores.map(s => s.product);
}

function getProductBadges(product, currentTime = getCurrentTimestamp()) {
  const badges = [];

  const createdDate = getProductCreatedDateRaw(product);
  if (createdDate) {
    const daysOld = daysBetween(createdDate, new Date(currentTime));
    if (daysOld >= 0 && daysOld <= DYNAMIC_CONFIG.badgeNewToday) {
      badges.push({
        type: 'new-today',
        label: 'Nuevo hoy',
        icon: 'fa-star',
        class: 'badge-new-today',
        expiresIn: DYNAMIC_CONFIG.badgeNewToday - daysOld
      });
    } else if (daysOld >= 0 && daysOld <= DYNAMIC_CONFIG.badgeNewThisWeek) {
      badges.push({
        type: 'new-week',
        label: 'Nuevo esta semana',
        icon: 'fa-sparkles',
        class: 'badge-new-week',
        expiresIn: DYNAMIC_CONFIG.badgeNewThisWeek - daysOld
      });
    }
  }

  const modifiedDate = getProductModifiedDate(product);
  if (modifiedDate) {
    const daysModified = daysBetween(modifiedDate, new Date(currentTime));
    if (daysModified >= 0 && daysModified <= DYNAMIC_CONFIG.badgeUpdated) {
      badges.push({
        type: 'updated',
        label: 'Actualizado',
        icon: 'fa-sync-alt',
        class: 'badge-updated',
        expiresIn: DYNAMIC_CONFIG.badgeUpdated - daysModified
      });
    }
  }

  return badges;
}

function getRecentProducts(productsArray, count = DYNAMIC_CONFIG.recentProductsCount, currentTime = getCurrentTimestamp()) {
  if (!productsArray || productsArray.length === 0) return [];

  const available = productsArray.filter(p => p.disponibilidad !== false);

  const withDates = available
    .map(p => ({ product: p, refDate: getProductCreatedDateRaw(p) }))
    .filter(entry => entry.refDate !== null);

  const recent = withDates.filter(entry => {
    const daysOld = daysBetween(entry.refDate, new Date(currentTime));
    return daysOld >= 0 && daysOld <= 7;
  });

  recent.sort((a, b) => b.refDate.getTime() - a.refDate.getTime());

  return recent.slice(0, count).map(entry => entry.product);
}

function getDayLayoutVariation() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  if (dayOfWeek >= 4) {
    return 'compact';
  } else if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'spread';
  }

  return 'normal';
}

function applyDayLayoutVariation() {
  if (!DYNAMIC_CONFIG.layoutVariations) return;

  const container = document.getElementById('products-container');
  if (!container) return;

  const variation = getDayLayoutVariation();

  container.classList.remove('layout-normal', 'layout-compact', 'layout-spread');
  container.classList.add(`layout-${variation}`);
}

function animateElement(element, animationType = 'fade-in') {
  if (!element) return;

  element.classList.add(`animate-${animationType}`);

  setTimeout(() => {
    element.classList.remove(`animate-${animationType}`);
  }, 600);
}

function applyNewProductBorderAnimation(productElement) {
  if (!productElement) return;

  productElement.classList.add('new-product-pulse');

  setTimeout(() => {
    productElement.classList.remove('new-product-pulse');
  }, 2000);
}

function enrichProductsWithDynamicData(productsArray, currentTime = getCurrentTimestamp()) {
  if (!productsArray) return;

  productsArray.forEach(product => {
    product._dynamicScore = calculateProductScore(product, currentTime);
    product._dynamicBadges = getProductBadges(product, currentTime);
    const createdDate = getProductCreatedDate(product);
    product._createdDate = createdDate;
    product._daysOld = createdDate ? daysBetween(createdDate, new Date(currentTime)) : null;
  });
}

function applySortingToCategoryProducts(categoryProducts) {
  return sortProductsDynamic(categoryProducts);
}

function renderRecentProductsSection(productsArray) {
  const recentProducts = getRecentProducts(productsArray);

  if (recentProducts.length === 0) {
    return '';
  }

  const container = document.getElementById('products-container');
  if (!container) return '';

  const section = document.createElement('div');
  section.className = 'recent-products-section';
  section.setAttribute('data-section', 'recent-products');

  const header = document.createElement('div');
  header.className = 'recent-products-header';
  header.innerHTML = `
    <div class="recent-products-title-wrapper">
      <h3 class="recent-products-title">
        <i class="fas fa-clock"></i> Recién añadidos
      </h3>
      <p class="recent-products-subtitle">Descubre nuestros últimos productos</p>
    </div>
  `;
  section.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'recent-products-grid';

  recentProducts.forEach((product, index) => {
    const displayProduct = product.isGrouped
      ? product.variants[product.currentVariant]
      : product;

    const card = document.createElement('div');
    card.className = 'recent-product-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const isOnSale = displayProduct.oferta && displayProduct.descuento > 0;
    const basePrice = Number(displayProduct.precio) || 0;
    const discount = Number(displayProduct.descuento) || 0;
    const finalPrice = isOnSale
      ? (basePrice * (1 - discount / 100)).toFixed(2)
      : basePrice.toFixed(2);
    const mainImage =
      (displayProduct.imagenes && displayProduct.imagenes[0]) ||
      displayProduct.imagen ||
      '';

    card.innerHTML = `
      <div class="recent-product-image" 
           onclick="showProductDetail('${encodeURIComponent(displayProduct.nombre)}')">
        <img src="${getProductImageUrl(mainImage, 'thumb')}" 
             alt="${escapeAttr(displayProduct.nombre)}"
             loading="lazy"
             decoding="async">
        ${isOnSale ? `<span class="recent-product-badge-sale">-${Math.round(displayProduct.descuento)}%</span>` : ''}
      </div>
      <div class="recent-product-info">
        <h4 class="recent-product-title">${escapeHtml(displayProduct.nombre)}</h4>
        <p class="recent-product-price">${finalPrice} <img src="Images/Zelle.svg" alt="$" class="currency-icon price-xs"></p>
      </div>
    `;

    animateElement(card, 'fade-in');
    grid.appendChild(card);
  });

  section.appendChild(grid);

  const firstCategoryPanel = container.querySelector('.category-panel');
  if (firstCategoryPanel) {
    container.insertBefore(section, firstCategoryPanel);
  } else {
    container.insertBefore(section, container.firstChild);
  }

  return section;
}

function initDynamicSystem() {
  if (typeof products === 'undefined' || !Array.isArray(products)) {
    console.warn('[DynamicSystem] products no está disponible');
    return;
  }

  enrichProductsWithDynamicData(products);
  applyDayLayoutVariation();
}

function updateDynamicSystem() {
  if (typeof products === 'undefined') return;

  const currentTime = getCurrentTimestamp();

  enrichProductsWithDynamicData(products, currentTime);
  applyDayLayoutVariation();
}

window.CUBANAZO_DYNAMIC = {
  config: DYNAMIC_CONFIG,
  calculateProductScore,
  sortProductsDynamic,
  sortBestSellersDynamic,
  getProductBadges,
  getRecentProducts,
  enrichProductsWithDynamicData,
  renderRecentProductsSection,
  getDayLayoutVariation,
  applyDayLayoutVariation,
  initDynamicSystem,
  updateDynamicSystem,
};

console.log('[El Cubanazo Dynamic System] ✓ Cargado exitosamente');
