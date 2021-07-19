const mainContainer = document.querySelector('#main');
const input = document.querySelector('#q');
const fetchBtn = document.querySelector('#fetch');

const countryName = document.querySelector('#country-name');
const stateName = document.querySelector('#name');
const currentTime = document.querySelector('#time');
const alertText = document.querySelector('#alert-text');

fetchBtn.addEventListener('click', getWeather);

input.addEventListener('keyup', (e) => {
    // submit ถ้า กด Enter เท่านั้น keyCode=13
    if (e.keyCode === 13) {
        getWeather();
    }
});

// ฟังก์ชัน รับข้อมูลสภาพอากาศ
async function getWeather() {
    const q = input.value;
    if (q.length < 2) return;

    // request and res
    const response = await fetch(`/getweather?q=${q}`);
    const data = await response.json();
    const { mapToken } = data;

    if (!data.location){
        alertText.textContent = 'Data not found!';
        clear();
        return
    }

    alertText.textContent = '';

    clear();

    // destructuring props ออกมา
    const { condition, last_updated, temp_c, temp_f } = data.current;
    const { country, name, lat, lon, localtime } = data.location;

    // ถ้า มี ลองติจูต และ แลตติจูต ก็ใช้ โชว์ map ออกมา
    if (lat && lon) showMap(lon, lat, data, mapToken);

    countryName.textContent = country;
    stateName.textContent = name;
    currentTime.textContent = `Current time: ${localtime}, Last updated: ${last_updated}`

    // คำสั่งสร้าง และ ยัด element เข้า parent 
    const icon = document.createElement('img');
    icon.classList.add('icon');
    icon.src = condition.icon;
    icon.title = condition.text;
    icon.alt = '';
    icon.style.width = '50px';

    const text = document.createElement('span');
    text.classList.add('icon');
    text.textContent = condition.text;

    const temp = document.createElement('p');
    temp.classList.add('icon');
    temp.append(`Temperature: ${temp_c} Celsius (${temp_f} Fahrenheit)`);

    const detailBox = document.querySelector('#detail');
    detailBox.appendChild(icon);
    detailBox.appendChild(text);
    const tempBox = document.querySelector('#tempBox');
    tempBox.appendChild(temp);
    delete data.mapToken;
    console.log(data);

    input.value = '';
}

// ฟังก์ชัน แสดงแผนที่ออกมา
function showMap(lng, lat, data, mapToken) {

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
    const marker1 = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([lng, lat])
        .addTo(map);

    map.on('load', function () {
        map.addSource('places', {
            // This GeoJSON contains features that include an "icon"
            // property. The value of the "icon" property corresponds
            // to an image in the Mapbox Streets style's sprite.
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'properties': {
                            'description':
                                `<strong>${data.location.name}, ${data.location.country}</strong>
                                <p>Temperature</p>
                                <p>${data.current.temp_c} Celsius (${data.current.temp_f} Fahrenheit) <a href="http://www.google.com/search?q=${data.location.name} weather" target="_blank" title="Opens in a new window">Search on Google</a></p>`,
                            'icon': 'theatre-15'
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [lng, lat]
                        }
                    }
                ]
            }
        });
        // Add a layer showing the places.
        map.addLayer({
            'id': 'places',
            'type': 'symbol',
            'source': 'places',
            'layout': {
                'icon-image': '{icon}',
                'icon-allow-overlap': true
            }
        });

        const popup = new mapboxgl.Popup({ closeOnClick: true })
            .setLngLat([lng, lat])
            .setHTML(`<strong>${data.location.name}, ${data.location.country}</strong>
                    <p>Temperature</p>
                    <p>${data.current.temp_c} Celsius (${data.current.temp_f} Fahrenheit) <a href="http://www.google.com/search?q=${data.location.name} weather" target="_blank" title="Opens in a new window">Search on Google</a></p>`)
            .addTo(map);

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on('click', 'places', function (e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = e.features[0].properties.description;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });

        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());

    });
}

// clear ส่วนแสดงผลข้อมูล
function clear(){
    // ถ้ามี icon อยู่แล้ว ลบออกซะก่อน ทุกอัน
    if (document.querySelectorAll('.icon')) document.querySelectorAll('.icon').forEach(ele => ele.remove());

    // ป้องกันการสร้างซ้อนกัน ถ้ามีอยู่ก็ลบทิ้งซะ
    if (document.querySelector('#map')) document.querySelector('#map').remove();

    countryName.textContent = '';
    stateName.textContent = '';
    currentTime.textContent = '';
    input.value = '';
}