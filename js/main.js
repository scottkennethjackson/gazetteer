import { getCountryBorders } from './utils/getCountryBorders.js';

let geoData = null;
let spatialIndex = null;

async function init() {
  geoData = await getCountryBorders();
  if (!geoData) return;
  spatialIndex = buildSpatialIndex(geoData);
}

init();

const map = L.map('map').setView([0, 0], 3);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 3,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const info = document.getElementById("info");
const infoIcon = `<img src="./assets/icons/info.svg" class="p-1" alt="Info icon">`;
const infoBtn = L.easyButton(`${infoIcon}`, function() {
  showData(info)
}).addTo(map);

const money = document.getElementById("money");
const moneyIcon = `<img src="./assets/icons/money.svg" class="p-1" alt="Money icon">`;
const moneyBtn = L.easyButton(`${moneyIcon}`, function(){
  showData(money)
}).addTo(map);

const health = document.getElementById("health");
const healthIcon = `<img src="./assets/icons/health.svg" class="p-1" alt="Health icon">`;
const healthBtn = L.easyButton(`${healthIcon}`, function(){
  showData(health)
}).addTo(map);

const news = document.getElementById("news");
const newsIcon = `<img src="./assets/icons/news.svg" class="p-1" alt="News icon">`;
const newsBtn = L.easyButton(`${newsIcon}`, function(){
  showData(news)
}).addTo(map);

const weather = document.getElementById("weather");
const weatherIcon = `<img src="./assets/icons/weather.svg" class="p-1" alt="Weather icon">`;
const weatherBtn = L.easyButton(`${weatherIcon}`, function(){
  showData(weather)
}).addTo(map);

function showData(selectedCategory) {
  const categories = [info, money, health, news, weather];
  categories.forEach(category => category.classList.add("hidden"));
  selectedCategory.classList.remove("hidden");
}

let lastFocusedButton = null;

const easyButtons = [infoBtn, moneyBtn, healthBtn, newsBtn, weatherBtn];
easyButtons.forEach(btn => {
  btn.button.setAttribute("data-modal-target", "modal");
  btn.button.setAttribute("data-modal-toggle", "modal");
  btn.button.addEventListener("click", () => {
    lastFocusedButton = btn.button;
  });
});

const modal = document.getElementById("modal");

const observer = new MutationObserver(() => {
  const isHidden = modal.classList.contains("hidden");

  if (!isHidden) {
    modal.removeAttribute("inert");
  } else {
    modal.setAttribute("inert", "");
    if (lastFocusedButton) {
      lastFocusedButton.focus();
    }
  }
});

observer.observe(modal, { attributes: true, attributeFilter: ["class"] });

const locationIcon = `<img src="./assets/icons/location.svg" class="p-1" alt="Location icon">`;
L.easyButton(`${locationIcon}`, () => getLocation()).addTo(map);

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

  const userLocation = L.marker([userLatitude, userLongitude]).addTo(map);
  map.setView([userLatitude, userLongitude], 5);

  const truncLatitude = (Math.trunc(userLatitude * 10000) / 10000).toFixed(4);
  const truncLongitude = (Math.trunc(userLongitude * 10000) / 10000).toFixed(4);
  userLocation.bindPopup(`<b>You are here...</b><br>Latitude: ${truncLatitude}<br>Longitude: ${truncLongitude}`);

  if (geoData && spatialIndex) {
    const userCountry = findCountryFast(userLatitude, userLongitude, geoData, spatialIndex);
    if (userCountry) {
      console.log(`You are in ${userCountry}`);
    } else {
      console.log("Couldn't determine your country.");
    }
  }
}

function error() {
  map.setView([0, 0], 3);
  alert("Sorry, no position available.");
}

function buildSpatialIndex(geoData) {
  const index = new RBush();

  const items = geoData.features.map((feature, i) => {
    const bbox = turf.bbox(feature);
    return {
      minX: bbox[0],
      minY: bbox[1],
      maxX: bbox[2],
      maxY: bbox[3],
      id: i
    };
  });

  index.load(items);
  return index;
}

function findCountryFast(lat, lng, geoData, index) {
  const point = turf.point([lng, lat]);

  const candidates = index.search({
    minX: lng,
    minY: lat,
    maxX: lng,
    maxY: lat
  });

  for (const candidate of candidates) {
    const feature = geoData.features[candidate.id];
    if (turf.booleanPointInPolygon(point, feature)) {
      return feature.properties.name;
    }
  }

  return null;
}

getLocation();
