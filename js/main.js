function createMap() {
    var map = L.map('map').setView([41.881832, -87.623177], 11);

    var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    function highlightFeature(e) {
        var layer = e.target;

        // Set color for boundary of marker
        layer.setStyle({
            weight: 5,
            color: '#000000',
            fillOpacity: 0.7
        });

        var selectedIntersection = layer.feature.properties.INTERSECTION.substring(0, 20);
        layer.bindPopup(selectedIntersection);
        layer.openPopup();
    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        d3.selectAll("rect").style('fill', 'rgb(35, 57, 93)')
    }

    function clickFeature(e) {
        d3.selectAll('#plot').selectAll('svg').remove();
        var bar = d3.selectAll('#plot').append('svg').style('width', '100%').style('height', '100%');

        // var width = 25;
        // var height = 15;

        var width = document.getElementById('plot').clientWidth;
        var height = document.getElementById('plot').clientHeight;
        console.log(height);

        var g = bar.selectAll('.bar')
            .data([e.target.feature.properties.VIOLATIONS])
            .enter()
            .append('g')
            .attr('class', 'bar');
        
        var x = d3.scaleLinear().domain([1,50000]).range([0,400]);
        var xScale = d3.scaleLinear().range([0, 400]).domain([1, 50000]);

        // Bar
        g.append('rect')
            .style('stroke-width', '1')
            .style('stroke', 'rgb(0,0,0)')
            .style('fill', 'rgb(35, 57, 93)')
            .attr('x', 0)
            .attr('y', height / 4)
            .attr('height', 15)
            .attr('id', e.target.feature.properties.INTERSECTION)
            .transition()
            .duration(500)
            .attr('width', x(e.target.feature.properties.VIOLATIONS))
            .ease(d3.easeLinear);

        // Chart Scale
        g.append('g')
            .attr('class', 'scaleColor')
            .call(d3.axisBottom(xScale))
            .attr('transform', `translate(0, ${(height / 4) + 25})`);

        // Chart Label
        g.append('text')
            .style('fill', '#1b1c1c')
            .attr('x', 0)
            .attr('y', (height / 4) - 10)
            .text(e.target.feature.properties.INTERSECTION + ': ' + e.target.feature.properties.VIOLATIONS);
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: clickFeature
        });
    }

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#21409a",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5
    };

    var geojson = L.geoJson(violations, { onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
}

function init() {
    createMap();

    document.getElementById('dropdown').oninput = function() {
        createBarChart(this.value);
    }
}

window.onload = init;