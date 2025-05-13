async function fetchCities() {
    const username = 'projita_kar'; // Replace with your GeoNames username
    const url = `http://api.geonames.org/searchJSON?username=${username}&country=IN&maxRows=1000&style=SHORT`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        data.geonames.sort((a, b) => a.name.localeCompare(b.name));

        const citiesList = document.getElementById("citiesList");
        const filter=citiesList.getAttribute('data-filter');

        data.geonames.forEach(city => {
            const option = document.createElement("option");
            option.value = city.name; // City name
            option.textContent = city.name;
            if ( (city.name) === filter) {
                option.selected = true;
            }
            citiesList.appendChild(option);
        });

        // Initialize Choices.js for searchable dropdown
        
    } catch (error) {
        console.error("Error fetching cities:", error);

        // Handle errors by showing a fallback message
        const citiesList = document.getElementById("citiesList");
        citiesList.innerHTML = '';
        const errorOption = document.createElement("option");
        errorOption.value = '';
        errorOption.textContent = 'Unable to fetch cities. Please try again later.';
        errorOption.disabled = true;
        citiesList.appendChild(errorOption);
    }
}

// Fetch cities on page load
// Fetch cities on DOM content loaded
document.addEventListener("DOMContentLoaded", fetchCities);
