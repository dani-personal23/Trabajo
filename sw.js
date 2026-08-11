const CACHE_NAME = "candidaturas-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Estrategia "stale-while-revalidate": la app se abre AL INSTANTE con la
   copia guardada (nunca depende de que la red responda a tiempo), y en
   segundo plano se descarga la version mas reciente para la proxima vez. */
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((cached) => {
        const network = fetch(event.request)
          .then((response) => {
            if (response && response.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", response.clone()));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
