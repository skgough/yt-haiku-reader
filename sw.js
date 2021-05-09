self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('yt-haiku').then((cache) => cache.addAll([
            'index.html',
            'style.css',
            'fonts.css',
            'script.js',
            'functions.js',
            'switch-input/switch-input.js',
        ])),
    );
});

self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request)),
    );
});
