// function loadData() {
//     d3.csv('data/data.csv').then((data) => {
//         let initialValue = data.map(d => ({
//             INDEX: d['INDEX'],
//             INTERSECTION: d['INTERSECTION'],
//             CAMERA: d['CAMERA'],
//             ID: d['ID'],
//             ADDRESS: d['ADDRESS'],
//             VIOLATIONS: d['VIOLATIONS'],
//             LATITUDE: d['LATITUDE'],
//             LONGITUDE: d['LONGITUDE'],
//             DAY: d['DAY']
//         }));

//         return initialValue;
//     })
// }

// var data = loadData();
var width = 500;
var height = 500;

function brushablePlot() {
    
    const initialValue = data;
  
    const margin = ({ top: 10, right: 20, bottom: 50, left: 105 })
    const height = 500
    const width = 500
  
    const svg = d3.selectAll('#brushPlot').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .property('value', initialValue)
  
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
  
    g.append('g').call(xAxis, xPlot, 'LONGITUDE')
    g.append('g').call(yAxis, yPlot, 'LATITUDE')
  
    const radius = 3
  
    const dots = g.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => xPlot(d.LONGITUDE))
        .attr('cy', d => yPlot(d.LATITUDE))
        .attr('fill', d => dayColors(d.DAY))
        .attr('opacity', 1)
        .attr('r', radius)
  
    const brush = d3.brush()
        .extent([
          [0, 0],
          [width, height]
        ])
        .on('brush', onBrush)
        .on('end', onEnd)
  
    g.append('g').call(brush)
  
    function onBrush(event) {
      const [[x1, y1], [x2, y2]] = event.selection;
  
      function isBrushed(d) {
        const cx = xPlot(d.LONGITUDE);
        const cy = yPlot(d.LATITUDE);
  
        return cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2;
      }
  
      dots.attr("fill", (d) => (isBrushed(d) ? colors(d.INTERSECTION) : "gray"));
  
      svg.property("value", data.filter(isBrushed)).dispatch("input");
    }
  
    function onEnd(event) {
      if (event.selection === null) {
        dots.attr("fill", (d) => colors(d.INTERSECTION));
        svg.property("value", initialValue).dispatch("input");
      }
    }
  
    return svg.node();
}

var xPlot = d3.scaleLinear()
    .domain(["-87.575292523", "-87.812781431"])
    .nice()
    .range([0, 500])

var yPlot = d3.scaleLinear()
    .domain(["41.677720829", "42.012371335"])
    .nice()
    .range([500, 0])

var xAxis = (g, scale, label) =>
  g.attr('transform', `translate(0, ${500})`)
      // add axis
      .call(d3.axisBottom(scale))
      // remove baseline
      .call(g => g.select('.domain').remove())
      // add grid lines
      // references https://observablehq.com/@d3/connected-scatterplot
      .call(g => g.selectAll('.tick line')
        .clone()
          .attr('stroke', '#d3d3d3')
          .attr('y1', -500)
          .attr('y2', 0))
    // add label
    .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .text(label)

var yAxis = (g, scale, label) => 
    // add axis
    g.call(d3.axisLeft(scale))
        // remove baseline
        .call(g => g.select('.domain').remove())
        // add grid lines
        // refernces https://observablehq.com/@d3/connected-scatterplot
        .call(g => g.selectAll('.tick line')
            .clone()
            .attr('stroke', '#d3d3d3')
            .attr('x1', 0)
            .attr('x2', width))
        // add label
        .append('text')
        .attr('x', -40)
        .attr('y', 500 / 2)
        .attr('fill', 'black')
        .attr('dominant-baseline', 'middle')
        .text(label)