class Scatterplot {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 900,
      containerHeight: _config.containerHeight || 800,
      margin: _config.margin || { top: 50, right: 50, bottom: 50, left: 100 },
    };
    this.data = _data;
    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Initialize ordinal scale
    vis.xScale = d3.scalePoint().range([0, vis.width]);

    // Initialize categorical scale
    vis.yScale = d3.scaleBand().range([0, vis.height]);

    // Initialize colour scale
    vis.colorScale = d3
      .scaleOrdinal()
      .range(["#D92616", "#FF8989", "#BFBFC7", "#95E0AD", "#23A147"])
      .domain([1, 5]);

    // Initialize axes
    vis.xAxis = d3
      .axisTop(vis.xScale)
      .ticks(7)
      .tickSize(-vis.height - 10)
      .tickPadding(10);

    vis.yAxis = d3
      .axisLeft(vis.yScale)
      .ticks(21)
      .tickSize(0)
      .tickPadding(10)
      .tickFormat((d) => d.substring(0, d.length - 3));

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append("g").attr("class", "axis x-axis");
    // .attr("transform", `translate(0,${vis.height})`);

    // Append y-axis left group
    vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

    // Append axis titles
    vis.chart
      .append("text")
      .attr("class", "axis-title")
      .attr("y", vis.height + 30)
      .attr("x", 45)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Genre");

    vis.chart
      .append("text")
      .attr("class", "axis-title")
      .attr("y", -30)
      .attr("x", vis.width + 50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Big Five Personality Score");

    vis.svg
      .append("text")
      .attr("class", "chart-title")
      .attr("y", 17)
      .attr("dy", ".71em")
      .text("Genre Preference Based on Personality Score");
  }

  updateVis() {
    let vis = this;

    // Specify accessor functions
    vis.yValue = (d) => d.name;
    vis.xValue = (d) => d.ipip_O; //TODO: change to function
    vis.colorValue = (d) => d.pref;

    // Specify domain for y-axis
    vis.yScale.domain(movieGenres); //TODO: change this to a function
    vis.xScale.domain(ipipScores);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    // Add points

    vis.chart
      .selectAll(".dots")
      .data(vis.data)
      .join("g")
      .attr("class", "dots")
      .selectAll(".point")
      .data((d) => d.values)
      .join("circle")
      .attr("class", "point")
      .attr("r", 8)
      .attr("cy", (d) => vis.yScale(vis.yValue(d)))
      .attr("cx", (d) => vis.xScale(vis.xValue(d)))
      .attr("fill", (d) => vis.colorScale(vis.colorValue(d)))
      .attr("opacity", 0.35);

    vis.xAxisG.call(vis.xAxis).call((g) => g.select(".domain").remove());
    vis.yAxisG.call(vis.yAxis).call((g) => g.select(".domain").remove());
  }
}
