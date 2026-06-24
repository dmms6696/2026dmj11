const CACHE_NAME = "classroom-hq-v20";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=20",
  "./app.js?v=20",
  "./manifest.json",
  "./icon.svg",
  "./assets/school-logo.png",
  "./assets/avatars/base-boy.png",
  "./assets/avatars/base-girl.png",
  "./assets/avatars/boy-summer-shirt.png",
  "./assets/avatars/girl-summer-shirt.png",
  "./assets/avatars/boy-summer-pe.png",
  "./assets/avatars/girl-summer-pe.png",
  "./assets/avatars/boy-summer-daily.png",
  "./assets/avatars/girl-summer-daily.png",
  "./assets/avatars/boy-spring-fall.png",
  "./assets/avatars/girl-spring-fall.png",
  "./assets/avatars/boy-cardigan.png",
  "./assets/avatars/girl-cardigan.png",
  "./assets/avatars/boy-winter.png",
  "./assets/avatars/girl-winter.png",
  "./assets/avatars/boy-winter-pe.png",
  "./assets/avatars/girl-winter-pe.png",
  "./assets/avatars/boy-class-tee.png",
  "./assets/avatars/girl-class-tee.png",
  "./assets/backgrounds/classroom.png",
  "./assets/backgrounds/school_summer.png",
  "./assets/backgrounds/library.png",
  "./assets/backgrounds/school_fall.png",
  "./assets/backgrounds/night.png",
  "./assets/backgrounds/school_winter.png",
  "./assets/backgrounds/school_spring.png",
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
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
