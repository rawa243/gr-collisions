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

    var data;
    var collisionsLayer;
    //Add data to the map
    //Error test for loading data
    omnivore.csv('data/gr-collisions1416.csv')
        .on('ready', function(e) {
          data = e.target.toGeoJSON()

          killed_hash = { 2014: 0, 2015: 0, 2016: 0}
          injured_hash = { 2014: 0, 2015: 0, 2016: 0}
          collisions_hash = { 2014: 0, 2015: 0, 2016: 0}
          data.features.forEach(c => {
            killed_hash[c.properties.YEAR] += parseInt(c.properties.NUMOFKILL)
            injured_hash[c.properties.YEAR] += parseInt(c.properties.NUMOFINJ)
            collisions_hash[c.properties.YEAR] += 1
          })
  
          $('.yearspark').sparkline(Object.values(collisions_hash), {
              type: 'bar',
              barWidth: 70,
              width: '300px',
              height: '50px',
              barSpacing: 10,
              barColor: '#9d4345'
          });

          $('.killedspark').sparkline(Object.values(killed_hash), {
              type: 'bar',
              width: '300px',
              barWidth: 70,
              height: '50px',
              barSpacing: 10,
              barColor: '#9d4345'
          });

          $('#totalCollisions').text(Object.values(collisions_hash).reduce((a, b) => a + b, 0))
          $('#totalKilled').text(Object.values(killed_hash).reduce((a, b) => a + b, 0))
          $('#totalInjured').text(Object.values(injured_hash).reduce((a, b) => a + b, 0))

          drawMap(data);
        })
        .on('error', function(e) {
            console.log(e.error[0].message);
    });

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

      retreiveInfo()

    }

    function drawMap(data) {
      drawPointsAndToolTips(data);
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

            // empty arrays for boys and girls values
            var collisionValues = [],
                killedValues = [];

            // loop through the years and push values into those arrays
            for (var i = 1; i <= 3; i++) {
                collisionValues.push(props.YEAR['C' + i]);
                killedValues.push(props.YEAR['K' + i]);
            }

            // $('.yearspark').sparkline([50,130,90,150], {
            //     type: 'bar',
            //     width: '300px',
            //     height: '50px',
            //     barSpacing: 10,
            //     barColor: '#9d4345'
            // });
            //
            // $('.killedspark').sparkline(killedValues, {
            //     type: 'bar',
            //     width: '300px',
            //     height: '50px',
            //     barSpacing: 10,
            //     barColor: '#9d4345'
            // });

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
