const CACHE_NAME = 'lome-shop-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    OFFLINE_URL,
    '/favicon.ico',
    '/images/icon-192x192.png',
    '/images/icon-512x512.png',
];

// Install Event: cache offline fallback and core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[LoméShop SW] Pre-caching offline assets');
            return cache.addAll(PRECACHE_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate Event: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[LoméShop SW] Cleaning old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Handle GET requests only
    if (event.request.method !== 'GET') return;

    // Filter out non-http/https schemes (like chrome-extension://, file://, ws://, etc.)
    if (!event.request.url.startsWith('http')) return;

    // Skip Hot Module Replacement (HMR) and Vite dev server assets
    if (
        event.request.url.includes('@vite/client') || 
        event.request.url.includes('node_modules') || 
        event.request.url.includes('__vite_ping') ||
        event.request.url.includes('/hot')
    ) {
        return;
    }

    const url = new URL(event.request.url);

    // 1. Navigation requests (Pages/HTML) -> Network-First
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    // Update cache with the latest copy of the page
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    // Fallback to cache, otherwise to offline.html
                    return caches.match(event.request).then((cachedResponse) => {
                        return cachedResponse || caches.match(OFFLINE_URL);
                    });
                })
        );
        return;
    }

    // 2. Static Assets (JS, CSS, Images, Fonts) -> Cache-First
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                // Exclude invalid/error responses
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                    return networkResponse;
                }

                // Cache static assets dynamically (internal build files, images, google fonts)
                const isStaticAsset = 
                    url.pathname.startsWith('/build/') || 
                    url.pathname.startsWith('/images/') || 
                    url.pathname.startsWith('/storage/') ||
                    event.request.url.includes('fonts.bunny.net') ||
                    event.request.url.includes('fonts.googleapis.com') ||
                    event.request.url.includes('fonts.gstatic.com');

                if (isStaticAsset) {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }

                return networkResponse;
            }).catch(() => {
                // Silence fetch errors for missing static assets offline
                return new Response('Offline resource not cached.', { status: 503, statusText: 'Offline' });
            });
        })
    );
});
