const BACKEND = 'https://backend-szp7.onrender.com';

const DEFAULT_FALLBACK_COUNTRY_ISO = 'CU';

const DELIVERY_PHONE_DIAL_CODE = '53';

const COUNTRY_DIAL_CODES = [
    { iso: 'CU', name: 'Cuba', dial: '53' },
    { iso: 'US', name: 'Estados Unidos', dial: '1' },
    { iso: 'CA', name: 'Canadá', dial: '1' },
    { iso: 'MX', name: 'México', dial: '52' },
    { iso: 'ES', name: 'España', dial: '34' },
    { iso: 'AR', name: 'Argentina', dial: '54' },
    { iso: 'BO', name: 'Bolivia', dial: '591' },
    { iso: 'BR', name: 'Brasil', dial: '55' },
    { iso: 'CL', name: 'Chile', dial: '56' },
    { iso: 'CO', name: 'Colombia', dial: '57' },
    { iso: 'CR', name: 'Costa Rica', dial: '506' },
    { iso: 'EC', name: 'Ecuador', dial: '593' },
    { iso: 'SV', name: 'El Salvador', dial: '503' },
    { iso: 'GT', name: 'Guatemala', dial: '502' },
    { iso: 'HN', name: 'Honduras', dial: '504' },
    { iso: 'NI', name: 'Nicaragua', dial: '505' },
    { iso: 'PA', name: 'Panamá', dial: '507' },
    { iso: 'PY', name: 'Paraguay', dial: '595' },
    { iso: 'PE', name: 'Perú', dial: '51' },
    { iso: 'DO', name: 'República Dominicana', dial: '1' },
    { iso: 'UY', name: 'Uruguay', dial: '598' },
    { iso: 'VE', name: 'Venezuela', dial: '58' },
    { iso: 'PR', name: 'Puerto Rico', dial: '1' },
    { iso: 'JM', name: 'Jamaica', dial: '1' },
    { iso: 'HT', name: 'Haití', dial: '509' },
    { iso: 'BS', name: 'Bahamas', dial: '1' },
    { iso: 'BB', name: 'Barbados', dial: '1' },
    { iso: 'TT', name: 'Trinidad y Tobago', dial: '1' },
    { iso: 'GY', name: 'Guyana', dial: '592' },
    { iso: 'SR', name: 'Surinam', dial: '597' },
    { iso: 'BZ', name: 'Belice', dial: '501' },
    { iso: 'GB', name: 'Reino Unido', dial: '44' },
    { iso: 'IE', name: 'Irlanda', dial: '353' },
    { iso: 'FR', name: 'Francia', dial: '33' },
    { iso: 'DE', name: 'Alemania', dial: '49' },
    { iso: 'IT', name: 'Italia', dial: '39' },
    { iso: 'PT', name: 'Portugal', dial: '351' },
    { iso: 'NL', name: 'Países Bajos', dial: '31' },
    { iso: 'BE', name: 'Bélgica', dial: '32' },
    { iso: 'CH', name: 'Suiza', dial: '41' },
    { iso: 'AT', name: 'Austria', dial: '43' },
    { iso: 'SE', name: 'Suecia', dial: '46' },
    { iso: 'NO', name: 'Noruega', dial: '47' },
    { iso: 'DK', name: 'Dinamarca', dial: '45' },
    { iso: 'FI', name: 'Finlandia', dial: '358' },
    { iso: 'PL', name: 'Polonia', dial: '48' },
    { iso: 'GR', name: 'Grecia', dial: '30' },
    { iso: 'RU', name: 'Rusia', dial: '7' },
    { iso: 'UA', name: 'Ucrania', dial: '380' },
    { iso: 'RO', name: 'Rumanía', dial: '40' },
    { iso: 'CZ', name: 'República Checa', dial: '420' },
    { iso: 'HU', name: 'Hungría', dial: '36' },
    { iso: 'TR', name: 'Turquía', dial: '90' },
    { iso: 'CN', name: 'China', dial: '86' },
    { iso: 'JP', name: 'Japón', dial: '81' },
    { iso: 'KR', name: 'Corea del Sur', dial: '82' },
    { iso: 'IN', name: 'India', dial: '91' },
    { iso: 'ID', name: 'Indonesia', dial: '62' },
    { iso: 'PH', name: 'Filipinas', dial: '63' },
    { iso: 'VN', name: 'Vietnam', dial: '84' },
    { iso: 'TH', name: 'Tailandia', dial: '66' },
    { iso: 'MY', name: 'Malasia', dial: '60' },
    { iso: 'SG', name: 'Singapur', dial: '65' },
    { iso: 'AU', name: 'Australia', dial: '61' },
    { iso: 'NZ', name: 'Nueva Zelanda', dial: '64' },
    { iso: 'ZA', name: 'Sudáfrica', dial: '27' },
    { iso: 'EG', name: 'Egipto', dial: '20' },
    { iso: 'MA', name: 'Marruecos', dial: '212' },
    { iso: 'NG', name: 'Nigeria', dial: '234' },
    { iso: 'IL', name: 'Israel', dial: '972' },
    { iso: 'SA', name: 'Arabia Saudita', dial: '966' },
    { iso: 'AE', name: 'Emiratos Árabes Unidos', dial: '971' }
];

