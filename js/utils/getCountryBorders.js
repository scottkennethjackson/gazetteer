fetch('../json/countryBorders.geo.json')
  .then(response => response.json())
  .then(data => {
    const countrySelect = document.getElementById('country-select');

    let countries = data.features.map(feature => feature.properties.name);

    countries.sort((a, b) => a.localeCompare(b));

    countries.forEach(countryName => {
      const option = document.createElement('option');
      option.value = countryName;
      option.textContent = countryName;
      countrySelect.appendChild(option);
    });
  })
.catch(error => console.error('Error loading JSON:', error));
