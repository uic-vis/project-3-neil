function barChart() {
    const margin = ({ top: 10, right: 20, bottom: 50, left: 105 })
    
    const svg = d3.selectAll('#dayplot').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', 500 + margin.top + margin.bottom)
  
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
  
    const x = d3.scaleLinear()
        .range([0, width])
  
    const y = d3.scaleBand()
        .domain(dayColors.domain())
        .range([0, 500])
        .padding(0.2)
  
    const xAxis = d3.axisBottom(x).tickSizeOuter(0)
  
    const xAxisGroup = g.append('g')
        .attr('transform', `translate(0, ${500})`)
  
    xAxisGroup.append('text')
        .attr('x', width / 2)
        .attr('y', 40)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .text('Count')
  
    const yAxis = d3.axisLeft(y)
  
    const yAxisGroup = g.append('g')
        .call(yAxis)
        .call(g => g.select('.domain').remove())
  
    let barsGroup = g.append('g')
  
    function update(data) {
    //   console.log(data);
      const originCounts = d3.rollup(
        data,
        group => d3.sum(group, x => x.properties.VIOLATIONS),
        d => d.properties.DAY
      )
  
      x.domain([0, d3.max(originCounts.values())]).nice()
  
      const t = svg.transition()
          .ease(d3.easeLinear)
          .duration(200)
  
      xAxisGroup.transition(t)
          .call(xAxis)
  
      barsGroup.selectAll('rect')
          .data(originCounts)
          .join('rect')
            .attr('fill', ([origin, count]) => dayColors(origin))
            .attr('height', y.bandwidth())
            .attr('x', 0)
            .attr('y', ([origin, count]) => y(origin))
          .transition(t)
            .attr('width', ([origin, count]) => x(count))
    }
  
    return Object.assign(svg.node(), { update })
  }