let cachedUserDataPromise = null;

function findDialCodeByIso(iso){
    if (!iso) return null;
    const upper = String(iso).toUpperCase();
    return COUNTRY_DIAL_CODES.find(c => c.iso === upper) || null;
}

function populatePhoneCountrySelects(){
    const selects = document.querySelectorAll('.phone-country-select');
    if (!selects.length) return;

    const optionsHtml = COUNTRY_DIAL_CODES
        .map(c => `<option value="${c.dial}" data-iso="${c.iso}">+${c.dial} ${c.name}</option>`)
        .join('');

    selects.forEach(select => {
        if (select.dataset.populated === 'true') return;
        select.innerHTML = optionsHtml;
        select.dataset.populated = 'true';
        const fallback = findDialCodeByIso(DEFAULT_FALLBACK_COUNTRY_ISO);
        if (fallback) select.value = fallback.dial;
    });
}

function preselectPhoneCountryFromUserData(userData){
    const match = findDialCodeByIso(userData?.country_code);
    if (!match) return; // Se queda con el valor por defecto ya preseleccionado

    document.querySelectorAll('.phone-country-select').forEach(select => {
        // Solo se ajusta automáticamente si el cliente no lo cambió a mano.
        if (select.dataset.userChanged === 'true') return;
        select.value = match.dial;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializePaymentSystem();
    sendPageViewStatistics(); // Enviar estadísticas al cargar la página
});

function initializePaymentSystem() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (validateCartBeforeCheckout()) {
                showPaymentSection();
            }
        });
    }

    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', processPayment);
        paymentForm.addEventListener('click', handlePaymentSubmitClick);
    }

    restrictNumericPhoneInputs();
    injectPaymentStyles();
    populatePhoneCountrySelects();

    document.querySelectorAll('.phone-country-select').forEach(select => {
        select.addEventListener('change', () => {
            select.dataset.userChanged = 'true';
        });
    });

    gatherUserData().then(preselectPhoneCountryFromUserData).catch(() => {});
}

function restrictNumericPhoneInputs() {
    const phoneInputs = document.querySelectorAll('#phone, #delivery-phone');

    phoneInputs.forEach(input => {
        const sanitizePhoneInput = () => {
            input.value = input.value.replace(/\D/g, '');
        };

        input.addEventListener('input', sanitizePhoneInput);
        input.addEventListener('blur', sanitizePhoneInput);
    });
}

function handlePaymentSubmitClick(e) {
    const submitBtn = e.target.closest('.submit-btn');
    if (!submitBtn) return;

    const form = submitBtn.closest('form');
    if (!form) return;

    if (isProcessingPayment || form.getAttribute('data-submitting') === 'true') {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
    }

}

function beginPaymentSubmission(form, submitBtn) {
    if (!form) return;

    form.setAttribute('data-submitting', 'true');
    isProcessingPayment = true;

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent.trim();
        submitBtn.textContent = 'Procesando...';
    }
}

function createProcessingOverlay() {
    if (document.querySelector('.processing-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'processing-overlay';
    // prevent pointer events to underlying content
    overlay.style.pointerEvents = 'auto';
    document.body.appendChild(overlay);
    // ensure no background scroll
    document.body.style.overflow = 'hidden';
    setTimeout(() => overlay.classList.add('active'), 10);
}

function removeProcessingOverlay() {
    const overlay = document.querySelector('.processing-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.remove();
        // restore body scroll only if no other modal/overlay is active
        const modal = document.getElementById('order-confirmation-modal');
        const paymentSection = document.getElementById('payment-section');
        if (!(modal && modal.classList.contains('active')) && !(paymentSection && paymentSection.classList.contains('active'))) {
            document.body.style.overflow = '';
        }
    }, 260);
}

function resetPaymentSubmissionState(form = document.getElementById('payment-form')) {
    const submitBtn = form?.querySelector('.submit-btn');

    if (form) {
        form.removeAttribute('data-submitting');
        form.classList.remove('is-submitting');
    }

    isProcessingPayment = false;

    if (submitBtn) {
        submitBtn.disabled = false;
        if (submitBtn.dataset.originalText) {
            submitBtn.textContent = submitBtn.dataset.originalText;
        }
    }
}

// Función para enviar estadísticas de visualización de página
async function sendPageViewStatistics() {
    try {
        const userData = await gatherUserData();
        // Obtenemos los datos de navegación
        const navEntry = performance.getEntriesByType('navigation')[0];

        // Calculamos la diferencia
        const pageLoadTime = navEntry.domContentLoadedEventEnd - navEntry.startTime;
        
        const statsData = {
            ubicacion: typeof getSelectedUbicacion === 'function' ? getSelectedUbicacion() : null,
            ip: userData.ip || 'Desconocido',
            pais: normalizeUserCountry(userData),
            origen: window.location.href || 'Directo',
            afiliado: getCurrentAffiliate()?.nombre || "Ninguno",
            tiempo_carga_pagina_ms: pageLoadTime,
            navegador: getBrowserInfo(),
            sistema_operativo: getOSInfo(),
            fuente_trafico: document.referrer || "Directo"
        };

        await sendStatisticsToBackend(statsData);
    } catch (error) {
        console.error('Error enviando estadísticas de página:', error);
    }
}

// Función para obtener datos del usuario. Se cachea la promesa para no
// disparar varias peticiones a ipapi.co en la misma visita (eso agotaba
// la cuota gratuita y hacía que a veces llegara "Desconocido").
function normalizeUserCountry(userData) {
    const value = userData?.country || userData?.country_name || userData?.countryCode || 'Desconocido';
    return String(value || 'Desconocido').trim() || 'Desconocido';
}

async function gatherUserData() {
    if (cachedUserDataPromise) return cachedUserDataPromise;

    cachedUserDataPromise = (async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) throw new Error('Error obteniendo datos de IP');
            const userData = await response.json();
            return {
                ...userData,
                country: normalizeUserCountry(userData),
                pais: normalizeUserCountry(userData)
            };
        } catch (error) {
            console.error('Error obteniendo datos del usuario:', error);
            return {
                ip: 'Desconocido',
                country: 'Desconocido',
                pais: 'Desconocido',
                city: 'Desconocido'
            };
        }
    })();

    return cachedUserDataPromise;
}

