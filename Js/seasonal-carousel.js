/**
 * ============================================================
 *  CARRUSEL ESTACIONAL "ESTILO AMAZON" - El Cubanazo
 * ============================================================
 *  Reemplaza el carrusel de banners (3 imágenes) por un carrusel
 *  de tarjetas con mini productos seleccionados ALEATORIAMENTE
 *  desde la base de datos (products / Firebase vía API).
 *
 *  Cada tarjeta tiene:
 *   - Fondo personalizado con colores suaves / pasteles.
 *   - Título, subtítulo e icono "de temporada".
 *   - Grid de mini-cards de productos (imagen + nombre + precio).
 *   - Enlace "Ver más".
 *
 *  Los TEXTOS / FONDOS / ICONOS se editan directamente en:
 *      Json/seasonal-carousel.json
 *  (si el archivo no se puede leer, se usa el config por defecto
 *   definido en SEASONAL_CAROUSEL_DEFAULTS más abajo).
 *
 *  Compatibilidad con el carrusel existente de script.js:
 *   - Reutiliza .carousel-container / .carousel-wrapper.
 *   - Mantiene .carousel-slide, .carousel-indicator y los botones
 *     #carousel-prev / #carousel-next (misma lógica de autoplay).
 *   - Expone renderSeasonalCarousel() y refreshSeasonalCarousel()
 *     para que script.js las llame sin romper nada.
 * ============================================================
 */
