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
    window.POS_STATE.online = false;
    console.log('Offline mode active');
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
