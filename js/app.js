(function(){

    // initialize map, centered on Kenya
    var map = L.map('map', {
        zoomSnap: .1,
        center: [44.60, -85],
        zoom: 7,
        minZoom: 6,
        maxZoom: 9,
        maxBounds: L.latLngBounds([41.58, -90.84], [48.51, -80])
    });

    // mapbox API access Token
    var accessToken = 'pk.eyJ1Ijoid2F0a2luc3IiLCJhIjoia050eWFrZyJ9.9BL8TNdzWXq0sOy1fFKsXQ'

    // request a mapbox raster tile layer and add to map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + accessToken, {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.light',
        accessToken: accessToken
    }).addTo(map);

    //Add data to the map
    omnivore.csv('data/MI_CollegeEnrollment.csv').addTo(map);
    //Error test for loading data
    omnivore.csv('data/MI_CollegeEnrollment.csv')
        .on('ready', function(e) {
            console.log(e.target)
        })
        .on('error', function(e) {
            console.log(e.error[0].message);
    });

    // create Leaflet control for the legend
    var legendControl = L.control({
        position: 'topright'
    });

    // when the control is added to the map
    legendControl.onAdd = function (map) {

        // select the legend using id attribute of legend
        var legend = L.DomUtil.get("legend");

        // disable scroll and click functionality
        L.DomEvent.disableScrollPropagation(legend);
        L.DomEvent.disableClickPropagation(legend);

        // return the selection
        return legend;

    }

    legendControl.addTo(map);

    // do the same thing for the UI slider
    var sliderControl = L.control({
        position: 'bottomleft'
    });

    sliderControl.onAdd = function(map) {

        var controls = L.DomUtil.get("slider");

        L.DomEvent.disableScrollPropagation(controls);
        L.DomEvent.disableClickPropagation(controls);

        return controls;

    }

    sliderControl.addTo(map);


})();
