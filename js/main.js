function createMap() {
    var map = L.map('map').setView([41.881832, -87.623177], 12);

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
        // console.log('Selected Intersection: ' + selectedIntersection);
        // d3.selectAll("#"+selectedIntersection).style('fill', 'rgb(120,50,50)')

        layer.bindPopup(selectedIntersection);
        layer.openPopup();
        // layer.bringToFront();
    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        d3.selectAll("rect").style('fill', 'rgb(200,200,200)')
    }

    function clickFeature(e) {
        console.log('click registered', e.target.feature.properties.VIOLATIONS);
        d3.selectAll('#plot').selectAll('svg').remove();
        var bar = d3.selectAll('#plot').append('svg').style('width', '100%').style('height', '100%');

        var width = 25;
        var height = 15;
        // console.log(violations['features']);
        var g = bar.selectAll('.bar')
            .data([e.target.feature.properties.VIOLATIONS])
            .enter()
            .append('g')
            .attr('class', 'bar');
        
        var x = d3.scaleLog().domain([1,50000]).range([0,400]);
        // console.log(x(10));
        var xScale = d3.scaleLinear().range([0, 400]).domain([1, 50000]);

        g.append('rect')
            .style('stroke-width', '1')
            .style('stroke', 'rgb(0,0,0)')
            .style('fill', 'rgb(200,200,200)')
            .attr('x', 0)
            .attr('y', 250)
            .attr('width', x(e.target.feature.properties.VIOLATIONS))
            .attr('height', height)
            .attr('id', e.target.feature.properties.INTERSECTION);

        g.append('g')
            .call(d3.axisBottom(xScale))
            .attr('transform', `translate(0, 275)`);

        g.append('text')
            .attr('x', 0)
            .attr('y', 225)
            .text(e.target.feature.properties.INTERSECTION)
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: clickFeature
        });

        // layer.bindPopup(feature.properties.INTERSECTION);
        
    }

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var geojson = L.geoJson(violations, { onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
    // L.geoJson(violations, { onEachFeature: onEachFeature }).addTo(map);
}

function createBarChart() {

    var barChart = d3.selectAll('#plot').append('svg').style('width', '100%').style('height', '100%');
    var width = 25;
    var height = 15;
    // console.log(violations['features']);
    var g = barChart.selectAll('.bar')
        .data(violations['features'])
        .enter()
        .append('g')
        .attr('class', 'bar');
    
    var x = d3.scaleLog().domain([1,50000]).range([0,200]);
    // console.log(x(10));

    g.append('rect')
        .style('stroke-width', '1')
        .style('stroke', 'rgb(0,0,0)')
        .style('fill', 'rgb(200,200,200)')
        .attr('x', 200)
        .attr('y', (d,i) => {return 5+(height+5)*i})
        .attr('width', (d,i) => {return x(d['properties']['VIOLATIONS'])})
        .attr('height', height)
        .attr('id', (d,i) => {
            return d['properties']['INTERSECTION'].substring(0, 50)
        })

    g.append('text')
        .attr('x', 0)
        .attr('y', (d,i) => {return 15+(height+5)*i})
        .text((d,i) => {return d['properties']['INTERSECTION'].substring(0, 20);})

}

function init() {
    createMap();
}

window.onload = init;