(function(){

    // initialize map, centered on Grand Rapids
    var map = L.map('map', {
        zoomSnap: .1,
        center: [42.96, -85.66],
        zoom: 11.9,
        minZoom: 10,
        maxZoom: 18,
        maxBounds: L.latLngBounds([42.5, -86.5], [43.5, -85])
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
    //Error test for loading data
    omnivore.csv('data/gr-collisions1416.csv')
        .on('ready', function(e) {
          drawMap(e.target.toGeoJSON());
        })
        .on('error', function(e) {
            console.log(e.error[0].message);
    });

    function drawMap(data) {

        var options = {
            pointToLayer: function (feature, ll) {
                return L.circleMarker(ll, {
                    radius: 2,
                    opacity: 1,
                    weight: 1,
                    fillOpacity: 1
                })
            }
        }

        var collisionsLayer = L.geoJson(data, options).addTo(map)

        // fit the bounds of the map to one of the layers
        map.fitBounds(collisionsLayer.getBounds());

        collisionsLayer.setStyle({
            color: 'red'
        });

        // enable slider UI and label
        sequenceUI(collisionsLayer, 2014);


    } // end drawMap()

    // function sequenceUI(collisionsLayer, currentYear) {
    //
    //     // create Leaflet control for the slider
    //     var sliderControl = L.control({
    //         position: 'bottomleft'
    //     });
    //
    //     sliderControl.onAdd = function (map) {
    //         var controls = L.DomUtil.get("slider");
    //
    //         L.DomEvent.disableScrollPropagation(controls);
    //         L.DomEvent.disableClickPropagation(controls);
    //
    //         return controls;
    //     }
    //
    //     sliderControl.addTo(map);
    //
    //     // create Leaflet control for the legend
    //     var sliderLabel = L.control({
    //         position: 'bottomleft'
    //     });
    //
    //
    //
    //     // when the control is added to the map
    //     sliderLabel.onAdd = function (map) {
    //
    //         // select the legend using id attribute of legend
    //         var label = L.DomUtil.get("label");
    //
    //         // disable scroll and click functionality
    //         L.DomEvent.disableScrollPropagation(label);
    //         L.DomEvent.disableClickPropagation(label);
    //
    //         // return the selection
    //         return label;
    //
    //     }
    //
    //     sliderLabel.addTo(map);
    //
    //     //select the slider's input and listen for change
    //     $('#slider input[type=range]')
    //         .on('input', function () {
    //             // current value of slider is current year
    //             var currentYear = this.value;
    //
    //             // populate HTML elements with relevant info
    //             $('#label span').html(currentYear);
    //         });
    //
    // }

    // function retreiveInfo(enrollLayer, currentYear) {
    //
    //     // select the element and reference with variable
    //     // and hide it from view initially
    //     var info = $('#info').hide();
    //
    //     // since boysLayer is on top, use to detect mouseover events
    //     collisionsLayer.on('mouseover', function (e) {
    //
    //         // remove the none class to display and show
    //         info.show();
    //
    //         // access properties of target layer
    //         var props = e.layer.feature.properties;
    //
    //         // populate HTML elements with relevant info
    //         $('#info span').html(props.CRASHTYPE);
    //         $(".year span").html(currentYear);
    //         $(".cs span:last-child").html(CRASHSEVER);
    //         $(".hr span:last-child").html(HITANDRUN);
    //         $(".in span:last-child").html(NUMOFINJ);
    //         $(".ki span:last-child").html(NUMOFKILL);
    //
    //         // raise opacity level as visual affordance
    //         e.layer.setStyle({
    //             fillOpacity: .6
    //         });
    //
    //     });
    //
    //     // hide the info panel when mousing off layergroup and remove affordance opacity
    //     collisionsLayer.on('mouseout', function(e) {
    //
    //         // hide the info panel
    //         info.hide();
    //
    //         // reset the layer style
    //         e.layer.setStyle({
    //             fillOpacity: 0
    //         });
    //
    //     });
    //
    //     // when the mouse moves on the document
    //     $(document).mousemove(function(e) {
    //         // first offset from the mouse position of the info window
    //         info.css({
    //             "left": e.pageX + 6,
    //             "top": e.pageY - info.height() - 25
    //         });
    //
    //         // if it crashes into the top, flip it lower right
    //         if (info.offset().top < 4) {
    //             info.css({
    //                 "top": e.pageY + 15
    //             });
    //         }
    //         // if it crashes into the right, flip it to the left
    //         if (info.offset().left + info.width() >= $(document).width() - 40) {
    //             info.css({
    //                 "left": e.pageX - info.width() - 80
    //             });
    //         }
    //     });
    //
    // }

})();
