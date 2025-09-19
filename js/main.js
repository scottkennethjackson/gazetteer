import { getCountryBorders } from "./utils/getCountryBorders.js";
import { fetchCountryInfo } from "./utils/countryInfo.js";
import { fetchCountryMoney } from "./utils/countryMoney.js";
import { fetchCountryHealth } from "./utils/countryHealth.js";
import { fetchCountryNews } from "./utils/countryNews.js";
import { fetchCountryWeather } from "./utils/countryWeather.js";
import { fetchCountryPlaces } from "./utils/countryPlaces.js";

let geoData = null;
let spatialIndex = null;
let locationIdentified = false;
let countrySelected = false;
let userMarker = null;
let countryLayer = null;
window.userCoords = null;

const countrySelect = document.getElementById("country-select");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalGreeting = document.getElementById("modal-greeting");

const infoSection = document.getElementById("info");
const moneySection = document.getElementById("money");
const healthSection = document.getElementById("health");
const newsSection = document.getElementById("news");
const weatherSection = document.getElementById("weather");

const map = L.map("map").setView([0, 0], 3);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  minZoom: 3,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const infoIcon = `<img src="./assets/icons/info.svg" class="p-1" alt="Info icon">`;
const moneyIcon = `<img src="./assets/icons/money.svg" class="p-1" alt="Money icon">`;
const healthIcon = `<img src="./assets/icons/health.svg" class="p-1" alt="Health icon">`;
const newsIcon = `<img src="./assets/icons/news.svg" class="p-1" alt="News icon">`;
const weatherIcon = `<img src="./assets/icons/weather.svg" class="p-1" alt="Weather icon">`;
const locationIcon = `<img src="./assets/icons/location.svg" class="p-1" alt="Location icon">`;

const infoBtn = L.easyButton(`${infoIcon}`, function () {
  showData(info);
}).addTo(map);
const moneyBtn = L.easyButton(`${moneyIcon}`, function () {
  showData(money);
}).addTo(map);
const healthBtn = L.easyButton(`${healthIcon}`, function () {
  showData(health);
}).addTo(map);
const newsBtn = L.easyButton(`${newsIcon}`, function () {
  showData(news);
}).addTo(map);
const weatherBtn = L.easyButton(`${weatherIcon}`, function () {
  showData(weather);
}).addTo(map);

L.easyButton(`${locationIcon}`, () => getLocation()).addTo(map);

let lastFocusedButton = null;
const easyButtons = [infoBtn, moneyBtn, healthBtn, newsBtn, weatherBtn];

easyButtons.forEach((btn) => {
  btn.button.setAttribute("data-modal-target", "modal");
  btn.button.setAttribute("data-modal-toggle", "modal");
  btn.button.addEventListener("click", () => {
    lastFocusedButton = btn.button;
  });
});

