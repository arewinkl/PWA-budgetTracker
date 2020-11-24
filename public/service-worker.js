//CACHE FOR IMAGES, AND FOR DATA SPECIFIC ITEMS.
const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

//ARRAY OF URLS THAT PWA SHOULD CACHE.
const urlsToCache = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.json",
  "/styles.css",
  "/assets/images/icon-192x192.png",
  "/assets/images/icon-512x512.png"
];

// FOR WHEN USER INSTALS THE WEB APP LOCALLY.
self.addEventListener("install", function(event) {
  // INITIAL STEPS.
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

//LISTEN FOR THE API CALL BEING MADE.
self.addEventListener("fetch", function(event) {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {

        // IF NO INTERNET CONNECTION, RUN. 
        return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })

          // CATCH FOR NO INTERNET CONNECTION.
          .catch(err => {
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  //HANDLES HOME PAGE CALLS.
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
          //RETURN THE CACHE, FOR ALL HTML PAGE REQ.
        }
      });
    })
  );
});