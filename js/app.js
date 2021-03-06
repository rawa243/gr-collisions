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

    var data,
        collisionsLayer,
        hexbinData,
        hexbinLayer;

    // AJAX request for GeoJSON data and csv data
    $.getJSON("data/gr-collisions1416_50mHexbin.json", function(hexbinData) {

        //Convert data and Error test for loading data
        omnivore.csv('data/gr-collisions1416.csv')
            .on('ready', function(e) {
              data = e.target.toGeoJSON()

              drawMap(data, hexbinData);
            })
            .on('error', function(e) {
                console.log(e.error[0].message);
        });

    });  // end of $.getJSON()

    // Load layer based on zoom level
    map.on('zoomend', function() {
        if (map.getZoom() <15){
            if (map.hasLayer(collisionsLayer)) {
                map.removeLayer(collisionsLayer);
                map.addLayer(hexbinLayer);
            } else if (map.hasLayer(hexbinLayer)) {
                console.log(map.getZoom()+ " Hexbin already active");
            } else {
                map.addLayer(hexbinLayer);
            }
        }
        if (map.getZoom() >= 15){
            if (map.hasLayer(collisionsLayer)){
                console.log(map.getZoom()+" Points already active");
            } else if(map.hasLayer(hexbinLayer)) {
                map.removeLayer(hexbinLayer);
                map.addLayer(collisionsLayer);
            } else {
                map.addLayer(collisionsLayer);
            }
        }
    })

    function drawPointsAndToolTips(data) {
        var options = {
            pointToLayer: function (feature, ll) {
                return L.circleMarker(ll, {
                    radius: 2,
                    opacity: 1,
                    weight: 1,
                })
            }
        }

        collisionsLayer = L.geoJson(data, options).addTo(map)

        // fit the bounds of the map to one of the layers
        map.fitBounds(collisionsLayer.getBounds());

        collisionsLayer.setStyle({
            color: '#9d4345'
        });

        retreiveInfo();
    }

    function drawHexbin(hexbinData) {
        hexbinLayer = L.geoJson(hexbinData, {
    				style: function(feature) {
    					return {
    						stroke: false,
    						fillOpacity: 0.8,
    						fillColor: '#1f78b4'
    					};
    				}
        }).addTo(map);

        // empty array to store all the data values
        var counts = [];
        // iterate through all the hexs
        hexbinData.features.forEach(function(hex) {
            // iterate through all the props of each hex
            for (var prop in hex.properties) {
                // if the attribute is a count
                if (prop == "count")  {
                    // push that attribute value into the array
                    counts.push(Number(hex.properties[prop]));
                }
            }
        });

        var breaks = chroma.limits(counts, 'k', 5);
        var colorize = chroma.scale(chroma.brewer.Reds).classes(breaks).mode('lab');

        hexbinLayer.eachLayer(function(layer) {
            var props = layer.feature.properties;
            layer.setStyle({
                fillColor: colorize(Number(props["count"]))
            });
        });

        drawLegend(breaks, colorize);
    }


    function drawLegend(breaks, colorize) {
        var legendControl = L.control({
            position: 'bottomright'
        });
        legendControl.onAdd = function(map) {
            var legend = L.DomUtil.create('div', 'legend');
            return legend;
        };
        legendControl.addTo(map);
        //  create legend text
        var legend = $('.legend').html("<h3>Total Collisions</h3><ul>");
        for (var i = 0; i < breaks.length - 1; i++) {
            var color = colorize(breaks[i], breaks);
            var classRange = '<li><span style="background:' + color + '"></span> ' +
                breaks[i].toLocaleString() + ' &mdash; ' +
                breaks[i + 1].toLocaleString() + '</li>'
            //  append the list item to list
            $('.legend ul').append(classRange);
        }
        //  close the unordered list
        legend.append("</ul>");
    }

    function drawBarCharts(data) {
        var killed_hash = {2013: 0, 2014: 0, 2015: 0, 2016: 0},
            injured_hash = {2013: 0, 2014: 0, 2015: 0, 2016: 0},
            collisions_hash = {2013: 0, 2014: 0, 2015: 0, 2016: 0};

        data.features.forEach(c => {
            killed_hash[c.properties.YEAR] += parseInt(c.properties.NUMOFKILL)
            injured_hash[c.properties.YEAR] += parseInt(c.properties.NUMOFINJ)
            collisions_hash[c.properties.YEAR] += 1
        })

        $('.yearspark').sparkline(Object.values(collisions_hash), {
            type: 'bar',
            barWidth: 50,
            width: '300px',
            height: '50px',
            barSpacing: 5,
            barColor: '#9d4345',
            zeroColor: '#ffffff',
            highlightSpotColor: false,
            tooltipFormat: '<span style="color: {{color}}">&#9679;</span></span><b>Year:</b> {{offset:names}}</br><b>Collisions:</b> {{value}}',
            tooltipValueLookups: {
                names: {
                    0: '',
                    1: '2014',
                    2: '2015',
                    3: '2016'
                }
            }
        });

        $('.killedspark').sparkline(Object.values(killed_hash), {
            type: 'bar',
            width: '300px',
            barWidth: 50,
            height: '50px',
            barSpacing: 5,
            barColor: '#9d4345',
            zeroColor: '#ffffff',
            highlightSpotColor: false,
            tooltipFormat: '<span style="color: {{color}}">&#9679;</span></span><b>Year:</b> {{offset:names}}</br><b>Deaths:</b> {{value}}',
            tooltipValueLookups: {
                names: {
                    0: '',
                    1: '2014',
                    2: '2015',
                    3: '2016'
                }
            }
        });

        $('.injuredspark').sparkline(Object.values(injured_hash), {
            type: 'bar',
            width: '300px',
            barWidth: 50,
            height: '50px',
            barSpacing: 5,
            barColor: '#9d4345',
            zeroColor: '#ffffff',
            highlightSpotColor: false,
            tooltipFormat: '<span style="color: {{color}}">&#9679;</span></span><b>Year:</b> {{offset:names}}</br><b>Injuries:</b> {{value}}',
            tooltipValueLookups: {
                names: {
                    0: '',
                    1: '2014',
                    2: '2015',
                    3: '2016'
                }
            }
        });


        var numOfCollisions = Object.values(collisions_hash).reduce((a, b) => a + b, 0);
        var numOfKilled = Object.values(killed_hash).reduce((a, b) => a + b, 0);
        var numOfInjured = Object.values(injured_hash).reduce((a, b) => a + b, 0);

        $('#totalCollisions').text(numberWithCommas(numOfCollisions))
        $('#totalKilled').text(numberWithCommas(numOfKilled))
        $('#totalInjured').text(numberWithCommas(numOfInjured))

    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function drawMap(data, hexbinData) {
        drawBarCharts(data);
        drawPointsAndToolTips(data);
        drawHexbin(hexbinData);
        drawFilter();
    }

    function drawFilter() {

        var legend = L.control({position: 'topright'});

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = '<select><option value="all">All Years</option><option value="2014">2014</option><option value="2015">2015</option><option value="2016">2016</option></select>';
            div.firstChild.onchange = function(event) {
              var selectedYear = event.target.value;
              if (selectedYear === '2014' || selectedYear === '2015' || selectedYear === '2016') {
                var filteredData = data.features.filter(row => row.properties.YEAR === selectedYear)
                var filtereDataComplete = { type: 'FeatureCollection', features: filteredData}
                map.removeLayer(collisionsLayer)
                drawPointsAndToolTips(filtereDataComplete)
              } else {
                map.removeLayer(collisionsLayer)
                drawPointsAndToolTips(data)
              }
            }

            return div;
        };

        legend.addTo(map);

    }

    function retreiveInfo() {
        // select the element and reference with variable
        // and hide it from view initially
        var info = $('#info').hide();

        // since collisionsLayer is on top, use to detect mouseover events
        collisionsLayer.on('mouseover', function (e) {

            // remove the none class to display and show
            info.show();

            // access properties of target layer
            var props = e.layer.feature.properties;

            // populate HTML elements with relevant info
            $('#info span').html(props.CRASHTYPE);
            $(".year span").html(props.YEAR);
            $(".cs span:last-child").html(props.CRASHSEVER);
            $(".hr span:last-child").html(props.HITANDRUN);
            $(".in span:last-child").html(props.NUMOFINJ);
            $(".ki span:last-child").html(props.NUMOFKILL);

            // raise opacity level as visual affordance
            e.layer.setStyle({
                fillOpacity: .6
            });

        });

        // hide the info panel when mousing off layergroup and remove affordance opacity
        collisionsLayer.on('mouseout', function(e) {

            // hide the info panel
            info.hide();

            // reset the layer style
            e.layer.setStyle({
                fillOpacity: 0
            });

        });

        // when the mouse moves on the document
        $(document).mousemove(function(e) {
            // first offset from the mouse position of the info window
            info.css({
                "left": e.pageX + 6,
                "top": e.pageY - info.height() - 25
            });

            // if it crashes into the top, flip it lower right
            if (info.offset().top < 4) {
                info.css({
                    "top": e.pageY + 15
                });
            }
            // if it crashes into the right, flip it to the left
            if (info.offset().left + info.width() >= $(document).width() - 40) {
                info.css({
                    "left": e.pageX - info.width() - 80
                });
            }
        });

    }

})();
