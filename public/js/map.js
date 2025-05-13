// /js/map.js

function initLeafletMap() {
    var address = document.getElementById('map').getAttribute('data-address');

    if (address) {
        // Prevent re-initialization
        if (document.getElementById('map').dataset.mapInitialized === "true") return;
        document.getElementById('map').dataset.mapInitialized = "true";

        var map = L.map('map').setView([20.5937, 78.9629], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        var encodedAddress = encodeURIComponent(address);
        var geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;

        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    var latLng = [data[0].lat, data[0].lon];
                    map.setView(latLng, 13);
                    L.marker(latLng).addTo(map).bindPopup("Company's Location").openPopup();
                } else {
                    alert("Location not found!");
                }
            })
            .catch(error => console.error("Error geocoding address:", error));
    } else {
        console.error("Address not found in the data-* attribute.");
    }
}
