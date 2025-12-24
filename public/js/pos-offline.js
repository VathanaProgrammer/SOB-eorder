// pos-offline.js

// 1. Detect online/offline
window.POS_STATE = {
    online: navigator.onLine
};

window.addEventListener('online', () => {
    window.POS_STATE.online = true;
    console.log('Back online');
    updateOfflineBanner();
    updateOnlineIndicator();
});

window.addEventListener('offline', () => {
    console.log('Offline detected');
    window.POS_STATE.online = false;
    updateOfflineBanner();
    updateOnlineIndicator();
});

// 2. Show offline banner (optional)
function updateOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) {
        banner.classList.toggle('hidden', window.POS_STATE.online);
    }
}
updateOfflineBanner();

// 3. Show online/offline badge in header
function updateOnlineIndicator() {
    const el = document.getElementById('posOnlineState');
    if (!el) return;

    if (window.POS_STATE.online) {
        el.textContent = 'Online';
        el.classList.remove('bg-red-500');
        el.classList.add('bg-green-500');
    } else {
        el.textContent = 'Offline';
        el.classList.remove('bg-green-500');
        el.classList.add('bg-red-500');
    }
}
updateOnlineIndicator();

// 4. Livewire hook to prevent errors when offline
document.addEventListener('livewire:load', function () {
    Livewire.hook('message.failed', (message, component) => {
        if (!window.POS_STATE.online) {
            console.warn('Livewire call blocked due to offline mode:', message);
            return false; // Prevent Livewire error modal
        }
    });
});

// pos-offline.js

// Existing online/offline detection code...
// (your code already here)

