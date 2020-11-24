// Different browsers can have different names for the indexedDB object, so we standardize that here
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;

//create  database to work with
const request = indexedDB.open("budgetTracker", 1);

// Set up object store
request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore("offline", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
  db = target.result;
  // check if app is online before reading
  if (navigator.onLine) {
    checkDatabase();
  }
};


request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

// save data to the indexedDb
function saveRecord(record) {
  const transaction = db.transaction(["offline"], "readwrite");
  const store = transaction.objectStore("offline");
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["offline"], "readwrite");
  const store = transaction.objectStore("offline");
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => {        
        return response.json();
      })
      .then(() => {
        // DELETE THE RECORD IF THIS IS SUCCESSFUL.
        const transaction = db.transaction(["offline"], "readwrite");
        const store = transaction.objectStore("offline");
        store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);