// Función para enviar datos al backend
async function sendStatisticsToBackend(data) {
    try {
        const response = await fetch(`${BACKEND}/guardar-estadistica`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error = new Error(responseData.message || responseData.error || 'Error enviando estadísticas');
            error.status = response.status;
            error.data = responseData;
            throw error;
        }

        return responseData;
    } catch (error) {
        console.error('Error en sendStatisticsToBackend:', error);
        throw error;
    }
}

function findCartIndexByProductId(id) {
    if (!id) return -1;
    return cart.findIndex(item => {
        const isPack = item.isPack || item.pack;
        const itemData = isPack ? item.pack : item.product;
        if (!itemData) return false;
        const realId = isPack ? itemData.id : resolveRealProductId(itemData);
        return String(realId) === String(id);
    });
}

function mostrarModalStockInsuficiente(sinStock) {
    const existente = document.querySelector('.stock-modal-overlay');
    if (existente) existente.remove();

    const overlay = document.createElement('div');
    overlay.className = 'stock-modal-overlay';

    const itemsHtml = (sinStock || []).map(item => `
        <li class="stock-modal-item">
            <span class="stock-modal-item-nombre">${item.nombre}</span>
            <span class="stock-modal-item-detalle">Pediste ${item.solicitado}, quedan ${item.disponible}</span>
        </li>
    `).join('');

    overlay.innerHTML = `
        <div class="stock-modal">
            <div class="stock-modal-icon">⚠</div>
            <h3 class="stock-modal-titulo">Ya no hay suficiente stock</h3>
            <p class="stock-modal-texto">Otro cliente compró estos productos justo antes que tú. Ajusta tu carrito para continuar:</p>
            <ul class="stock-modal-lista">${itemsHtml}</ul>
            <button class="stock-modal-btn" id="stock-modal-cerrar">Ajustar carrito</button>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('stock-modal-cerrar').addEventListener('click', () => {
        overlay.remove();
        ajustarCarritoConStockReal(sinStock || []);
    });
}

function ajustarCarritoConStockReal(sinStock) {
    sinStock.forEach(item => {
        const index = findCartIndexByProductId(item.id);
        if (index === -1) return;

        if (item.disponible <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = item.disponible;
        }
    });

    saveCart();
    updateCart();

    try { updateOrderSummary(); } catch (e) { console.error(e); }
}

// Funciones auxiliares para obtener información del navegador y SO
function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browser = "Desconocido";
    
    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("SamsungBrowser")) browser = "Samsung Browser";
    else if (userAgent.includes("Opera") || userAgent.includes("OPR")) browser = "Opera";
    else if (userAgent.includes("Trident")) browser = "Internet Explorer";
    else if (userAgent.includes("Edge")) browser = "Edge";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari")) browser = "Safari";
    
    return browser;
}

function getOSInfo() {
    const userAgent = navigator.userAgent;
    let os = "Desconocido";
    
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "MacOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
    
    return os;
}

function showPaymentSection() {
    // Asegúrate de que estas funciones (closeCart, closeSidebar) existan en tu código
    if (typeof closeCart === 'function') closeCart();
    if (typeof closeSidebar === 'function') closeSidebar();

    const paymentSection = document.getElementById('payment-section');
    if (!paymentSection) return;

    paymentSection.classList.add('active');
    document.body.style.overflow = 'hidden';
    createPaymentOverlay();
    
    // Inicializar autocompletado de datos de pago
    if (typeof paymentAutofill !== 'undefined') {
        paymentAutofill.initialize();
    }
    
    try {
        updateOrderSummary();
    } catch (error) {
        console.error('Error actualizando resumen:', error);
        showPaymentNotification('Error al cargar los productos', 'error');
    }

    resetPaymentSubmissionState();

}


function hidePaymentSection() {
    const paymentSection = document.getElementById('payment-section');
    if (paymentSection) {
        paymentSection.classList.remove('active');
    }

    document.body.style.overflow = '';
    removePaymentOverlay();
}

function updateOrderSummary() {
    const orderSummary = document.getElementById('summary-items');
    const paymentTotal = document.getElementById('payment-total');

    if (!orderSummary || !paymentTotal) {
        throw new Error('Elementos del resumen no encontrados');
    }

    const cart = getValidatedCart();
    let total = 0;
    const minimumBanner = document.getElementById('payment-minimum-banner');
    const submitBtn = document.getElementById('payment-form')?.querySelector('.submit-btn');

    orderSummary.innerHTML = cart.map(item => {
        // Determinar si es pack o producto
        const isPack = item.isPack || item.pack;
        const itemData = isPack ? item.pack : item.product;
        
        if (!itemData) return '';
        
        const isOnSale = itemData.oferta && itemData.descuento > 0;
        const unitPrice = isOnSale
            ? itemData.precio * (1 - itemData.descuento / 100)
            : itemData.precio;
        const itemTotal = unitPrice * item.quantity;
        total += itemTotal;

        const itemType = isPack ? '<span class="item-type-badge pack-badge">Pack</span>' : '';

        return `
            <tr class="${isPack ? 'order-item-pack' : 'order-item-product'}">
                <td class="order-item-name">
                    ${escapeHtml(itemData.nombre)}
                    ${itemType}
                    ${isOnSale ? '<span class="order-item-badge">OFERTA</span>' : ''}
                </td>
                <td class="order-item-quantity">${item.quantity}</td>
                <td class="order-item-price">
                    ${isOnSale ? `
                        <span class="original-price">$${itemData.precio.toFixed(2)}</span>
                        <span class="discounted-price">$${unitPrice.toFixed(2)}</span>
                    ` : `$${unitPrice.toFixed(2)}`}
                </td>
                <td class="order-item-total">$${itemTotal.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    const affiliate = getCurrentAffiliate();
    if (affiliate) {
        orderSummary.innerHTML += `
            <tr class="affiliate-info">
                <td colspan="3">Referido por:</td>
                <td> (${affiliate.id})</td>
            </tr>
        `;
    }

    if (minimumBanner) {
        const isMet = total >= MINIMUM_ORDER_TOTAL;
        const remaining = Math.max(0, MINIMUM_ORDER_TOTAL - total);
        minimumBanner.classList.toggle('warning', !isMet);
        minimumBanner.classList.toggle('ok', isMet);
        minimumBanner.innerHTML = `
            <i class="fas ${isMet ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${isMet ? 'Tu pedido cumple con el mínimo de 10 <img src="Images/zelle_oscuro.svg" alt="Zelle" class="currency-icon price-xs">.' : `Faltan <strong>${remaining.toFixed(2)}</strong> <img src="Images/zelle_oscuro.svg" alt="Zelle" class="currency-icon price-xs"> para alcanzar el mínimo de pedido.`}</span>
        `;
    }

    if (submitBtn) {
        const canSubmit = total >= MINIMUM_ORDER_TOTAL;
        submitBtn.disabled = !canSubmit;
        submitBtn.classList.toggle('disabled', !canSubmit);
        submitBtn.textContent = canSubmit ? 'Confirmar Pedido' : 'Completa el mínimo de 10 Zelle';
    }

    paymentTotal.textContent = `$${total.toFixed(2)}`;
}

let isProcessingPayment = false; // bandera para evitar envíos múltiples

function getOrCreateClientOrderId() {
    const storageKey = 'cubanazo_client_order_id';
    let id = sessionStorage.getItem(storageKey);
    if (!id) {
        id = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : `co_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(storageKey, id);
    }
    return id;
}

function clearClientOrderId() {
    sessionStorage.removeItem('cubanazo_client_order_id');
}

async function processPayment(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form?.querySelector('.submit-btn');

    // protección contra doble envío
    if (isProcessingPayment || form?.getAttribute('data-submitting') === 'true') {
        console.warn('El pago ya está en proceso, espera un momento.');
        return;
    }

    // validar carrito antes de bloquear UI
    let cart;
    try {
        cart = getValidatedCart();
        if (cart.length === 0) {
            showPaymentNotification('Tu carrito está vacío', 'error');
            return;
        }

        const cartTotalValue = cart.reduce((sum, item) => {
            const itemData = item.product || item.pack;
            if (!itemData) return sum;
            const price = itemData.oferta
                ? itemData.precio * (1 - itemData.descuento / 100)
                : itemData.precio;
            return sum + (price * item.quantity);
        }, 0);

        if (cartTotalValue < MINIMUM_ORDER_TOTAL) {
            const remaining = (MINIMUM_ORDER_TOTAL - cartTotalValue).toFixed(2);
            showPaymentNotification(`El pedido mínimo es de 10 <img src="Images/zelle_oscuro.svg" alt="Zelle" class="currency-icon price-xs">. Faltan ${remaining} <img src="Images/zelle_oscuro.svg" alt="Zelle" class="currency-icon price-xs"> para continuar.`, 'error');
            return;
        }
    } catch (err) {
        showPaymentNotification('Error validando el carrito: ' + (err.message || err), 'error');
        return;
    }

    // Ahora sí iniciamos la UX de envío para evitar condiciones de carrera
    beginPaymentSubmission(form, submitBtn);
    // block UI visually while processing
    try { createProcessingOverlay(); } catch (e) { console.warn(e); }

    const loadingNotification = showPaymentNotification('Procesando tu pedido...', 'loading');

    try {
        // usamos la variable `cart` validada arriba

        const formData = validateForm(); // Info del cliente del formulario
        const userData = await gatherUserData(); // Info de IP y país
        const affiliateInfo = getCurrentAffiliate(); // Objeto de afiliado

        // Guardar datos de pago en localStorage para futuro autocompletado
        if (typeof paymentAutofill !== 'undefined') {
            paymentAutofill.saveData(
                formData['full-name'],
                formData.email,
                formData.phone
            );
        }

        // Prepara el payload completo que se enviará al backend y luego a Apps Script
        const orderPayload = {
            ubicacion: typeof getSelectedUbicacion === 'function' ? getSelectedUbicacion() : null,
            ip: userData.ip || 'Desconocido',
            pais: normalizeUserCountry(userData),
            origen: window.location.href || 'Directo',
            afiliado: affiliateInfo?.nombre || "Ninguno", // Nombre del afiliado (string)
            nombre_comprador: formData['full-name'],
            telefono_comprador: buildFullPhoneNumber(formData.phone, 'phone-country-code') || "N/A",
            correo_comprador: formData.email,
            direccion_envio: formData.address,
            nombre_persona_entrega: formData['delivery-person'],
            telefono_persona_entrega: `${DELIVERY_PHONE_DIAL_CODE}${formData['delivery-phone']}`,
            compras: prepareOrderItems(cart), // Artículos del carrito formateados
            precio_compra_total: calculateOrderTotal(cart), // Precio total
            navegador: getBrowserInfo(), // Info del navegador
            sistema_operativo: getOSInfo(), // Info del SO
            fuente_trafico: document.referrer || "Directo", // Fuente de tráfico
            fecha_pedido: new Date().toISOString(), // Marca de tiempo del pedido
            client_order_id: getOrCreateClientOrderId()
        };
        // envar las estadstcas de peddo al server de estadstcas
        let estadisticaResponse;
        try {
            estadisticaResponse = await sendStatisticsToBackend(orderPayload);
        } catch (statsError) {
            if (statsError.status === 409 && statsError.data && statsError.data.error === 'stock_insuficiente') {
                if (loadingNotification) {
                    loadingNotification.classList.remove('show');
                    setTimeout(() => loadingNotification.remove(), 300);
                }
                mostrarModalStockInsuficiente(statsError.data.sinStock || []);
                return;
            }
            throw statsError;
        }
        const orderNumber = estadisticaResponse?.orderNumber || estadisticaResponse?.numero_orden || null;
        if (orderNumber) {
            orderPayload.orderNumber = orderNumber;
        }
        // si el backend devolvió el id del registro en /pedidos (RTDB secundaria), preservarlo
        const pedidoId = estadisticaResponse?.pedidoId || estadisticaResponse?.pedidoId || null;
        if (pedidoId) {
            orderPayload.pedidoId = pedidoId;
        }

        // Envía el payload completo al backend (que lo reenvía a Apps Script)
        const response = await sendPaymentToServer(orderPayload);

        if (!response.success) {
            throw new Error(response.message || 'Error en el pedido');
        }

        // Cerrar notificación de carga primero
        if (loadingNotification) {
            loadingNotification.classList.remove('show');
            setTimeout(() => loadingNotification.remove(), 300);
        }

        if (typeof purchaseHistoryManager !== 'undefined') {
            try { purchaseHistoryManager.addOrder(orderPayload, cart); } catch (e) { console.error(e); }
        }

        clearClientOrderId();
        clearCart();
        hidePaymentSection();
        showOrderConfirmationModal(orderPayload.orderNumber || response?.orderNumber || response?.numero_orden || null);

    } catch (error) {
        console.error('Error en processPayment:', error);
        // Cerrar notificación de carga si hay error
        if (loadingNotification) {
            loadingNotification.classList.remove('show');
            setTimeout(() => {
                loadingNotification.remove();
                showPaymentNotification(error.message, 'error');
            }, 300);
        }
    } finally {
        setTimeout(() => {
            resetPaymentSubmissionState(form);
            try { removeProcessingOverlay(); } catch (e) { /* ignore */ }
        }, 1500);
    }
}

function showOrderConfirmationModal(orderNumber) {
    const modal = document.getElementById('order-confirmation-modal');
    if (!modal) return;

    setConfirmationOrderNumber(orderNumber);
    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function setConfirmationOrderNumber(orderNumber) {
    const element = document.getElementById('confirmation-order-number');
    if (!element) return;

    if (orderNumber) {
        element.textContent = `Número de orden: ${orderNumber}`;
        element.style.display = 'block';
    } else {
        element.textContent = '';
        element.style.display = 'none';
    }
}

// También necesitamos la función para cerrar el modal (ya está en el HTML pero no en el JS)
function closeConfirmationAndGoHome() {
    const modal = document.getElementById('order-confirmation-modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        // Asegúrate de que goToHome() exista en tu script.js o donde sea
        // restore body scroll
        document.body.style.overflow = '';
        if (typeof goToHome === 'function') goToHome(); 
    }, 300);
}

function showPaymentNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.payment-notification');
    existingNotifications.forEach(notification => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });

    const notification = document.createElement('div');
    notification.className = `payment-notification ${type}`;

    const titleMap = {
        loading: 'Procesando',
        success: 'Pedido recibido',
        error: 'Error',
        info: 'Información'
    };

    // Use simple glyphs and a CSS spinner instead of inline SVGs (improves contrast and reliability)
    const glyphs = {
        loading: '<div class="loading-spinner" aria-hidden="true"></div>',
        success: '<span class="notification-glyph">✓</span>',
        error: '<span class="notification-glyph">✕</span>',
        info: '<span class="notification-glyph">ℹ</span>'
    };

    const iconHTML = glyphs[type] || glyphs.info;
    const title = titleMap[type] || titleMap.info;

    notification.innerHTML = `
        <div class="notification-icon">${iconHTML}</div>
        <div class="notification-body">
            <div class="notification-title">${title}</div>
            <div class="notification-text">${message}</div>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    if (type !== 'loading') {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    return notification;
}

function getCurrentCartItemData(cartItem) {
    const itemData = cartItem.product || cartItem.pack;
    if (!itemData) return null;

    if (cartItem.pack) {
        const packList = typeof packs !== 'undefined' && Array.isArray(packs)
            ? packs
            : (Array.isArray(window.packs) ? window.packs : []);

        const packId = itemData.id != null ? String(itemData.id) : null;
        if (packId) {
            const packMatchById = packList.find((p) => p.id != null && String(p.id) === packId);
            if (packMatchById) return packMatchById;
        }
        if (itemData.nombre) {
            const packMatchByName = packList.find((p) => p.nombre === itemData.nombre);
            if (packMatchByName) return packMatchByName;
        }
        return null;
    }

    const itemId = itemData.id != null ? String(itemData.id) : null;
    const productList = typeof products !== 'undefined' && Array.isArray(products)
        ? products
        : (Array.isArray(window.products) ? window.products : []);

    if (itemId && Array.isArray(productList)) {
        let match = productList.find((p) => p.id && String(p.id) === itemId);
        if (match) {
            if (match.isGrouped && Array.isArray(match.variants)) {
                const variantMatch = match.variants.find((v) => v.id && String(v.id) === itemId);
                return variantMatch || match;
            }
            return match;
        }

        for (const p of productList) {
            if (p.isGrouped && Array.isArray(p.variants)) {
                const variantMatch = p.variants.find((v) => v.id && String(v.id) === itemId);
                if (variantMatch) return variantMatch;
            }
        }
    }

    if (itemData.nombre && Array.isArray(productList)) {
        const nameMatch = productList.find((p) => p.nombre === itemData.nombre);
        if (nameMatch) return nameMatch;

        const variantMatch = productList
            .flatMap((p) => (p.isGrouped ? p.variants : []))
            .find((v) => v.nombre === itemData.nombre);
        if (variantMatch) return variantMatch;
    }

    return null;
}

function getCurrentCartCart() {
    if (typeof cart !== 'undefined' && Array.isArray(cart)) {
        return cart;
    }

    const storageKey = typeof getCartStorageKey === 'function' ? getCartStorageKey() : 'cart_default';
    const storedCart = JSON.parse(localStorage.getItem(storageKey)) || [];
    return Array.isArray(storedCart) ? storedCart : [];
}

function getUnavailableCartItems() {
    const cartItems = getCurrentCartCart();
    if (!Array.isArray(cartItems)) {
        return [];
    }

    return cartItems.filter(item => {
        const itemData = item.product || item.pack;
        if (!itemData || item.quantity <= 0) return false;
        return !isAvailableForPayment(item);
    });
}

function isAvailableForPayment(cartItem) {
    const itemData = cartItem.product || cartItem.pack;
    if (!itemData || cartItem.quantity <= 0) return false;

    const currentData = getCurrentCartItemData(cartItem);
    if (!currentData) return false;

    if (cartItem.pack) {
        return currentData.disponible !== false;
    }
    return currentData.disponibilidad !== false;
}

function validateCartBeforeCheckout() {
    // Validar si hay un mensaje bloqueando el checkout
    if (messageNotificationSystem && messageNotificationSystem.isWithinDateRange && messageNotificationSystem.messageData) {
        showPaymentNotification('⚠️ ' + messageNotificationSystem.messageData.mensaje, 'error');
        return false;
    }

    const unavailableItems = getUnavailableCartItems();
    if (unavailableItems.length > 0) {
        const plural = unavailableItems.length > 1 ? 'productos no disponibles' : 'producto no disponible';
        showPaymentNotification(`Hay ${unavailableItems.length} ${plural} en el carrito. Elimínalos para continuar.`, 'error');
        return false;
    }

    const cart = getValidatedCart();
    if (cart.length === 0) {
        showPaymentNotification('No hay productos disponibles para pagar. Añade productos disponibles al carrito.', 'error');
        return false;
    }

    const cartTotalValue = cart.reduce((sum, item) => {
        const itemData = item.product || item.pack;
        if (!itemData) return sum;
        const price = itemData.oferta
            ? itemData.precio * (1 - itemData.descuento / 100)
            : itemData.precio;
        return sum + (price * item.quantity);
    }, 0);

    if (cartTotalValue < MINIMUM_ORDER_TOTAL) {
        const remaining = (MINIMUM_ORDER_TOTAL - cartTotalValue).toFixed(2);
        showPaymentNotification(`El pedido mínimo es de 10 <img src="Images/zelle_oscuro.svg" alt="Zelle" class="currency-icon price-xs">. Faltan ${remaining} <img src="Images/zelle_oscuro.svg" alt="Zelle" class="currency-icon price-xs"> para continuar.`, 'error');
        return false;
    }

    return true;
}

function getValidatedCart() {
    const cartItems = getCurrentCartCart();
    if (!Array.isArray(cartItems)) {
        throw new Error('Formato de carrito inválido');
    }

    return cartItems
        .filter(item => {
            const itemData = item.product || item.pack;
            if (!itemData || item.quantity <= 0) return false;
            return isAvailableForPayment(item);
        })
        .map(item => {
            const liveData = getCurrentCartItemData(item);
            if (!liveData) return item;
            return item.pack
                ? { ...item, pack: liveData }
                : { ...item, product: liveData };
        });
}

function validateForm() {
    const form = document.getElementById('payment-form');
    const requiredFields = ['full-name', 'email', 'phone', 'address', 'delivery-person', 'delivery-phone'];
    const formData = {};

    requiredFields.forEach(field => {
        const value = form.querySelector(`[name="${field}"]`)?.value.trim();
        if (!value) {
            throw new Error(`Por favor completa el campo ${field.replace('-', ' ')}`);
        }

        if (field === 'phone' || field === 'delivery-phone') {
            const onlyNumbers = value.replace(/\D/g, '');
            if (!/^\d+$/.test(onlyNumbers)) {
                throw new Error(`El campo ${field.replace('-', ' ')} solo admite números.`);
            }
            formData[field] = onlyNumbers;
            return;
        }

        formData[field] = value;
    });

    return formData;
}

// Antepone el código de país seleccionado al número local, sin "+", listo
// para usarse directo como wa.me/<resultado> en WhatsApp.
function buildFullPhoneNumber(localDigits, selectId){
    const dial = document.getElementById(selectId)?.value || '';
    return `${dial}${localDigits}`;
}

// Los productos con variantes (ej. "Caja de refresco sublime 24u (Cola)/(naranja)")
// se agrupan en el frontend bajo un id ficticio "group_<nombre base>" solo para la UI
// (selector de variantes). Ese id NO existe en Firebase. Si por algún carrito viejo
// guardado en localStorage (antes de esta corrección) llega ese id ficticio, lo
// resolvemos aquí al id real de la variante seleccionada para que el backend pueda
// encontrar el producto y descontar/validar su stock correctamente.
function resolveRealProductId(itemData) {
    if (!itemData) return null;
    if (itemData.isGrouped && Array.isArray(itemData.variants)) {
        const idx = Number.isInteger(itemData.currentVariant) ? itemData.currentVariant : 0;
        const variant = itemData.variants[idx] || itemData.variants[0];
        return (variant && variant.id) || itemData.originalId || itemData.id || null;
    }
    return itemData.id || null;
}

function prepareOrderItems(cart) {
    return cart.map(item => {
        const isPack = item.isPack || item.pack;
        const itemData = isPack ? item.pack : item.product;
        
        if (!itemData) return null;
        
        return {
            id: isPack ? (itemData.id || null) : resolveRealProductId(itemData),
            name: itemData.nombre,
            quantity: item.quantity,
            type: isPack ? 'pack' : 'product',
            unitPrice: itemData.oferta
                ? itemData.precio * (1 - itemData.descuento / 100)
                : itemData.precio,
            discount: itemData.oferta ? itemData.descuento : 0
        };
    }).filter(item => item !== null);
}

function calculateOrderTotal(cart) {
    return cart.reduce((total, item) => {
        const isPack = item.isPack || item.pack;
        const itemData = isPack ? item.pack : item.product;
        
        if (!itemData) return total;
        
        const price = itemData.oferta
            ? itemData.precio * (1 - itemData.descuento / 100)
            : itemData.precio;
        return total + (price * item.quantity);
    }, 0).toFixed(2);
}

// Esta función ahora enviará el payload completo a tu backend Node.js
async function sendPaymentToServer(orderPayload) { // <-- Ahora recibe el payload completo
    console.log('Enviando pedido a tu backend Node.js:', orderPayload);
    
    try {
        const response = await fetch(`${BACKEND}/send-pedido`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error del backend: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en sendPaymentToServer (frontend):', error);
        throw error;
    }
}

function createPaymentOverlay() {
    if (document.querySelector('.payment-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'payment-overlay';
    overlay.onclick = hidePaymentSection;
    document.body.appendChild(overlay);

    setTimeout(() => overlay.classList.add('active'), 10);
}

function removePaymentOverlay() {
    const overlay = document.querySelector('.payment-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

function injectPaymentStyles() {
    const styleId = 'payment-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Estilos generales de las notificaciones */
        .payment-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 14px 22px;
            border-radius: 12px;
            font-weight: 700;
            opacity: 0;
            transition: opacity 0.28s cubic-bezier(0.2,0,0,1), transform 0.28s cubic-bezier(0.2,0,0,1);
            z-index: 10002; /* sitúa la notificación por encima del overlay */
            box-shadow: 0 10px 30px rgba(12,24,36,0.18);
            max-width: 460px;
            min-width: 260px;
            text-align: left;
            display: flex;
            align-items: center;
            gap: 12px;
            backdrop-filter: blur(6px);
            border: 1px solid rgba(255,255,255,0.06);
            background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.96));
            color: var(--negro);
        }

        /* Professional notification layout */
        .payment-notification {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .payment-notification.show {
            opacity: 1;
            transform: translateX(-50%) translateY(-10px);
        }

        .payment-notification .notification-icon {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            flex-shrink: 0;
            background: rgba(255,255,255,0.92);
            box-shadow: 0 3px 10px rgba(12,24,36,0.08);
            color: var(--negro);
        }

        .payment-notification .notification-body {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .payment-notification .notification-title {
            font-size: 0.98rem;
            font-weight: 800;
            color: var(--negro);
            line-height: 1;
        }

        .payment-notification .notification-text {
            font-size: 0.9rem;
            color: rgba(12,24,36,0.8);
            line-height: 1.2;
            max-width: 360px;
        }

        /* Variants using project palette variables - use solid icon backgrounds for contrast */
        .payment-notification.info { border-color: rgba(21,101,192,0.12); }
        .payment-notification.info .notification-icon { background: var(--azul-destacado, #1565c0); color: #fff; }
        .payment-notification.success { border-color: rgba(46,125,50,0.12); }
        .payment-notification.success .notification-icon { background: var(--verde-oscuro, #2e7d32); color: #fff; }
        .payment-notification.error { border-color: rgba(198,40,40,0.12); }
        .payment-notification.error .notification-icon { background: var(--rojo-oscuro, #c62828); color: #fff; }
        .payment-notification.loading { border-color: rgba(255,206,18,0.12); }
        .payment-notification.loading .notification-icon { background: var(--botonA, #fdd835); color: #111; }

        /* Glyph inside the icon */
        .notification-glyph {
            font-size: 1.05rem;
            font-weight: 800;
            line-height: 1;
            display: inline-block;
        }

        /* Estilos del spinner de carga */
        .loading-spinner {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 4px solid rgba(255,255,255,0.35);
            border-top-color: currentColor; /* visible against colored icon background */
            animation: spin 0.8s linear infinite;
            box-sizing: border-box;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Superposición de pago para bloquear la interacción */
        .payment-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.6);
            z-index: 2999;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
            pointer-events: none;
        }

        .payment-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        /* Overlay específico para cuando se está procesando el pago */
        .processing-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.55);
            z-index: 9000; /* debajo de las notificaciones */
            opacity: 0;
            transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out;
            pointer-events: none;
            display: block;
        }

        .processing-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        /* Información del afiliado */
        .affiliate-info {
            background-color: #f8f9fa;
            font-weight: bold;
            text-align: center;
        }

        .affiliate-info td {
            padding: 10px;
            border-top: 1px solid #ddd;
            font-size: 14px;
        }

        /* Selector de código de país junto al teléfono */
        .phone-input-group {
            display: flex;
            align-items: stretch;
            gap: 8px;
            width: 100%;
        }

        .phone-input-group input[type="text"] {
            flex: 1 1 auto;
            min-width: 0;
        }

        .phone-country-select {
            flex: 0 0 auto;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            width: 128px;
            max-width: 42%;
            padding: 0 30px 0 12px;
            border-radius: 10px;
            border: 1px solid var(--borde, rgba(0,0,0,0.15));
            background-color: var(--fondo-input, #fff);
            color: var(--negro, #111);
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23555'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.855a.75.75 0 111.08 1.04l-4.24 4.41a.75.75 0 01-1.08 0l-4.24-4.41a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 8px center;
            background-size: 16px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .phone-country-select:hover {
            border-color: var(--azul-destacado, #1565c0);
        }

        .phone-country-select:focus {
            outline: none;
            border-color: var(--azul-destacado, #1565c0);
            box-shadow: 0 0 0 3px rgba(21,101,192,0.15);
        }

        /* Prefijo fijo (+53) para el teléfono de la persona que recibe */
        .phone-fixed-prefix {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 14px;
            border-radius: 10px;
            border: 1px solid var(--borde, rgba(0,0,0,0.15));
            background-color: var(--fondo-input-disabled, rgba(0,0,0,0.04));
            color: var(--negro, #111);
            font-size: 14px;
            font-weight: 700;
            white-space: nowrap;
        }

        @media (max-width: 480px) {
            .phone-input-group {
                flex-wrap: wrap;
            }

            .phone-country-select {
                width: auto;
                max-width: 100%;
                flex: 1 1 100%;
            }

            .phone-fixed-prefix {
                flex: 0 0 auto;
            }

            .phone-input-group input[type="text"] {
                flex: 1 1 100%;
            }
        }
    `;

    document.head.appendChild(style);
}
