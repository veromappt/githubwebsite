// Predefined locations
const locations = {
    heidelberg: [49.4094, 8.6947],
    stockholm: [59.3293, 18.0686],
    oslo: [59.9139, 10.7522],
    gainesville: [29.6516, -82.3248],
    sydney: [-33.8688, 151.2093],
    ottawa: [45.4215, -75.6972]
};

// Predefined queries and chart attributes
const queries = {
    trees: {
        query: '["natural"="tree"]',
        chart1Attr: 'species',
        markerColor: "#228B22", 
        markerFill: "#32CD32"
    },
    streetlamps: {
        query: '["highway"="street_lamp"]',
        chart1Attr: 'lamp_type',
        markerColor: "#ecc700", 
        markerFill: "#FFD700" 
    },
};

let selectedQuery = 'trees';
let map = L.map('map').setView(locations.heidelberg, 14);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Initialize Chart.js charts
const chart1Ctx = document.getElementById('chart1').getContext('2d');


const chart1 = new Chart(chart1Ctx, {
    type: 'pie',
    data: { labels: [], datasets: [{ data: [], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
});

// Function to fetch and display elements from Overpass API
async function fetchElements() {
    const bbox = map.getBounds();
    const { query, chart1Attr, markerColor, markerFill } = queries[selectedQuery];

    const overpassQuery = `
        [out:json][timeout:25];
        (
            node${query}(${bbox.getSouth()},${bbox.getWest()},${bbox.getNorth()},${bbox.getEast()});
        );
        out body;
    `;

    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
    const data = await response.json();

    // Reset markers and data
    map.eachLayer(layer => { if (layer instanceof L.CircleMarker) map.removeLayer(layer); });

    const chart1Data = {};
    

    data.elements.forEach(element => {
        const lat = element.lat;
        const lon = element.lon;
        const tag1 = element.tags[chart1Attr];
    

        L.circleMarker([lat, lon], {
            radius: 4,
            weight: 2,
            color: markerColor,
            fillColor: markerFill,
            fillOpacity: 0.6,
        }).addTo(map);

        if (tag1) chart1Data[tag1] = (chart1Data[tag1] || 0) + 1;
    
    });

    document.getElementById('elementCount').textContent = data.elements.length;
    updateChart(chart1, chart1Data, chart1Attr);
    
}

// Function to update charts
function updateChart(chart, data, attrName) {
    const titleMap = {
        species: 'Species Pie Chart',
        'lamp_type': 'Lamp type Pie Chart',
    
    };

    chart.data.labels = Object.keys(data);
    chart.data.datasets[0].data = Object.values(data);
    chart.options.plugins.title = {
        display: true,
        text: titleMap[attrName] || 'Chart',
    };
    chart.update();
}

// Event listeners for dropdowns
document.getElementById('querySelect').addEventListener('change', e => {
    selectedQuery = e.target.value;
    fetchElements();
});

document.getElementById('locationSelect').addEventListener('change', e => {
    const location = e.target.value;
    map.setView(locations[location], 14);
    fetchElements();
});

// Fetch initial data
fetchElements();
map.on('moveend', fetchElements);