(function () {
  "use strict";

  const CONFIG_URL = "Json/seasonal-carousel.json";

  const CATEGORIAS_VALIDAS = [
    "Cárnicos y Embutidos",
    "Lácteos",
    "Despensa",
    "Confitura",
    "Bebidas no alcohólicas",
    "Aseo y Belleza",
    "Aderezos",
    "Frutas",
    "Verduras",
    "Bebidas alcohólicas",
    "Utiles del Hogar",
    "Electrodomésticos",
    "Postres"
  ];

  const CATEGORIA_ALIASES = {
    "carnicos y embutidos": "Cárnicos y Embutidos",
    "carnicos y embutidos ": "Cárnicos y Embutidos",
    "lacteos": "Lácteos",
    "despensa": "Despensa",
    "confitura": "Confitura",
    "bebidas no alcoholicas": "Bebidas no alcohólicas",
    "bebidas no alcoholicas ": "Bebidas no alcohólicas",
    "aseo y belleza": "Aseo y Belleza",
    "aderezos": "Aderezos",
    "frutas": "Frutas",
    "verduras": "Verduras",
    "bebidas alcoholicas": "Bebidas alcohólicas",
    "utiles del hogar": "Utiles del Hogar",
    "utiles del hogar ": "Utiles del Hogar",
    "utiles del hogar": "Utiles del Hogar",
    "electrodomesticos": "Electrodomésticos",
    "postres": "Postres"
  };

  // Config por defecto (fallback si el JSON no carga).
  const SEASONAL_CAROUSEL_DEFAULTS = {
    cards: [
      {
        id: "verduras",
        kicker: "Temporada fresca",
        titulo: "Verduras del día",
        subtitulo: "Selección natural, colorida y lista para cocinar",
        icono: "fa-seedling",
        layout: "grid",
        gradiente: "linear-gradient(135deg, #EAF9EE 0%, #D9F1DE 52%, #F9F4D8 100%)",
        colorTexto: "#1F4D3B",
        colorAcento: "#2C7A52",
        items: 4,
        categoria: "Verduras",
        enlaceTexto: "Ver verduras"
      },
      {
        id: "bebidas",
        kicker: "Para refrescar",
        titulo: "Bebidas frescas",
        subtitulo: "Sabor y energía para cada momento del día",
        icono: "fa-wine-bottle",
        layout: "imagen",
        gradiente: "linear-gradient(135deg, #FFF7DE 0%, #FFE6B8 55%, #FEE9D5 100%)",
        colorTexto: "#7A4C17",
        colorAcento: "#D97A1D",
        items: 4,
        categoria: "Bebidas no alcohólicas",
        enlaceTexto: "Ver bebidas"
      },
      {
        id: "despensa",
        kicker: "Lo esencial",
        titulo: "Despensa con sabor",
        subtitulo: "Productos básicos para cocinar con identidad",
        icono: "fa-basket-shopping",
        layout: "grid",
        gradiente: "linear-gradient(135deg, #FFF7EE 0%, #F8E6D4 58%, #F4D9C9 100%)",
        colorTexto: "#734425",
        colorAcento: "#B56039",
        items: 4,
        categoria: "Despensa",
        enlaceTexto: "Explorar despensa"
      },
      {
        id: "lacteos",
        kicker: "Calidez en casa",
        titulo: "Lácteos esenciales",
        subtitulo: "Nutrición y sabor para los días más fríos",
        icono: "fa-cheese",
        layout: "imagen",
        gradiente: "linear-gradient(135deg, #EEF4FF 0%, #DDE9FD 56%, #EDE5FC 100%)",
        colorTexto: "#2A446A",
        colorAcento: "#496EBA",
        items: 4,
        categoria: "Lácteos",
        enlaceTexto: "Ver lácteos"
      },
      {
        id: "frutas",
        kicker: "Fresco todo el día",
        titulo: "Fruta de estación",
        subtitulo: "Dulce, jugosa y perfecta para cada receta",
        icono: "fa-apple-whole",
        layout: "grid",
        gradiente: "linear-gradient(135deg, #FFF1EA 0%, #FDD9C5 54%, #FEEBD7 100%)",
        colorTexto: "#7A3D21",
        colorAcento: "#D66F2B",
        items: 4,
        categoria: "Frutas",
        enlaceTexto: "Ver frutas"
      },
      {
        id: "postres",
        kicker: "Para consentirte",
        titulo: "Postres irresistibles",
        subtitulo: "Un toque dulce para compartir y disfrutar",
        icono: "fa-cookie-bite",
        layout: "imagen",
        gradiente: "linear-gradient(135deg, #FDF3F5 0%, #F7DBE6 56%, #FDEBED 100%)",
        colorTexto: "#6D2E3C",
        colorAcento: "#C8295D",
        items: 4,
        categoria: "Postres",
        enlaceTexto: "Ver postres"
      },
      {
        id: "carnicos",
        kicker: "Especiales del día",
        titulo: "Cárnicos y embutidos",
        subtitulo: "Calidad, sabor y tradición para cada mesa",
        icono: "fa-drumstick-bite",
        layout: "grid",
        gradiente: "linear-gradient(135deg, #FFF5F1 0%, #F7E0D8 55%, #F9F0E4 100%)",
        colorTexto: "#5B2D22",
        colorAcento: "#B65A3C",
        items: 4,
        categoria: "Cárnicos y Embutidos",
        enlaceTexto: "Ver cárnicos"
      },
      {
        id: "confituras",
        kicker: "Para disfrutar",
        titulo: "Confituras y sabores",
        subtitulo: "Acabados dulces para acompañar tu día",
        icono: "fa-jar",
        layout: "imagen",
        gradiente: "linear-gradient(135deg, #FFF8E8 0%, #F7E5C6 55%, #F9E6D4 100%)",
        colorTexto: "#6D4513",
        colorAcento: "#C7872A",
        items: 4,
        categoria: "Confitura",
        enlaceTexto: "Explorar confituras"
      },
      {
        id: "aseo",
        kicker: "Cuidado diario",
        titulo: "Aseo y belleza",
        subtitulo: "Essentials para sentirte bien siempre",
        icono: "fa-soap",
        layout: "grid",
        gradiente: "linear-gradient(135deg, #F4F8FF 0%, #E4EEF9 56%, #F8ECF4 100%)",
        colorTexto: "#334C6E",
        colorAcento: "#5B79B4",
        items: 4,
        categoria: "Aseo y Belleza",
        enlaceTexto: "Ver productos"
      },
      {
        id: "aderezos",
        kicker: "Sabor extra",
        titulo: "Aderezos y condimentos",
        subtitulo: "Tus recetas con ese toque especial",
        icono: "fa-mortar-pestle",
        layout: "imagen",
        gradiente: "linear-gradient(135deg, #F7F2E8 0%, #F1E3D1 58%, #FDE9D9 100%)",
        colorTexto: "#6B4726",
        colorAcento: "#B77B38",
        items: 4,
        categoria: "Aderezos",
        enlaceTexto: "Ver aderezos"
      },
      {
        id: "bebidas-alcoholicas",
        kicker: "Para compartir",
        titulo: "Bebidas alcohólicas",
        subtitulo: "Opciones para momentos especiales y relajados",
        icono: "fa-wine-glass",
        layout: "grid",
        gradiente: "linear-gradient(135deg, #F7F2FF 0%, #E9DDFA 52%, #F8EAE6 100%)",
        colorTexto: "#4B2E51",
        colorAcento: "#7B4A9C",
        items: 4,
        categoria: "Bebidas alcohólicas",
        enlaceTexto: "Ver opciones"
      },
      {
        id: "hogar",
        kicker: "Casa y comodidad",
        titulo: "Útiles del hogar",
        subtitulo: "Prácticos y funcionales para cada rincón",
        icono: "fa-broom",
        layout: "imagen",
        gradiente: "linear-gradient(135deg, #F4FBF5 0%, #E1F1E6 56%, #EAF6F0 100%)",
        colorTexto: "#2F5A45",
        colorAcento: "#4E9071",
        items: 4,
        categoria: "Utiles del Hogar",
        enlaceTexto: "Ver hogar"
      }
    ]
  };

  // Config "sincrónica" para el primer render (evita flicker).
  let loadedConfig = null;

  // Snapshot del pool de productos + selecciones por tarjeta.
  let lastProductsRef = null;
  let sessionProductPool = null;
  const selectionsCache = {};

  let configPromise = null;

  // ---------- Config ----------
  function getSyncConfig() {
    return loadedConfig || SEASONAL_CAROUSEL_DEFAULTS;
  }

  function loadSeasonalCarouselConfig() {
    if (configPromise) return configPromise;

    // Permite inyectar la config desde consola si se necesita.
    if (
      window.CUBANAZO_SEASONAL_CAROUSEL_CONFIG &&
      Array.isArray(window.CUBANAZO_SEASONAL_CAROUSEL_CONFIG.cards)
    ) {
      configPromise = Promise.resolve(window.CUBANAZO_SEASONAL_CAROUSEL_CONFIG);
    } else {
      configPromise = fetch(CONFIG_URL + "?v=" + Date.now())
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .catch(function (err) {
          console.warn(
            "[Carrusel Estacional] No se pudo leer " + CONFIG_URL + ", usando configuración por defecto:",
            err
          );
          return SEASONAL_CAROUSEL_DEFAULTS;
        });
    }

    // Cuando llega la config del JSON, si cambia algo, re-renderizamos.
    configPromise.then(function (cfg) {
      loadedConfig = cfg;
      if (document.getElementById("seasonal-carousel-wrapper")) {
        try {
          renderSeasonalCarousel();
        } catch (e) {
          console.warn("[Carrusel Estacional] Error al aplicar config:", e);
        }
      }
    }).catch(function () {});

    return configPromise;
  }

  // ---------- Helpers de producto ----------
  function isAvailableProduct(p) {
    if (typeof productIsAvailable === "function") {
      try {
        return productIsAvailable(p);
      } catch (e) { /* usar fallback */ }
    }
    return p && p.disponibilidad !== false;
  }

  function getDisplayProduct(p) {
    if (p && p.isGrouped && Array.isArray(p.variants)) {
      return p.variants[p.currentVariant || 0] || p.variants[0] || p;
    }
    return p;
  }

  function shuffle(arr) {
    const copy = Array.isArray(arr) ? arr.slice() : [];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function getProductPool() {
    const currentProducts = (typeof products !== "undefined" && Array.isArray(products))
      ? products
      : [];
    if (sessionProductPool && lastProductsRef === currentProducts) {
      return sessionProductPool;
    }
    lastProductsRef = currentProducts;
    sessionProductPool = currentProducts.filter(isAvailableProduct);
    return sessionProductPool;
  }

  // Normaliza la categoría (sin tildes, minúsculas) para comparación robusta.
  function normalizeCategoria(str) {
    let normalized = String(str || "");
    if (typeof normalizeString === "function") {
      try { normalized = normalizeString(normalized); } catch (e) {}
    }
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    normalized = normalized.replace(/[^a-zA-Z0-9\s&]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    return normalized;
  }

  function canonicalizeCategoria(categoria) {
    const raw = categoria == null ? "" : String(categoria).trim();
    if (!raw) return null;

    const normalized = normalizeCategoria(raw);
    if (!normalized) return null;

    const explicitMatch = CATEGORIAS_VALIDAS.find(function (item) {
      return normalizeCategoria(item) === normalized;
    });
    if (explicitMatch) return explicitMatch;

    if (Object.prototype.hasOwnProperty.call(CATEGORIA_ALIASES, normalized)) {
      return CATEGORIA_ALIASES[normalized];
    }

    return null;
  }

  function getCardCategoria(card) {
    const value = card && typeof card.categoria === "string" ? card.categoria.trim() : "";
    return canonicalizeCategoria(value);
  }

  // Devuelve el pool filtrado por la categoría del card (exacta tras normalizar).
  // "Todo" (o vacío) devuelve todos los productos disponibles.
  function getProductsForCategoria(categoria) {
    const cat = canonicalizeCategoria(categoria);
    const pool = getProductPool();
    if (!cat) return [];
    return pool.filter(function (p) {
      const disp = getDisplayProduct(p);
      const values = [
        p && p.categoria,
        disp && disp.categoria,
        p && p.categoriaPrincipal,
        disp && disp.categoriaPrincipal,
        p && p.category,
        disp && disp.category
      ];
      return values.some(function (value) {
        return canonicalizeCategoria(value) === cat;
      });
    });
  }

  // Selección aleatoria ESTABLE por tarjeta (misma selección al re-renderizar
  // con el mismo catálogo) pero NUEVA cuando cambia el catálogo en Firebase.
  // Filtra los productos por la categoría del card; si no hay ninguno, devuelve [].
  function pickForCard(card, index, maxItems) {
    const key = String(card.id || ("card_" + index));
    const currentProducts = typeof products !== "undefined" ? products : null;
    if (selectionsCache[key] && lastProductsRef === currentProducts) {
      return selectionsCache[key];
    }
    const categoria = getCardCategoria(card);
    if (!categoria) {
      selectionsCache[key] = [];
      return selectionsCache[key];
    }
    const selected = shuffle(getProductsForCategoria(categoria)).slice(0, Math.max(0, maxItems));
    selectionsCache[key] = selected;
    return selected;
  }

  function sanitizeHeroCards(cards) {
    if (!Array.isArray(cards)) return [];
    return cards.filter(function (card) {
      const categoria = getCardCategoria(card);
      if (!categoria) return false;
      return getProductsForCategoria(categoria).length > 0;
    }).map(function (card) {
      const categoria = getCardCategoria(card);
      return categoria ? Object.assign({}, card, { categoria: categoria }) : card;
    });
  }
// ---------- HTML de los mini productos ----------
  function buildMiniItemHTML(product) {
    const p = getDisplayProduct(product);
    if (!p) return "";

    const name = p.cleanName || p.nombre || "";
    if (!name) return "";

    const encodedName = encodeURIComponent(p.nombre || name);
    const imgFile = (p.imagenes && p.imagenes[0]) || p.imagen || "";
    const imgUrl = (typeof getProductImageUrl === "function")
      ? getProductImageUrl(imgFile, "thumb")
      : (imgFile
          ? "Images/" + String(imgFile).split("/").pop()
          : "Images/product-placeholder.svg");

    const isOnSale = p.oferta === true && p.descuento > 0 && typeof p.descuento === "number";
    const basePrice = Number(p.precio) || 0;
    const finalPrice = isOnSale
      ? (basePrice * (1 - p.descuento / 100)).toFixed(2)
      : basePrice.toFixed(2);

    let badges = "";
    if (isOnSale || p.nuevo) {
      badges = '<div class="sc-item-badges">';
      if (isOnSale) {
        badges += '<span class="sc-item-badge sc-item-badge-sale">-' + Math.round(p.descuento) + '%</span>';
      }
      if (p.nuevo) {
        badges += '<span class="sc-item-badge sc-item-badge-new">NUEVO</span>';
      }
      badges += "</div>";
    }

    const priceOriginal = isOnSale
      ? '<span class="sc-item-price-original">' + basePrice.toFixed(2) +
        ' <img src="Images/Zelle.svg" alt="Zelle" class="currency-icon price-xs"></span>'
      : "";

    return (
      '<div class="sc-item">' +
        '<div class="sc-item-image" onclick="showProductDetail(\'' + encodedName + '\')" title="' + escapeAttr(name) + '">' +
          '<img src="' + imgUrl + '" alt="' + escapeAttr(name) + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'Images/product-placeholder.svg\'">' +
          badges +
        "</div>" +
        '<div class="sc-item-body">' +
          '<p class="sc-item-title" onclick="showProductDetail(\'' + encodedName + '\')">' + escapeHtml(name) + "</p>" +
          '<div class="sc-item-price">' +
            priceOriginal +
            '<span class="sc-item-price-current">' + finalPrice +
              ' <img src="Images/Zelle.svg" alt="Zelle" class="currency-icon price-xs"></span>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  // ---------- HTML de cada tarjeta (estilo Amazon hero) ----------
  // layout "grid"   -> cabecera + cuadricula 2x2 de mini productos
  // layout "imagen" -> cabecera + foto grande del primer producto
  function buildSlideHTML(card, index, productsForCard) {
    const kicker = escapeHtml(card.kicker || card.sobretitulo || "");
    const titulo = escapeHtml(card.titulo || "Temporada");
    const subtitulo = escapeHtml(card.subtitulo || "");
    const icono = card.icono ? ' <i class="fas ' + card.icono + ' sc-title-icon" aria-hidden="true"></i>' : "";
    const gradiente = card.gradiente || "#FBF4EE";
    const colorTexto = card.colorTexto || "#333333";
    const colorAcento = card.colorAcento || "var(--color-principal)";
    const categoria = getCardCategoria(card);
    const enlaceTexto = escapeHtml(card.enlaceTexto || "Ver más productos");
    const layout = card.layout === "imagen" ? "imagen" : "grid";

    const headerHTML =
      '<div class="sc-header">' +
        (kicker ? '<p class="sc-kicker">' + kicker + "</p>" : "") +
        '<h2 class="carousel-title sc-title">' + icono + titulo + "</h2>" +
        (subtitulo ? '<p class="carousel-subtitle sc-subtitle">' + subtitulo + "</p>" : "") +
      "</div>";

    let bodyHTML = "";
    if (layout === "imagen") {
      bodyHTML = buildHeroHTML(productsForCard[0], colorAcento, "Images/product-placeholder.svg");
    } else {
      const itemsHTML = productsForCard.length
        ? productsForCard.map(buildMiniItemHTML).join("")
        : '<div class="sc-empty">Productos muy pronto 👀</div>';
      bodyHTML = '<div class="sc-grid">' + itemsHTML + "</div>";
    }

    const categoryLinkHTML = categoria
      ? '<button class="sc-link" type="button" data-category="' + escapeAttr(categoria) + '" style="color:' + colorAcento + ';border-color:' + colorAcento + ';">' +
          enlaceTexto + ' <i class="fas fa-chevron-right" aria-hidden="true"></i>' +
        "</button>"
      : "";

    return (
      '<article class="carousel-slide seasonal-slide' + (index === 0 ? " active" : "") + '" data-slide="' + index + '">' +
        '<div class="seasonal-card" style="background:' + gradiente + ';color:' + colorTexto + ';--sc-accent:' + colorAcento + ';">' +
          headerHTML +
          bodyHTML +
          categoryLinkHTML +
        "</div>" +
      "</article>"
    );
  }

  // Foto grande para el layout "imagen"
  function buildHeroHTML(product, colorAcento, placeholder) {
    const p = getDisplayProduct(product);
    if (!p || !(p.cleanName || p.nombre || p.imagenes || p.imagen)) {
      return '<div class="sc-hero sc-hero--empty"><span class="sc-empty">Productos muy pronto 👀</span></div>';
    }
    const name = p.cleanName || p.nombre || "";
    const encodedName = encodeURIComponent(p.nombre || name);
    const imgFile = (p.imagenes && p.imagenes[0]) || p.imagen || "";
    const imgUrl = (typeof getProductImageUrl === "function")
      ? getProductImageUrl(imgFile, "detail")
      : (imgFile
          ? "Images/" + String(imgFile).split("/").pop()
          : placeholder);

    return (
      '<div class="sc-hero" onclick="showProductDetail(\'' + encodedName + '\')" title="' + escapeAttr(name) + '">' +
        '<img class="sc-hero-img" src="' + imgUrl + '" alt="' + escapeAttr(name) + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'Images/product-placeholder.svg\'">' +
      "</div>"
    );
  }

// ---------- Render principal ----------
  function renderSeasonalCarousel() {
    const wrapper = document.getElementById("seasonal-carousel-wrapper");
    const indicatorsContainer = document.getElementById("carousel-indicators");
    if (!wrapper || !indicatorsContainer) return;

    const configData = getSyncConfig();
    const allCards = (Array.isArray(configData.cards) && configData.cards.length)
      ? configData.cards
      : SEASONAL_CAROUSEL_DEFAULTS.cards;

    // Solo se muestran los cards cuya categoría es válida y tiene productos disponibles.
    // Esto evita que una card vacía o con categoría incorrecta se muestre en la home.
    const cards = sanitizeHeroCards(allCards);

    // Índice del slide activo actual (para no "saltar" al re-renderizar).
    let activeIndex = 0;
    const activeSlide = wrapper.querySelector(".carousel-slide.active");
    if (activeSlide && activeSlide.getAttribute("data-slide") != null) {
      const idx = parseInt(activeSlide.getAttribute("data-slide"), 10);
      if (!isNaN(idx)) activeIndex = idx;
    }

    const slidesHTML = cards
      .map(function (card, index) {
        const maxItems = Math.min(Math.max(Number(card.items) || 8, 1), 8);
        const selected = pickForCard(card, index, maxItems);
        return buildSlideHTML(card, index, selected);
      })
      .join("");

    wrapper.innerHTML = slidesHTML;

    indicatorsContainer.innerHTML = cards
      .map(function (_, i) {
        return (
          '<button class="carousel-indicator' + (i === activeIndex ? " active" : "") +
          '" data-slide="' + i + '" aria-label="Ir al slide ' + (i + 1) + '"></button>'
        );
      })
      .join("");

    wrapper.querySelectorAll(".sc-link").forEach(function (button) {
      button.addEventListener("click", function () {
        const category = this.getAttribute("data-category");
        if (category && typeof window.filterByCategory === "function") {
          window.filterByCategory(category);
        }
      });
    });

    // Mantener sincronizadas las caches de script.js (vivas tras re-render).
    if (typeof carouselSlidesCache !== "undefined") {
      carouselSlidesCache = wrapper.querySelectorAll(".carousel-slide");
    }
    if (typeof carouselIndicatorsCache !== "undefined") {
      carouselIndicatorsCache = indicatorsContainer.querySelectorAll(".carousel-indicator");
    }

    // Restaurar el slide activo.
    const slides = wrapper.querySelectorAll(".carousel-slide");
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === activeIndex);
    });
    if (typeof currentSlide !== "undefined") {
      currentSlide = Math.min(activeIndex, Math.max(slides.length - 1, 0));
    }

    // Mantener en el inicio tras re-render y sincronizar flechas/indicadores.
    if (wrapper.scrollLeft) wrapper.scrollLeft = 0;
    if (typeof seasonalSync === "function") { try { seasonalSync(); } catch (e) {} }
  }

  // Re-selecciona productos (catálogo cambió) y re-renderiza.
  function refreshSeasonalCarousel() {
    lastProductsRef = null;
    sessionProductPool = null;
    Object.keys(selectionsCache).forEach(function (k) { delete selectionsCache[k]; });
    renderSeasonalCarousel();
  }

  // ---------- Exponer funciones para script.js ----------
  window.renderSeasonalCarousel = renderSeasonalCarousel;
  window.refreshSeasonalCarousel = refreshSeasonalCarousel;
  window.CUBANAZO_SEASONAL_CAROUSEL = {
    getConfig: getSyncConfig,
    defaults: SEASONAL_CAROUSEL_DEFAULTS
  };

  // ============================================================
  // Navegación "estilo Amazon" (scroll horizontal con snap)
  // Se sobreescriben los manejadores globales de script.js SOLO
  // cuando existe el carrusel estacional; si no, se delega en
  // las funciones originales para no romper nada.
  // ============================================================
  const _origChangeSlide = window.changeSlide;
  const _origGoToSlide = window.goToSlide;
  const _origUpdateCarousel = window.updateCarousel;

  function seasonalTrackEl() {
    return document.getElementById("seasonal-carousel-wrapper");
  }

  function seasonalCardUnit() {
    const track = seasonalTrackEl();
    if (!track) return 1;
    const card = track.querySelector(".carousel-slide");
    if (!card) return 1;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return (card.getBoundingClientRect().width || 1) + gap;
  }

  function seasonalStepSize() {
    const track = seasonalTrackEl();
    if (!track) return 1;
    const unit = seasonalCardUnit();
    const visible = Math.max(1, Math.floor(track.clientWidth / unit));
    return unit * visible;
  }

  function seasonalReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function seasonalScrollBy(direction) {
    const track = seasonalTrackEl();
    if (!track) return;
    const step = seasonalStepSize();
    track.scrollBy({
      left: direction * step,
      behavior: seasonalReducedMotion() ? "auto" : "smooth"
    });
    queueSeasonalSync();
  }

  function seasonalGoTo(index) {
    const track = seasonalTrackEl();
    if (!track) return;
    const unit = seasonalCardUnit();
    const max = track.scrollWidth - track.clientWidth;
    const target = Math.max(0, Math.min(index * unit, max));
    track.scrollTo({ left: target, behavior: seasonalReducedMotion() ? "auto" : "smooth" });
    queueSeasonalSync();
  }

  // Sincroniza flechas + slide activo + indicadores según la posición.
  function seasonalSync() {
    const track = seasonalTrackEl();
    const prev = document.getElementById("seasonal-carousel-prev") || document.getElementById("carousel-prev");
    const next = document.getElementById("seasonal-carousel-next") || document.getElementById("carousel-next");
    if (!track) return;

    const unit = seasonalCardUnit();
    const max = track.scrollWidth - track.clientWidth;
    const idx = unit > 0 ? Math.round(track.scrollLeft / unit) : 0;
    const slides = track.querySelectorAll(".carousel-slide");
    const total = slides.length;
    const active = Math.max(0, Math.min(idx, Math.max(total - 1, 0)));

    slides.forEach((s, i) => s.classList.toggle("active", i === active));
    const indicators = document.getElementById("carousel-indicators");
    if (indicators) {
      indicators.querySelectorAll(".carousel-indicator").forEach((d, i) => {
        d.classList.toggle("active", i === active);
      });
    }
    if (typeof currentSlide !== "undefined") {
      currentSlide = active;
    }
    if (prev) prev.hidden = track.scrollLeft <= 8;
    if (next) next.hidden = track.scrollLeft >= max - 8;
  }

  let _seasonalSyncTimer = null;
  function queueSeasonalSync() {
    if (_seasonalSyncTimer) return;
    _seasonalSyncTimer = setTimeout(function () {
      _seasonalSyncTimer = null;
      seasonalSync();
    }, 80);
  }

  // Sobrescritura de los manejadores globales de script.js.
  window.changeSlide = function (direction) {
    const track = seasonalTrackEl();
    if (track) {
      if (typeof window.pauseCarouselAutoplay === "function") window.pauseCarouselAutoplay();
      seasonalScrollBy(direction || 1);
      if (typeof window.startCarouselAutoplay === "function") { try { window.startCarouselAutoplay(); } catch (e) {} }
      return;
    }
    if (typeof _origChangeSlide === "function") return _origChangeSlide(direction);
  };

  window.goToSlide = function (index) {
    const track = seasonalTrackEl();
    if (track) {
      if (typeof window.pauseCarouselAutoplay === "function") window.pauseCarouselAutoplay();
      seasonalGoTo(index);
      if (typeof window.startCarouselAutoplay === "function") { try { window.startCarouselAutoplay(); } catch (e) {} }
      return;
    }
    if (typeof _origGoToSlide === "function") return _origGoToSlide(index);
  };

  window.updateCarousel = function () {
    const track = seasonalTrackEl();
    if (track) { seasonalSync(); return; }
    if (typeof _origUpdateCarousel === "function") return _origUpdateCarousel();
  };


  function init() {
    loadSeasonalCarouselConfig();
    setupSeasonalTrackNav();

    // Delegación de eventos para los indicadores (sobrevive al re-render).
    document.addEventListener("click", function (e) {
      const target = e.target;
      const indicator = target && target.closest
        ? target.closest(".carousel-indicator")
        : null;
      const container = document.getElementById("seasonal-carousel");
      if (!indicator || !container || !container.contains(indicator)) return;
      const idx = parseInt(indicator.getAttribute("data-slide"), 10);
      if (!isNaN(idx) && typeof goToSlide === "function") {
        goToSlide(idx);
      }
    });
  }

  // Prepara el track: accesibilidad (teclado), scroll listener y redimensionado.
  function setupSeasonalTrackNav() {
    const track = seasonalTrackEl();
    if (!track) return;

    track.setAttribute("tabindex", "0");
    if (!track.hasAttribute("aria-label")) {
      track.setAttribute("aria-label", "Carrusel de ofertas estacionales");
    }

    // Teclado: ← / → cuando el carrusel tiene el foco.
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); if (typeof changeSlide === "function") changeSlide(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); if (typeof changeSlide === "function") changeSlide(-1); }
    });

    // Scroll manual (touch/wheel) -> sincronizar flechas e indicadores.
    track.addEventListener("scroll", function () { queueSeasonalSync(); }, { passive: true });

    // Al redimensionar / rotar, recalcular estado.
    if (typeof ResizeObserver !== "undefined") {
      try { new ResizeObserver(function () { queueSeasonalSync(); }).observe(track); } catch (e) {}
    }
    window.addEventListener("resize", function () { queueSeasonalSync(); });

    // Sync inicial (flechas + indicadores).
    seasonalSync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();