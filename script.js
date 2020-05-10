// Make map
mapboxgl.accessToken =
    "pk.eyJ1Ijoic2lha2FyYW1hbGVnb3MiLCJhIjoiY2s5bXo4dXVrMTZsczNrcGhremVjdmprYSJ9.IdrQnWUp4D1wBnWxh6T9ow";
const initialZoom = 13

// Make points
const geojson = {
    type: "FeatureCollection",
    features: [ {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [-92.03662276268005, 30.20527090230507]
        },
        properties: {
            title: "New Home",
            description: "This is the house that I want to move to."
        }
    },
    {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [-92.04824209213255, 30.22809169259424]
        },
        properties: {
            title: "Old Home",
            description: "This is where I currently live."
        }
    } ]
};

// Make center
function getCenter(geojson) {
    let lats = []
    let longs = []
    geojson.features.forEach(element => {
        lats = [...lats, element.geometry.coordinates[0]]
        longs = [...longs, element.geometry.coordinates[1]]
    });
    centerLats = (Math.max(...lats) - Math.min(...lats)) / 2 + Math.min(...lats)
    centerLongs = (Math.max(...longs) - Math.min(...longs)) / 2 + Math.min(...longs)
    return [centerLats, centerLongs]
}

// Make style
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/outdoors-v11",
    center: getCenter(geojson),
    zoom: initialZoom
});

// Make nav
const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-left');

// Decorate
function renderMap() {
    
    // Add the geojson data points
    map.addSource("points", {
        type: "geojson",
        data: geojson
    });

    // Add a symbol layer for the geojson data.
    map.addLayer({
        id: "symbols",
        type: "symbol",
        source: "points",
        layout: {
        "icon-image": "castle-15",
        "icon-size": 3,
        }
    });

    //On click, popup with description HTML from its properties.
    map.on('click', 'symbols', function (e) {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const {description, title} = e.features[0].properties;
        const html = `<h3>${title}</h3><p>${description}</p><button id="zoom-in">Zoom in</button><button id="zoom-out">Zoom out</button>`

        // Adjust for zoomed out look
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Re-center the map to symbol
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(html)
            .addTo(map);
        [].slice.call(document.querySelectorAll('#zoom-in')).pop().onclick = function () {
            map.zoomTo(17, { duration: 9000 });
        };
        [].slice.call(document.querySelectorAll('#zoom-out')).pop().onclick = function () {
            map.zoomTo(initialZoom, { duration: 9000 });
        };
    });

    // Change the cursor to a pointer when the mouse is over the symbols layer.
    map.on('mouseenter', 'symbols', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'symbols', function () {
        map.getCanvas().style.cursor = '';
    });

    //Change water colors
    var swatches = document.getElementById('swatches');
    var layer = document.getElementById('layer');
    var colors = [
        '#bd0026'
    ];
    //Change water colors
    colors.forEach(function(color) {
        var swatch = document.createElement('button');
        swatch.style.backgroundColor = color;
        swatch.addEventListener('click', function() {
            map.setPaintProperty(layer.value, 'fill-color', color);
        });
        swatches.appendChild(swatch);
    });

}

//Finish map
map.on('load', renderMap)
map.on("click", "symbols", function (e) {
    map.flyTo({ center: e.features[0].geometry.coordinates });
});