const redMarkerIcon = L.icon({
  iconUrl: "./assets/markers/marker-icon-2x-red.png",
  shadowUrl: "./assets/markers/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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

async function init() {
  geoData = await getCountryBorders();
  if (!geoData) return;

  populateCountryDropdown(geoData);
  spatialIndex = buildSpatialIndex(geoData);
  getLocation();
}

init();

function populateCountryDropdown(geoData) {
  if (!countrySelect) return;

  let countries = geoData.features.map((feature) => feature.properties.name);
  countries.sort((a, b) => a.localeCompare(b));

  countries.forEach((countryName) => {
    const option = document.createElement("option");
    option.value = countryName;
    option.textContent = countryName;
    countrySelect.appendChild(option);
  });
}

function showData(selectedCategory) {
  const categories = [infoSection, moneySection, healthSection, newsSection, weatherSection];

  if (locationIdentified || countrySelected) {
    categories.forEach((category) => category.classList.add("hidden"));
    selectedCategory.classList.remove("hidden");
  } else {
    modalTitle.innerHTML = "Welcome to Gazetteer";
    modalGreeting.classList.remove("hidden");
    categories.forEach((category) => category.classList.add("hidden"));
  }
}

function highlightCountry(countryName) {
  if (countryLayer) {
    map.removeLayer(countryLayer);
  }

  const countryFeature = geoData.features.find(
    (feature) => feature.properties.name === countryName
  );
  if (!countryFeature) return null;

  countryLayer = L.geoJSON(countryFeature, {
    style: {
      color: "#1F5D2A",
      weight: 2,
      opacity: 1,
      fillColor: "#1F5D2A",
      fillOpacity: 0.1,
    },
  }).addTo(map);

  map.flyToBounds(countryLayer.getBounds(), {
    padding: [50, 50],
    maxZoom: 5,
    duration: 1.5,
  });

  return countryFeature;
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function success(position) {
  locationIdentified = true;
  const userLatitude = position.coords.latitude;
  const userLongitude = position.coords.longitude;

  window.userCoords = [userLongitude, userLatitude];

  if (userMarker) {
    map.removeLayer(userMarker);
  }

  userMarker = L.marker([userLatitude, userLongitude], {
    icon: redMarkerIcon,
  }).addTo(map);

  userMarker.bindPopup("You are here").openPopup();

  if (geoData && spatialIndex) {
    const userCountry = findCountryFast(
      userLatitude,
      userLongitude,
      geoData,
      spatialIndex
    );

    if (userCountry) {
      const userFeature = geoData.features.find(
        (feature) => feature.properties.name === userCountry
      );

      if (userFeature) {
        highlightCountry(userCountry);
        updateModalFlag(userFeature);
        updateModalHeader(userCountry);

        fetchCountryInfo(userCountry).then((countryData) => {
          if (countryData) {
            fetchCountryMoney(countryData);
            fetchCountryHealth(countryData);
            fetchCountryNews(countryData);
            fetchCountryWeather(userLatitude, userLongitude, userCountry);
            fetchCountryPlaces(countryData.cca2.toLowerCase(), map);
          }
        });
      }
    }
  }
}

function error() {
  locationIdentified = false;
  map.setView([0, 0], 3);
  alert("Sorry, no position available.");
}

function buildSpatialIndex(geoData) {
  const index = new RBush();
  const items = geoData.features.map((f, i) => {
    const bbox = turf.bbox(f);
    return {
      minX: bbox[0],
      minY: bbox[1],
      maxX: bbox[2],
      maxY: bbox[3],
      id: i,
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
    maxY: lat,
  });

  for (const candidate of candidates) {
    const feature = geoData.features[candidate.id];
    if (turf.booleanPointInPolygon(point, feature)) {
      return feature.properties.name;
    }
  }

  return null;
}

countrySelect.addEventListener("change", function () {
  const selectedCountry = this.value;
  if (!selectedCountry) return;

  countrySelected = true;

  const selectedFeature = highlightCountry(selectedCountry);
  if (!selectedFeature) return;

  modalTitle.innerHTML = `${selectedCountry}`;

  updateModalHeader(selectedCountry);
  updateModalFlag(selectedFeature);
  fetchCountryInfo(selectedCountry).then((countryData) => {
    if (countryData) {
      const countryCenter = turf.centerOfMass(selectedFeature).geometry.coordinates;

      fetchCountryMoney(countryData);
      fetchCountryHealth(countryData);
      fetchCountryNews(countryData);
      fetchCountryWeather(countryCenter[1], countryCenter[0], selectedCountry);
      fetchCountryPlaces(countryData.cca2.toLowerCase(), map);
    }
  });

  if (!window.userCoords) return;

  const userCountry = findCountryFast(
    window.userCoords[1], // latitude
    window.userCoords[0], // longitude
    geoData,
    spatialIndex
  );

  if (userCountry && userCountry === selectedCountry) {
    return;
  }

  const userPoint = turf.point(window.userCoords);
  const countryCenter = turf.centerOfMass(selectedFeature).geometry.coordinates;
  const distanceMiles = turf.distance(userPoint, turf.point(countryCenter), {
    units: "miles",
  });

  const formattedMiles = distanceMiles.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits:1,
  });

  L.popup()
    .setLatLng([countryCenter[1], countryCenter[0]])
    .setContent(
      `${selectedCountry} is ${formattedMiles} miles from your current location`
    )
    .openOn(map);
});

function updateModalFlag(countryFeature) {
  const flagImg = document.getElementById("modal-flag");
  if (!flagImg) return;

  const countryCode = countryFeature.properties.iso_a2?.toLowerCase();

  if (countryCode && countryCode !== "-99") {
    flagImg.src = `https://flagcdn.com/w320/${countryCode}.png`;
    flagImg.alt = `Flag of ${countryFeature.properties.name}`;
    flagImg.classList.remove("hidden");
  } else {
    flagImg.classList.add("hidden");
  }
}

function updateModalHeader(countryName) {
  if (modalTitle) modalTitle.textContent = countryName;
  if (modalGreeting) modalGreeting.classList.add("hidden");
}
