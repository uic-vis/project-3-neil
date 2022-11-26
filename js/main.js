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

function createBarChart(aggregation) {
    switch(aggregation) {
        case 'Year':
          let chartYear = BarChart(violationsperyear, {
            x: d => d.YEAR,
            y: d => d.VIOLATIONS,
            xDomain: d3.groupSort(violationsperyear, ([d]) => -d.VIOLATIONS, d => d.YEAR),
            color: 'steelblue',
            xLabel: 'Year',
            yLabel: 'Violations',
            width: 800,
            height: 600,
            marginLeft: 80,
            xPadding: 0.3
          })
          return chartYear
        
        case 'Month':
          let chartMonth = BarChart(violationspermonth, {
            x: d => d.MONTH,
            y: d => d.VIOLATIONS,
            xDomain: d3.groupSort(violationspermonth, ([d]) => -d.VIOLATIONS, d => d.MONTH),
            color: 'steelblue',
            xLabel: 'Month',
            yLabel: 'Violations',
            width: 800,
            height: 600,
            marginLeft: 80,
            xPadding: 0.3
          })
          return chartMonth
        
        case 'Day':
          let chartDay = BarChart(violationsperday, {
            x: d => d.DAY,
            y: d => d.VIOLATIONS,
            xDomain: d3.groupSort(violationsperday, ([d]) => -d.VIOLATIONS, d => d.DAY),
            color: 'steelblue',
            xLabel: 'Day',
            yLabel: 'Violations',
            width: 800,
            height: 600,
            marginLeft: 80,
            xPadding: 0.3
          })
          return chartDay
          
      }
}

function init() {
    createMap();
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/bar-chart
function BarChart(data, {
    x = (d, i) => i, // given d in data, returns the (ordinal) x-value
    y = d => d, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    marginTop = 20, // the top margin, in pixels
    marginRight = 0, // the right margin, in pixels
    marginBottom = 30, // the bottom margin, in pixels
    marginLeft = 40, // the left margin, in pixels
    width = 640, // the outer width of the chart, in pixels
    height = 400, // the outer height of the chart, in pixels
    xDomain, // an array of (ordinal) x-values
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // y-scale type
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    xPadding = 0.1, // amount of x-range to reserve to separate bars
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    color = "currentColor" // bar fill color
  } = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
  
    // Compute default domains, and unique the x-domain.
    if (xDomain === undefined) xDomain = X;
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    xDomain = new d3.InternSet(xDomain);
  
    // Omit any data not present in the x-domain.
    const I = d3.range(X.length).filter(i => xDomain.has(X[i]));
  
    // Construct scales, axes, and formats.
    const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);
  
    // Compute titles.
    if (title === undefined) {
      const formatValue = yScale.tickFormat(100, yFormat);
      title = i => `${X[i]}\n${formatValue(Y[i])}`;
    } else {
      const O = d3.map(data, d => d);
      const T = title;
      title = i => T(O[i], i, data);
    }
  
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));
  
    const bar = svg.append("g")
        .attr("fill", color)
      .selectAll("rect")
      .data(I)
      .join("rect")
        .attr("x", i => xScale(X[i]))
        .attr("y", i => yScale(Y[i]))
        .attr("height", i => yScale(0) - yScale(Y[i]))
        .attr("width", xScale.bandwidth());
  
    if (title) bar.append("title")
        .text(title);
  
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);
  
    return svg.node();
  }

window.onload = init;