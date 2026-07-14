const CACHE_NAME = "classroom-hq-v41";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=41",
  "./app.js?v=41",
  "./manifest.json",
  "./icon.svg",
  "./assets/school-logo.png",
  "./assets/avatars/base-boy.png?v=21",
  "./assets/avatars/base-girl.png?v=21",
  "./assets/avatars/boy-summer-shirt.png?v=21",
  "./assets/avatars/girl-summer-shirt.png?v=21",
  "./assets/avatars/boy-summer-pe.png?v=21",
  "./assets/avatars/girl-summer-pe.png?v=21",
  "./assets/avatars/boy-summer-daily.png?v=21",
  "./assets/avatars/girl-summer-daily.png?v=21",
  "./assets/avatars/boy-spring-fall.png?v=21",
  "./assets/avatars/girl-spring-fall.png?v=21",
  "./assets/avatars/boy-cardigan.png?v=21",
  "./assets/avatars/girl-cardigan.png?v=21",
  "./assets/avatars/boy-winter.png?v=21",
  "./assets/avatars/girl-winter.png?v=21",
  "./assets/avatars/boy-winter-pe.png?v=21",
  "./assets/avatars/girl-winter-pe.png?v=21",
  "./assets/avatars/boy-class-tee.png?v=21",
  "./assets/avatars/girl-class-tee.png?v=21",
  "./assets/backgrounds/classroom.png?v=21",
  "./assets/backgrounds/school_summer.png?v=21",
  "./assets/backgrounds/library.png?v=21",
  "./assets/backgrounds/school_fall.png?v=21",
  "./assets/backgrounds/night.png?v=21",
  "./assets/backgrounds/school_winter.png?v=21",
  "./assets/backgrounds/school_spring.png?v=21",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isAppShell =
    request.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/styles.css") ||
    url.search.includes("v=40");

  if (isAppShell) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
