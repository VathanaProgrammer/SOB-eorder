// pos-offline.js

// 1. Detect online/offline
window.POS_STATE = {
    online: navigator.onLine
};

window.addEventListener('online', () => {
    window.POS_STATE.online = true;
    console.log('Back online');
});

window.addEventListener('offline', () => {
    window.POS_STATE.online = false;
    console.log('Offline mode active');
});

// 2. Show offline banner (optional)
function updateOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) {
        banner.classList.toggle('hidden', window.POS_STATE.online);
    }
}
window.addEventListener('online', updateOfflineBanner);
window.addEventListener('offline', updateOfflineBanner);
updateOfflineBanner();

// 3. Livewire hook to prevent errors when offline
document.addEventListener('livewire:load', function () {
    Livewire.hook('message.failed', (message, component) => {
        if (!window.POS_STATE.online) {
            console.warn('Livewire call blocked due to offline mode:', message);
            return false; // Prevent Livewire error modal
        }
    });
});
