class PurchaseHistoryManager {
  constructor() {
    this.storageKey = 'cubanazo_purchase_history';
    this.maxOrders = 10;
  }

  getHistory() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error al leer historial de compras:', e);
      return [];
    }
  }

  saveHistory(history) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (e) {
      console.error('Error al guardar historial de compras:', e);
    }
  }

  buildItemsFromCart(cartSnapshot) {
    if (!Array.isArray(cartSnapshot)) return [];
    return cartSnapshot.map((cartItem) => {
      const isPack = Boolean(cartItem.isPack || cartItem.pack);
      const itemData = isPack ? cartItem.pack : cartItem.product;
      if (!itemData) return null;

      const unitPrice = itemData.oferta
        ? itemData.precio * (1 - (itemData.descuento || 0) / 100)
        : itemData.precio;

      const image = typeof getPackImageUrl === 'function' && typeof getProductImageUrl === 'function'
        ? (isPack ? getPackImageUrl(itemData.imagenes?.[0], 'thumb') : getProductImageUrl(itemData.imagenes?.[0], 'thumb'))
        : '';

      // Igual que en payment.js: si es un producto agrupado por variantes, el id
      // guardado puede ser el "group_..." ficticio de la UI, no el id real de Firebase.
      const realId = (!isPack && itemData.isGrouped && Array.isArray(itemData.variants))
        ? ((itemData.variants[itemData.currentVariant] || itemData.variants[0])?.id || itemData.originalId || itemData.id)
        : itemData.id;

      return {
        id: realId || null,
        name: itemData.nombre,
        quantity: cartItem.quantity,
        unitPrice: Number(unitPrice) || 0,
        type: isPack ? 'pack' : 'product',
        image
      };
    }).filter(Boolean);
  }

  addOrder(orderPayload, cartSnapshot) {
    const items = this.buildItemsFromCart(cartSnapshot);
    if (items.length === 0) return;

    const order = {
      orderNumber: orderPayload?.orderNumber || orderPayload?.pedidoId || `LOCAL-${Date.now()}`,
      date: orderPayload?.fecha_pedido || new Date().toISOString(),
      status: 'confirmado',
      total: Number(orderPayload?.precio_compra_total) || items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0),
      shipTo: orderPayload?.direccion_envio || '',
      buyerName: orderPayload?.nombre_comprador || '',
      items
    };

    const history = this.getHistory();
    history.unshift(order);
    if (history.length > this.maxOrders) {
      history.length = this.maxOrders;
    }
    this.saveHistory(history);
  }

  clearHistory() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error('Error al eliminar historial de compras:', e);
    }
  }

  formatDate(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return isoString || '';
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  // Igual que escapeHtml, pero también neutraliza comillas — usar cuando el
  // valor va dentro de un atributo HTML entre comillas dobles (alt="...").
  escapeAttr(text) {
    return this.escapeHtml(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  renderOrderCard(order) {
    const itemsHTML = order.items.map((item) => `
      <div class="ph-item">
        <img src="${item.image || 'Images/product-placeholder.svg'}" alt="${this.escapeAttr(item.name)}" class="ph-item-img" loading="lazy">
        <div class="ph-item-info">
          <p class="ph-item-name">${this.escapeHtml(item.name)}</p>
          <p class="ph-item-qty">Cantidad: ${item.quantity}</p>
          <p class="ph-item-price">$${(item.unitPrice * item.quantity).toFixed(2)}</p>
        </div>
        <button class="ph-buy-again-btn" onclick="purchaseHistoryManager.buyAgain('${encodeURIComponent(item.id || '')}', '${encodeURIComponent(item.name)}', '${item.type}')">
          <i class="fas fa-redo"></i> Volver a comprar
        </button>
      </div>
    `).join('');

    return `
      <div class="ph-order-card">
        <div class="ph-order-header">
          <div class="ph-order-header-item">
            <span class="ph-label">Pedido realizado</span>
            <span class="ph-value">${this.formatDate(order.date)}</span>
          </div>
          <div class="ph-order-header-item">
            <span class="ph-label">Total</span>
            <span class="ph-value">$${Number(order.total).toFixed(2)}</span>
          </div>
          <div class="ph-order-header-item ph-shipto">
            <span class="ph-label">Enviar a</span>
            <span class="ph-value">${this.escapeHtml(order.shipTo || 'N/A')}</span>
          </div>
          <div class="ph-order-header-item ph-order-number">
            <span class="ph-label">Pedido #</span>
            <span class="ph-value">${this.escapeHtml(order.orderNumber)}</span>
          </div>
        </div>
        <div class="ph-order-body">
          <div class="ph-order-status"><i class="fas fa-check-circle"></i> Pedido confirmado</div>
          ${itemsHTML}
        </div>
      </div>
    `;
  }

  renderHistory() {
    const container = document.getElementById('purchase-history-list');
    const emptyPanel = document.getElementById('purchase-history-empty');
    if (!container) return;

    const history = this.getHistory();

    if (history.length === 0) {
      container.innerHTML = '';
      if (emptyPanel) emptyPanel.style.display = 'flex';
      return;
    }

    if (emptyPanel) emptyPanel.style.display = 'none';
    container.innerHTML = history.map((order) => this.renderOrderCard(order)).join('');
  }

  buyAgain(encodedId, encodedName, type) {
    const id = safeDecodeURIComponent(encodedId);
    const name = safeDecodeURIComponent(encodedName);
    if (type === 'pack') {
      const pack = (typeof packs !== 'undefined' ? packs : []).find((p) => (id && String(p.id) === String(id)) || p.nombre === name);
      if (!pack) {
        showCartNotification('Este pack ya no está disponible', 1, 'error');
        return;
      }
      addPackToCart(encodeURIComponent(pack.nombre));
    } else {
      const list = typeof products !== 'undefined' ? products : [];
      const product = list.find((p) => (id && String(p.id) === String(id)) || p.nombre === name) ||
        list.flatMap((p) => (p.isGrouped ? p.variants : [])).find((v) => (id && String(v.id) === String(id)) || v.nombre === name);
      if (!product) {
        showCartNotification('Este producto ya no está disponible', 1, 'error');
        return;
      }
      addToCart(encodeURIComponent(product.nombre), false);
    }
  }

  toggle() {
    const panel = document.getElementById('purchase-history-sidebar');
    const overlay = document.getElementById('purchase-history-overlay');
    if (!panel) return;

    const isOpening = !panel.classList.contains('active');

    if (typeof closeCart === 'function') closeCart();
    if (typeof closeSidebar === 'function') closeSidebar();

    if (isOpening) {
      this.renderHistory();
      panel.classList.add('active');
      document.body.classList.add('purchase-history-open');
      if (!overlay) {
        const newOverlay = document.createElement('div');
        newOverlay.id = 'purchase-history-overlay';
        newOverlay.className = 'purchase-history-overlay';
        newOverlay.onclick = () => this.close();
        document.body.appendChild(newOverlay);
        setTimeout(() => newOverlay.classList.add('active'), 10);
      } else {
        overlay.classList.add('active');
      }
    } else {
      this.close();
    }
  }

  close() {
    const panel = document.getElementById('purchase-history-sidebar');
    const overlay = document.getElementById('purchase-history-overlay');

    if (panel) {
      panel.classList.remove('active');
      document.body.classList.remove('purchase-history-open');
    }

    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        if (overlay && !overlay.classList.contains('active')) {
          overlay.remove();
        }
      }, 300);
    }
  }
}

const purchaseHistoryManager = new PurchaseHistoryManager();

function togglePurchaseHistory() {
  purchaseHistoryManager.toggle();
}

function closePurchaseHistory() {
  purchaseHistoryManager.close();
}
