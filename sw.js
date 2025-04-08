// Service Worker for ShopTrack Invoice Viewer
// This helps protect the API endpoint and improve security/performance

const CACHE_NAME = 'shoptrack-cache-v1';
const API_URL = 'https://shoptrack-w8wu.onrender.com/api'; // Replace with your actual API domain

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css', 
  '/script.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - intercept network requests
self.addEventListener('fetch', event => {
  // Only handle API requests that should be proxied
  if (event.request.url.includes('/api/public-invoice')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Handle API requests - proxy them to hide the actual API URL
async function handleApiRequest(request) {
  try {
    // Extract the query parameters
    const url = new URL(request.url);
    const params = url.searchParams;
    
    // Create a new request to the actual API
    const apiUrl = new URL('/api/public-invoice/', API_URL);
    
    // Copy over the query parameters
    params.forEach((value, key) => {
      apiUrl.searchParams.append(key, value);
    });
    
    // Make the request to the actual API
    const response = await fetch(apiUrl.toString(), {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        // Add any additional headers needed
      },
      // Don't send credentials to third-party sites
      credentials: 'same-origin'
    });
    
    // Clone the response before reading it
    const responseToCache = response.clone();
    
    // Cache the response for future use
    caches.open(CACHE_NAME).then(cache => {
      cache.put(request, responseToCache);
    });
    
    return response;
  } catch (error) {
    // Return a generic error response to avoid exposing details
    return new Response(JSON.stringify({ 
      error: 'An error occurred while processing your request.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}