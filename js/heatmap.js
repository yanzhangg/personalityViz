class Heatmap {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1200,
      containerHeight: _config.containerHeight || 1000,
      tooltipPadding: 15,
      margin: _config.margin || { top: 50, right: 50, bottom: 50, left: 120 },
      //   legendWidth: 160,
      //   legendBarHeight: 10,
    };
    this.data = _data;
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

    // Initialize scales
    // vis.colorScale = d3.scaleSequential().interpolator(d3.interpolateReds);
    vis.colorScale = d3
      .scaleOrdinal()
      .range(["#D92616", "#FF8989", "#BFBFC7", "#95E0AD", "#23A147"]);

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

    // Legend
    // vis.legend = vis.svg
    //   .append("g")
    //   .attr(
    //     "transform",
    //     `translate(${
    //       vis.config.containerWidth -
    //       vis.config.legendWidth -
    //       vis.config.margin.right
    //     },0)`
    //   );

    // vis.legendColorGradient = vis.legend
    //   .append("defs")
    //   .append("linearGradient")
    //   .attr("id", "linear-gradient");

    // vis.legendColorRamp = vis.legend
    //   .append("rect")
    //   .attr("width", vis.config.legendWidth)
    //   .attr("height", vis.config.legendBarHeight)
    //   .attr("fill", "url(#linear-gradient)");

    // vis.xLegendScale = d3.scaleLinear().range([0, vis.config.legendWidth]);

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

    // Group data per state (we get a nested array)
    // [['Alaska', [array with values]], ['Ala.', [array with values]], ...]
    // vis.groupedData = d3.groups(vis.data, (d) => d.state);

    // // Sort states by total case numbers (if the option is selected by the user)
    // if (vis.config.sortOption == "cases") {
    //   // Sum the case numbers for each state
    //   // d[0] is the state name, d[1] contains an array of yearly values
    //   vis.groupedData.forEach((d) => {
    //     d[3] = d3.sum(d[1], (k) => k.value);
    //   });

    //   // Descending order
    //   vis.groupedData.sort((a, b) => b[3] - a[3]);
    // }

    // Specificy accessor functions
    vis.xValue = (d) => d.ipip_O;
    vis.yValue = (d) => d.name;
    vis.colorValue = (d) => d.pref;

    // Set the scale input domains
    vis.colorScale.domain([1, 5]);
    vis.xScale.domain([7, 21]);
    vis.yScale.domain(movieGenres);

    vis.renderVis();
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

    // Append row label (y-axis)
    // rowEnter
    //   .append("text")
    //   .attr("class", "h-label")
    //   .attr("text-anchor", "end")
    //   .attr("dy", "0.85em")
    //   .attr("x", -8)
    //   .text(vis.yValue);

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

    // 2b) Diagonal lines for NA values
    // const cellNa = row
    //   .merge(rowEnter)
    //   .selectAll(".h-cell-na")
    //   .data((d) => d[1].filter((k) => k.value === null));

    // const cellNaEnter = cellNa
    //   .enter()
    //   .append("line")
    //   .attr("class", "h-cell-na");

    // cellNaEnter
    //   .merge(cellNa)
    //   .attr("x1", (d) => vis.xScale(vis.xValue(d)))
    //   .attr("x2", (d) => vis.xScale(vis.xValue(d)) + cellWidth)
    //   .attr("y1", vis.yScale.bandwidth())
    //   .attr("y2", 0);

    // Update axis
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }

  /**
   * Update colour legend
   */
  //   renderLegend() {
  //     const vis = this;

  //     // Add stops to the gradient
  //     // Learn more about gradients: https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient
  //     vis.legendColorGradient
  //       .selectAll("stop")
  //       .data(vis.colorScale.range())
  //       .join("stop")
  //       .attr("offset", (d, i) => i / (vis.colorScale.range().length - 1))
  //       .attr("stop-color", (d) => d);

  //     // Set x-scale and reuse colour-scale because they share the same domain
  //     // Round values using `nice()` to make them easier to read.
  //     vis.xLegendScale.domain(vis.colorScale.domain()).nice();
  //     const extent = vis.xLegendScale.domain();

  //     // Manually calculate tick values
  //     vis.xLegendAxis.tickValues([
  //       extent[0],
  //       parseInt(extent[1] / 3),
  //       parseInt((extent[1] / 3) * 2),
  //       extent[1],
  //     ]);

  //     // Update legend axis
  //     vis.xLegendAxisG.call(vis.xLegendAxis);
  //   }
}
