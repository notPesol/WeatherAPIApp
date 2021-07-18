async function getWeather() {
    const input = document.querySelector('#q');
    const q = input.value;

    if (q.length < 2) return;

    const response = await fetch(`/getweather?q=${q}`);
    const data = await response.json();
    const { mapToken } = data;

    if(!data.location) return
    
    const { country, name, lat, lon } = data.location;

    if(lat && lon) showMap(lon, lat, mapToken);

    document.querySelector('#country-name').textContent = country;
    document.querySelector('#name').textContent = name;
    input.value = '';

    delete data.mapToken;
    console.log(data);
}

document.querySelector('#fetch').addEventListener('click', getWeather);

const mainContainer = document.querySelector('#main');

function showMap(lng, lat, mapToken) {
    // ป้องกันการสร้างซ้อนกัน
    if (document.querySelector('#map')) document.querySelector('#map').remove();   
    
    const mapContainer = document.createElement('div');
    mapContainer.id = 'map';

    mainContainer.appendChild(mapContainer);
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [lng, lat], // starting position [lng, lat]
        zoom: 9 // starting zoom
    });

    // Create a default Marker and add it to the map.
    const marker1 = new mapboxgl.Marker({ color: 'red'})
        .setLngLat([lng, lat])
        .addTo(map);

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());
}