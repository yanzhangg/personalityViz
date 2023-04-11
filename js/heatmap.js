class Heatmap {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _trait) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1200,
      containerHeight: _config.containerHeight || 1000,
      tooltipPadding: 15,
      margin: _config.margin || { top: 50, right: 50, bottom: 250, left: 120 },
      legendWidth: 160,
      legendBarHeight: 10,
    };
    this.data = _data;
    this.trait = _trait;
    this.initVis();
  }

  initVis() {
    const vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.config.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.config.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      //   .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chartArea = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    vis.chart = vis.chartArea.append("g");

    var keys = ["Strongly Dislike", "Dislike", "Neutral", "Like", "Strongly Like"];
    var legendcolor = ["#D92616", "#FF8989", "#BFBFC7", "#95E0AD", "#23A147"];

    // Initialize scales
    // vis.colorScale = d3.scaleSequential().interpolator(d3.interpolateReds);
    vis.colorScale = d3
      .scaleOrdinal()
      .range(["#D92616", "#FF8989", "#BFBFC7", "#95E0AD", "#23A147"]);

    vis.legendScale = d3
      .scaleOrdinal()
      .domain(keys)
      .range(legendcolor);

    vis.chart.selectAll("rects")
      .data(keys)
      .enter()
      .append("rect")
        .attr("x", 10)
        .attr("y", function(d,i) { return 100 + i*(25) + 750})
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", function(d){ return vis.legendScale(d)})

    vis.chart.selectAll("label")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 100 + 20*1.2)
        .attr("y", function(d,i){ return 100 + i*(25) + (10) + 750}) 
        .style("fill", 'black')
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
    // vis.legendScale = d3.scaleLinear()
    // .range(["#D92616", "#FF8989", "#BFBFC7", "#95E0AD", "#23A147"]);

    vis.xScale = d3.scaleLinear().range([0, vis.config.width]);

    vis.yScale = d3.scaleBand().range([0, vis.config.height]).paddingInner(0.2);

    // Initialize x-axis
    vis.xAxis = d3.axisBottom(vis.xScale).ticks(6).tickSize(0).tickPadding(10);

    vis.yAxis = d3
      .axisLeft(vis.yScale)
      .tickSize(0)
      .tickPadding(10)
      .tickFormat((d) => d.substring(0, d.length - 3));

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chartArea
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vis.config.height})`);

    vis.yAxisG = vis.chartArea.append("g").attr("class", "axis y-axis");

    // Append axis titles
    vis.chart
      .append("text")
      .attr("class", "axis-title")
      .attr("y", 800)
      .attr("x", 600)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Personality Score");

    vis.chart
      .append("text")
      .attr("class", "axis-title")
      .attr("x", -55)
      .attr("y", -15)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Genre");

    vis.chart
      .append("text")
      .attr("class", "axis-title")
      .attr("y", 730)
      .attr("x", 150)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(`Low ${vis.trait}`);
    
    vis.chart
      .append("text")
      .attr("class", "axis-title")
      .attr("y", 730)
      .attr("x", 1000)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(`High ${vis.trait}`);

    // Legend
    
    // vis.legend = vis.svg
    //     .append("g")
    //     .attr(
    //       "transform",
    //       `translate(${
    //         vis.config.containerWidth -
    //         vis.config.legendWidth -
    //         vis.config.margin.right
    //       },0)`
    //     );

    // vis.legendColorGradient = vis.legend
    //   .append("defs")
    //   .append("linearGradient")
    //   .attr("id", "linear-gradient");

    // vis.legendColorRamp = vis.legend
    //   .append("rect")
    //   .attr("width", vis.config.legendWidth)
    //   .attr("height", vis.config.legendBarHeight)
    //   .attr("fill", "url(#linear-gradient)");

    // vis.xLegendScale = d3.scaleQuantize().range([0, vis.config.legendWidth]);

    // vis.xLegendAxis = d3
    //   .axisBottom(vis.xLegendScale)
    //   .tickSize(vis.config.legendBarHeight + 3)
    //   .tickFormat(d3.format("d"));

    // vis.xLegendAxisG = vis.legend
    //   .append("g")
    //   .attr("class", "axis x-axis legend-axis");

    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    const vis = this;
  
    // Specificy accessor functions
    vis.xValue = (d) => d[vis.trait];
    vis.yValue = (d) => d.name;
    vis.colorValue = (d) => d.pref;

    // Set the scale input domains

    // let maxNum = 0;
    // let minNum = 1000;
    // console.log(vis.data);
    // vis.data[0].values.forEach(function (object) {
    //   if (Math.max(...Object.values(object).slice(1)) > maxNum) {
    //     maxNum = Math.max(...Object.values(object).slice(1));
    //   }
    //   if (Math.min(...Object.values(object).slice(1)) < minNum) {
    //     minNum = Math.min(...Object.values(object).slice(1));
    //   }
    // });
    
    // Find domain for xScale
    let max = 0;
    let min = 100;
    vis.data.forEach(d => {
      let d_max = d3.max(d.values, d => d[vis.trait]);
      if (d_max > max) {
         max = d_max;
      }
      let d_min = d3.min(d.values, d => d[vis.trait]);
      if (d_min < min) {
         min = d_min;
      }
    });
    vis.colorScale.domain([1, 5]);
    vis.xScale.domain([min, max+1]);
    vis.yScale.domain(movieGenres);

    vis.renderVis();
    vis.renderLegend();
  }
  /**
   * Bind data to visual elements.
   */
  renderVis() {
    const vis = this;

    const cellWidth =
      vis.config.width / (vis.xScale.domain()[1] - vis.xScale.domain()[0]) - 2;

    // 1. Level: rows
    const row = vis.chart.selectAll(".h-row").data(vis.data, (d) => d);

    // Enter
    const rowEnter = row.enter().append("g").attr("class", "h-row");

    // Enter + update
    rowEnter
      .merge(row)
      .transition()
      .duration(1000)
      .attr("transform", (d) => `translate(0,${vis.yScale(vis.yValue(d))})`);

    // Exit
    row.exit().remove();

    // 2. Level: columns

    // 2a) Actual cells
    const cell = row
      .merge(rowEnter)
      .selectAll(".h-cell")
      .data((d) => d.values);

    // Enter
    const cellEnter = cell.enter().append("rect").attr("class", "h-cell");

    // Enter + update
    cellEnter
      .merge(cell)
      .attr("height", vis.yScale.bandwidth())
      .attr("width", cellWidth)
      .attr("x", (d) => vis.xScale(vis.xValue(d)))
      .attr("fill", (d) => {
        return vis.colorScale(vis.colorValue(d));
      });
    //   .on("mouseover", (event, d) => {
    //     const value =
    //       d.value === null
    //         ? "No data available"
    //         : Math.round(d.value * 100) / 100;
    //     d3
    //       .select("#tooltip")
    //       .style("display", "block")
    //       .style("left", event.pageX + vis.config.tooltipPadding + "px")
    //       .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
    //           <div class='tooltip-title'>${d.state}</div>
    //           <div>${d.year}: <strong>${value}</strong></div>
    //         `);
    //   })
    //   .on("mouseleave", () => {
    //     d3.select("#tooltip").style("display", "none");
    //   });

    // Update axis
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
    
    // vis.chart.select('.legendLinear')
    // .call(vis.legendLinear);
  }

  /**
   * Update colour legend
   */
    renderLegend() {
      const vis = this;

      // Add stops to the gradient
      // vis.legendColorGradient
      //   .selectAll("stop")
      //   .data(vis.legendScale.range())
      //   .join("stop")
      //   .attr("offset", (d, i) => i / (vis.legendScale.range().length - 1))
      //   .attr("stop-color", (d) => d);

      // vis.legendColorGradient
      //   .style("fill", function(d,i) {
      //     return vis.legendScale(i);
      //   })

      // Set x-scale and reuse colour-scale because they share the same domain
      // Round values using `nice()` to make them easier to read.
      // vis.xLegendScale.domain(vis.legendScale.domain()).nice();
      // const extent = vis.xLegendScale.domain();

      // // Manually calculate tick values
      // vis.xLegendAxis.tickValues([
      //   extent[0],
      // parseInt(extent[1] / 3),
      // parseInt((extent[1] / 3) * 2),
      // extent[1]
      // ]);

      // Update legend axis
      //vis.xLegendAxisG.call(vis.xLegendAxis);
    }
}
