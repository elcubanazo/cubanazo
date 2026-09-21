const CLOUDINARY_CLOUD_NAME = "vq0diauv";
const DEFAULT_BACKEND_HOST = "https://backend-szp7.onrender.com";

function getBackendHost() {
  if (typeof BACKEND === 'string' && BACKEND.trim()) {
    return BACKEND.replace(/\/$/, '');
  }

  return DEFAULT_BACKEND_HOST;
}

const API_BASE = getBackendHost();

const UBICACION_STORAGE_KEY = 'cubanazo_ubicacion';
const UBICACIONES_DISPONIBLES = [
  { id: 'ubicacionA', nombre: 'Matanzas', whatsapp: '53123456' },
  { id: 'ubicacionB', nombre: 'Güines Mayabeque', whatsapp: '53654321' }
];

function getSelectedUbicacion() {
  try {
    return localStorage.getItem(UBICACION_STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

function isUbicacionValida(valor) {
  return UBICACIONES_DISPONIBLES.some(u => u.id === valor);
}

function nombreUbicacion(valor) {
  const encontrada = UBICACIONES_DISPONIBLES.find(u => u.id === valor);
  return encontrada ? encontrada.nombre : valor;
}

function inyectarEstiloUbicacionUnaVez() {
  if (document.getElementById('ubicacion-selector-style')) return;
  const style = document.createElement('style');
  style.id = 'ubicacion-selector-style';
  style.textContent = `
    .ubicacion-selector-overlay{position:fixed;inset:0;background:rgba(15,17,17,0.62);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;touch-action:none;}
    .ubicacion-selector-modal{background:var(--blanco,#fff);border:1px solid var(--gris-claro,#eaeDED);border-radius:var(--borde-radius,8px);box-shadow:var(--sombra-hover,0 8px 20px rgba(0,0,0,.1));padding:32px 28px;max-width:380px;width:100%;text-align:center;font-family:'Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,sans-serif;}
    .ubicacion-selector-title{color:var(--negro,#0f1111);font-size:20px;line-height:1.25;margin:0 0 8px;font-weight:700;}
    .ubicacion-selector-subtitle{color:var(--gris-oscuro,#565959);font-size:13px;line-height:1.4;margin:0 0 20px;}
    .ubicacion-selector-options{display:flex;flex-direction:column;gap:10px;}
    .ubicacion-selector-btn{display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;border:1px solid var(--gris-claro,#eaeDED);background:var(--blanco,#fff);color:var(--negro,#0f1111);border-radius:var(--borde-radius,8px);font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;transition:var(--transicion,all .25s ease);}
    .ubicacion-selector-btn i{color:var(--color-principal,#b3122a);}
    .ubicacion-selector-btn:hover{background:var(--azul-claro,#dce7f7);border-color:var(--color-accent-primary,#1d4e9b);color:var(--azul-oscuro,#14315c);}
    .ubicacion-selector-btn.actual{background:var(--color-accent-primary,#1d4e9b);border-color:var(--color-accent-primary,#1d4e9b);color:var(--blanco,#fff);}
    .ubicacion-selector-btn.actual i{color:var(--blanco,#fff);}
    body.ubicacion-selector-open{overflow:hidden;}
  `;
  document.head.appendChild(style);
}

function actualizarUbicacionEnHeader(ubicacion) {
  inyectarEstiloUbicacionUnaVez();
  const locationCity = document.getElementById('location-city');
  if (locationCity) locationCity.textContent = nombreUbicacion(ubicacion);
  actualizarTelefonoEnFooter(ubicacion);
}

function actualizarTelefonoEnFooter(ubicacion) {
  const footerPhone = document.getElementById('footer-phone');
  const seleccionada = UBICACIONES_DISPONIBLES.find(item => item.id === ubicacion);
  if (!footerPhone || !seleccionada?.whatsapp) return;

  const telefono = String(seleccionada.whatsapp);
  footerPhone.textContent = telefono.startsWith('53')
    ? `+53 ${telefono.slice(2)}`
    : `+53 ${telefono}`;
}

function recargarDesdeInicioConNuevaUbicacion() {
  if (typeof goToHome === 'function') {
    goToHome();
    window.location.reload();
    return;
  }

  const homeUrl = new URL(window.location.href);
  homeUrl.pathname = homeUrl.pathname.replace(/\/p\/[^/]+\/?$/, '/') || '/';
  homeUrl.search = '';
  homeUrl.hash = '#';
  window.location.replace(homeUrl.href);
}

function abrirSelectorUbicacion(esCambioManual) {
  if (document.getElementById('ubicacion-selector-overlay')) return null;
  inyectarEstiloUbicacionUnaVez();

  const actual = getSelectedUbicacion();

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'ubicacion-selector-overlay';
    overlay.className = 'ubicacion-selector-overlay';
    document.body.classList.add('ubicacion-selector-open');
    overlay.innerHTML = `
      <div class="ubicacion-selector-modal">
        <h2 class="ubicacion-selector-title">¿Desde qué ubicación quieres comprar?</h2>
        <p class="ubicacion-selector-subtitle">Elige tu sucursal para ver el catálogo y los precios correctos.</p>
        <div class="ubicacion-selector-options">
          ${UBICACIONES_DISPONIBLES.map(u => `<button class="ubicacion-selector-btn${u.id === actual ? ' actual' : ''}" data-ubicacion="${u.id}"><i class="fas fa-map-marker-alt"></i><span>${u.nombre}</span></button>`).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.ubicacion-selector-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const seleccion = btn.getAttribute('data-ubicacion');
        try { localStorage.setItem(UBICACION_STORAGE_KEY, seleccion); } catch (e) {}
        overlay.remove();
        document.body.classList.remove('ubicacion-selector-open');
        actualizarUbicacionEnHeader(seleccion);
        if (esCambioManual) {
          recargarDesdeInicioConNuevaUbicacion();
        } else {
          if (typeof switchCartToLocation === 'function') switchCartToLocation();
          resolve(seleccion);
        }
      });
    });
  });
}

let ubicacionReadyPromise = null;

function ensureUbicacionSeleccionada() {
  const actual = getSelectedUbicacion();
  if (isUbicacionValida(actual)) {
    if (document.body) actualizarUbicacionEnHeader(actual);
    else document.addEventListener('DOMContentLoaded', () => actualizarUbicacionEnHeader(actual));
    return Promise.resolve(actual);
  }
  if (ubicacionReadyPromise) return ubicacionReadyPromise;

  ubicacionReadyPromise = new Promise((resolve) => {
    const mostrar = () => abrirSelectorUbicacion(false).then(resolve);
    if (document.body) {
      mostrar();
    } else {
      document.addEventListener('DOMContentLoaded', mostrar);
    }
  });

  return ubicacionReadyPromise;
}

function appendUbicacionParam(url, ubicacion) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}ubicacion=${encodeURIComponent(ubicacion)}`;
}

// -----------------------------
// CONFIGURACIÓN DE CLOUDINARY
// -----------------------------
const CLD_IMAGE_SIZES = {
  thumb: { w: 320 },
  detail: { w: 1100 }
};

function buildCloudinaryTransform(preset) {
  const size = preset ? CLD_IMAGE_SIZES[preset] : null;
  let transform = 'f_webp,q_auto';
  if (size && size.w) {
    transform += `,c_limit,w_${size.w}`;
  }
  return transform;
}

function getProductImageUrl(filename, preset = null) {
  if (!filename) return "Images/product-placeholder.svg";
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${buildCloudinaryTransform(preset)}/products/${filename}`;
}

function getPackImageUrl(filename, preset = null) {
  if (!filename) return "Images/pack-placeholder.svg";
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${buildCloudinaryTransform(preset)}/packs/${filename}`;
}

// -----------------------------
// HELPERS GENERALES MEDIANTE BACKEND PROXY
// -----------------------------
async function fetchBackendJson(endpoint, options = {}) {
  let finalEndpoint = endpoint;
  if (
    endpoint === '/api/bootstrap' ||
    endpoint === '/api/products' ||
    endpoint === '/api/packs' ||
    endpoint === '/api/notification-banner' ||
    endpoint === '/api/mensajes'
  ) {
    const ubicacion = await ensureUbicacionSeleccionada();
    finalEndpoint = appendUbicacionParam(endpoint, ubicacion);
  }
  const url = finalEndpoint.startsWith('http') ? finalEndpoint : `${API_BASE}${finalEndpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error en backend ${response.status}: ${text}`);
  }

  const data = await response.json();
  if (data && data.success === false) {
    throw new Error(data.message || `Error en backend: ${endpoint}`);
  }

  return data;
}

let bootstrapPromise = null;
const bootstrapConsumedKeys = new Set();

function requestBootstrapOnce() {
  if (!bootstrapPromise) {
    bootstrapPromise = fetchBackendJson('/api/bootstrap').then((boot) => {
      window.__CUBANAZO_BOOTSTRAP_RATINGS__ = boot && boot.ratings ? boot.ratings : {};
      return boot;
    }).catch((err) => {
      bootstrapPromise = null; // permitir reintento si falló la red
      throw err;
    });
    window.__CUBANAZO_BOOTSTRAP_PROMISE__ = bootstrapPromise;
  }
  return bootstrapPromise;
}

async function fromBootstrapOrEndpoint(key, endpoint) {
  if (!bootstrapConsumedKeys.has(key)) {
    bootstrapConsumedKeys.add(key);
    try {
      const boot = await requestBootstrapOnce();
      return boot;
    } catch (err) {
      console.warn(`[firebase-config] Bootstrap falló, usando ${endpoint} como respaldo:`, err);
    }
  }
  return fetchBackendJson(endpoint);
}

// -----------------------------
// HELPERS ESPECÍFICOS (mismo "shape" que antes devolvía cada .json)
// -----------------------------
async function fetchProductsFromFirebase() {
  const data = await fromBootstrapOrEndpoint('products', '/api/products');
  return { products: Array.isArray(data.products) ? data.products : [] };
}
async function fetchPacksFromFirebase() {
  const data = await fromBootstrapOrEndpoint('packs', '/api/packs');
  return { packs: Array.isArray(data.packs) ? data.packs : [] };
}
async function fetchAfiliadosFromFirebase() {
  const data = await fetchBackendJson('/api/afiliados');
  return { afiliados: Array.isArray(data.afiliados) ? data.afiliados : [] };
}
async function fetchNotificationBannerFromFirebase() {
  const data = await fromBootstrapOrEndpoint('banner', '/api/notification-banner');
  return data.banner || null;
}
async function fetchMensajesFromFirebase() {
  const data = await fromBootstrapOrEndpoint('mensajes', '/api/mensajes');
  return Array.isArray(data.mensajes) ? data.mensajes : [];
}
async function fetchEventoFromFirebase() {
  const data = await fromBootstrapOrEndpoint('evento', '/api/evento');
  return data.evento || null;
}
async function fetchInfoFromFirebase() {
  const data = await fromBootstrapOrEndpoint('info', '/api/info');
  return Array.isArray(data.info) ? data.info : [];
}
async function fetchPayFromFirebase() {
  const data = await fromBootstrapOrEndpoint('pay', '/api/pay');
  return data.pay || null;
}

// -----------------------------
// ESCUCHA EN TIEMPO REAL
// -----------------------------
const WATCH_POLL_INTERVAL_MS = 240000;

const watchPathFetchers = {
  products: async () => (await fetchProductsFromFirebase()).products,
  packs: async () => (await fetchPacksFromFirebase()).packs,
  notificationBanner: fetchNotificationBannerFromFirebase,
  afiliados: async () => (await fetchAfiliadosFromFirebase()).afiliados,
  mensajes: fetchMensajesFromFirebase,
  evento: fetchEventoFromFirebase,
  info: fetchInfoFromFirebase,
  pay: fetchPayFromFirebase
};

function watchFirebasePath(path, callback) {
  const fetcher = watchPathFetchers[path];
  if (!fetcher) {
    console.warn('watchFirebasePath: path no soportado:', path);
    return () => {};
  }

  let stopped = false;
  let timer = null;
  let lastSerialized = null;
  let primed = false;

  const tick = async () => {
    if (stopped || document.hidden) {
      scheduleNext();
      return;
    }
    try {
      const value = await fetcher();
      const serialized = JSON.stringify(value);
      if (!primed) {
        primed = true;
        lastSerialized = serialized;
      } else if (serialized !== lastSerialized) {
        lastSerialized = serialized;
        callback(value);
      }
    } catch (e) {
      console.warn('watchFirebasePath poll error', path, e);
    }
    scheduleNext();
  };

  const scheduleNext = () => {
    if (stopped) return;
    timer = setTimeout(tick, WATCH_POLL_INTERVAL_MS);
  };

  const onVisibilityChange = () => {
    if (!document.hidden && !stopped) {
      clearTimeout(timer);
      tick();
    }
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  tick();

  return () => {
    stopped = true;
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

function getCartStorageKey(ubicacion = getSelectedUbicacion()) {
  return `cart_${isUbicacionValida(ubicacion) ? ubicacion : 'default'}`;
}