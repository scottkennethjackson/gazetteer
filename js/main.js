const map = L.map('map').setView([0, 0], 3);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 3,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const infoIcon = `<img src="./assets/icons/info.svg" class="p-1" alt="Info icon">`;
const moneyIcon = `<img src="./assets/icons/money.svg" class="p-1" alt="Money icon">`;
const healthIcon = `<img src="./assets/icons/health.svg" class="p-1" alt="Health icon">`;
const newsIcon = `<img src="./assets/icons/news.svg" class="p-1" alt="News icon">`;
const weatherIcon = `<img src="./assets/icons/weather.svg" class="p-1" alt="Weather icon">`;
const locationIcon = `<img src="./assets/icons/location.svg" class="p-1" alt="Location icon">`;

L.easyButton(`${infoIcon}`, function(btn, map){
    helloPopup.setLatLng(map.getCenter()).openOn(map);
}).addTo(map);

L.easyButton(`${moneyIcon}`, function(btn, map){
    helloPopup.setLatLng(map.getCenter()).openOn(map);
}).addTo(map);

L.easyButton(`${healthIcon}`, function(btn, map){
    helloPopup.setLatLng(map.getCenter()).openOn(map);
}).addTo(map);

L.easyButton(`${newsIcon}`, function(btn, map){
    helloPopup.setLatLng(map.getCenter()).openOn(map);
}).addTo(map);

L.easyButton(`${weatherIcon}`, function(btn, map){
    helloPopup.setLatLng(map.getCenter()).openOn(map);
}).addTo(map);

L.easyButton(`${locationIcon}`, function() {
    getLocation()
}).addTo(map);

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function success(position) {
    const userLatitude = position.coords.latitude;
    const userLongitude = position.coords.longitude;
    const displayLatitude = Math.trunc(userLatitude * 10000) / 10000;
    const displayLongitude = Math.trunc(userLongitude * 10000) / 10000;
    const userLocation = L.marker([userLatitude, userLongitude]).addTo(map);

    map.setView([userLatitude, userLongitude], 5);
    userLocation.bindPopup(`<b>You are here...</b><br>Latitude: ${displayLatitude}<br>Longitude: ${displayLongitude}`);
}

function error() {
  map.setView([0, 0], 3);
  alert("Sorry, no position available.");
}

window.getLocation();