// ------------------------------
// 5. Render KOT HTML offline
// ------------------------------
window.printOfflineKOT = function (orderData) {
    console.log('items from localStorage: ', orderData);

    if (!orderData || !orderData.items || orderData.items.length === 0) {
        console.warn('No items to print KOT.');
        return;
    }

    const kot = {
        restaurant: { name: orderData.restaurantName || 'Demo Restaurant' },
        kotNumber: orderData.kotNumber || (`OFF-${Date.now()}`),
        tokenNumber: orderData.tokenNumber || null,
        order: {
            number: orderData.order_number || `OFF-${Date.now()}`,
            table: orderData.table || '-',
            date: new Date(orderData.timestamp).toLocaleDateString(),
            time: new Date(orderData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            waiter: orderData.waiter || null,
            type: orderData.orderType || 'offline',
            pickupTime: orderData.pickupTime || null
        },
        items: orderData.items.map(i => ({
            name: i.name,
            variation: null,
            quantity: i.qty,
            modifiers: [],
            note: i.note || ''
        })),
        note: orderData.note || ''
    };

    const itemsHTML = kot.items.map(item => `
        <tr>
            <td class="description">
                ${item.name}${item.variation ? `<br><small>(${item.variation})</small>` : ''}
                ${item.modifiers.length ? item.modifiers.map(m => `<div class="modifiers">• ${m}</div>`).join('') : ''}
                ${item.note ? `<div class="modifiers"><strong>Note:</strong> ${item.note}</div>` : ''}
            </td>
            <td class="qty">${item.quantity}</td>
        </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<title>${kot.restaurant.name} - KOT Ticket</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:'DejaVu Sans', Arial, sans-serif; }
[dir="rtl"]{ text-align:right; } [dir="ltr"]{ text-align:left; }
.receipt { width:80mm; padding:6.35mm; page-break-after:always; }
.header{ text-align:center; margin-bottom:3mm; } .bold{ font-weight:bold; }
.restaurant-info{ font-size:9pt; margin-bottom:1mm; } 
.order-info{ text-align:center; border-top:1px dashed #000; border-bottom:1px dashed #000; padding:2mm 0; margin-bottom:3mm; font-size:10pt; }
.kot-title{ font-size:16pt; font-weight:bold; text-align:center; margin-bottom:2mm; }
.items-table{ width:100%; border-collapse:collapse; margin-bottom:3mm; font-size:10pt; }
.items-table th{ padding:1mm; border-bottom:1px solid #000; } 
.items-table td{ padding:1mm 0; vertical-align:top; } 
.qty{ width:12%; text-align:center; } .description{ width:88%; } 
.modifiers{ font-size:9pt; color:#555; } 
.footer{ text-align:center; margin-top:3mm; font-size:10pt; padding-top:2mm; border-top:1px dashed #000; } 
.italic{ font-style:italic; } .order-row{ width:100%; margin-bottom:5px; } 
.order-row table{ width:100%; border-collapse:collapse; } 
.order-left{ text-align:left; width:50%; } .order-right{ text-align:right; width:50%; }
@media print{ @page{ margin:0; size:80mm auto; } }
</style>
</head>
<body>
<div class="receipt">
    <div class="header">
        <div class="restaurant-info">${kot.restaurant.name}</div>
    </div>
    <div class="kot-title">
        KOT <span class="bold">#${kot.kotNumber}</span>
        ${kot.tokenNumber ? `<div style="font-size:14pt; margin-top:1mm;">Token #: <span class="bold">${kot.tokenNumber}</span></div>` : ''}
    </div>
    <div class="order-info">
        <div class="order-row">
            <table>
                <tr>
                    <td class="order-left"><span class="bold">${kot.order.number}</span></td>
                    <td class="order-right">Table: <span class="bold">${kot.order.table}</span></td>
                </tr>
            </table>
        </div>
        <div class="order-row">
            <table>
                <tr>
                    <td class="order-left">Date: ${kot.order.date}</td>
                    <td class="order-right">Time: ${kot.order.time}</td>
                </tr>
            </table>
        </div>
        ${kot.order.waiter ? `<div class="order-row"><table><tr><td class="order-left">Waiter: <span class="bold">${kot.order.waiter}</span></td><td class="order-right"></td></tr></table></div>` : ''}
    </div>
    <table class="items-table">
        <thead>
            <tr><th class="description">Item</th><th class="qty">Qty</th></tr>
        </thead>
        <tbody>
            ${itemsHTML}
        </tbody>
    </table>
    ${kot.note ? `<div class="footer"><strong>Special Instructions:</strong><div class="italic">${kot.note}</div></div>` : ''}
</div>
<script>
window.onload = function(){ window.print(); window.onafterprint=()=>window.close(); };
</script>
</body>
</html>
`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        console.error('Popup blocked, cannot print KOT.');
        return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
};

// ------------------------------
// 6. Use it in offline save
// ------------------------------
window.handleOfflineSaveOrder = function (orderType) {
    try {
        // Load items from your Alpine offline cart
        const offlineCart = JSON.parse(localStorage.getItem('offlineCart') || '[]');
        // Get restaurant info from localStorage
        const restaurantInfo = JSON.parse(localStorage.getItem('pos_restaurant_info')) || {
            name: 'Restaurant',
            logoUrl: '',
            table: '-'
        };



        const orderData = {
            restaurantName: restaurantInfo.name || 'Restaurant',
            kotNumber: null, // optional, can generate dynamic
            order_number: `OFF-${Date.now()}`,
            table: window.POS_TABLE || '-',
            items: offlineCart, // <-- THIS IS NOW YOUR REAL CART
            orderType,
            note: window.POS_NOTE || '',
            timestamp: new Date().toISOString(),
            waiter: window.POS_WAITER || null
        };

        // Save to localStorage
        let offlineOrders = JSON.parse(localStorage.getItem('pos_offline_orders') || '[]');
        offlineOrders.push(orderData);
        localStorage.setItem('pos_offline_orders', JSON.stringify(offlineOrders));

        // Print KOT immediately
        window.printOfflineKOT(orderData);
    } catch (err) {
        console.error('Failed to save offline order:', err);
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const onlineCart = document.getElementById('online-cart');
    const offlineCart = document.getElementById('offline-cart');

    function updateCartMode() {
        if (!onlineCart || !offlineCart) return; // safety check

        if (navigator.onLine) {
            onlineCart.classList.remove('hidden');
            offlineCart.classList.add('hidden');
        } else {
            onlineCart.classList.add('hidden');
            offlineCart.classList.remove('hidden');
            renderOfflineCart();
        }
    }

    window.addEventListener('online', updateCartMode);
    window.addEventListener('offline', updateCartMode);

    updateCartMode(); // initial run

    // Other functions that need to access offlineCart
    window.addOfflineItem = function(item) {
        const cart = getOfflineCart();
        cart.push(item);
        saveOfflineCart(cart);
        renderOfflineCart();
    };

    function renderOfflineCart() {
        const container = document.getElementById('offline-cart-items');
        const empty = document.getElementById('offline-empty');
        if(!empty){ console.log('empty does not exist.: ' )};
        if(!container){ console.log('container does not exist.: ' )};
        if (!container || !empty) return;

        const cart = getOfflineCart();
        container.innerHTML = '';

        if (!cart.length) {
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');

        cart.forEach(item => {
            container.innerHTML += `
            <div class="border rounded-md p-2 flex flex-col gap-2">
                <div class="flex justify-between">
                    <span class="text-xs">${item.name}</span>
                    <span class="text-xs font-bold">${item.price}</span>
                </div>
            </div>`;
        });
    }

    // And your offline cart helpers
    window.getOfflineCart = function() {
        return JSON.parse(localStorage.getItem('offlineCart') || '[]');
    };

    window.saveOfflineCart = function(cart) {
        localStorage.setItem('offlineCart', JSON.stringify(cart));
    };
});
