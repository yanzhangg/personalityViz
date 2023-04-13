class Heatmap {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _trait, _media) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1300,
      containerHeight: _config.containerHeight || 1000,
      tooltipPadding: 15,
      margin: _config.margin || { top: 20, right: 200, bottom: 100, left: 150 },
      legendWidth: 160,
      legendBarHeight: 10,
    };
    this.data = _data;
    this.trait = _trait;
    this.media = _media;
    this.initVis();
  }

  /**
   * Create scales, axes, and append static elements
   */
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

    // Create legend
    var keys = [
      "Strongly Dislike",
      "Dislike",
      "Neutral",
      "Like",
      "Strongly Like",
    ];

    var legendcolor = ["#D92616", "#FF8989", "#BFBFC7", "#95E0AD", "#23A147"];
    vis.legendScale = d3.scaleOrdinal().domain(keys).range(legendcolor);

    vis.chart
      .selectAll("rects")
      .data(keys)
      .enter()
      .append("rect")
      .attr("x", 1010)
      .attr("y", function (d, i) {
        return 30 + i * 25;
      })
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", function (d) {
        return vis.legendScale(d);
      });

    vis.chart
      .selectAll("label")
      .data(keys)
      .enter()
      .append("text")
      .attr("x", 1010 + 20 * 1.3)
      .attr("y", function (d, i) {
        return 30 + i * 25 + 10;
      })
      .style("fill", "black")
      .text(function (d) {
        return d;
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");

    vis.chart
      .append("text")
      .attr("class", "legend-title")
      .attr("y", function (d, i) {
        return 5 + i * 25;
      })
      .attr("x", 1130)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Media Preference");

    // Initialize scales
    vis.colorScale = d3
      .scaleOrdinal()
      .range(["#D92616", "#FF8989", "#BFBFC7", "#95E0AD", "#23A147"]);

    vis.xScale = d3.scaleLinear().range([0, vis.config.width]);

    vis.yScale = d3.scaleBand().range([0, vis.config.height]).paddingInner(0.2);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale).ticks(8).tickSize(0).tickPadding(10);

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
      .attr("y", 930)
      .attr("x", 530)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Personality Score");

    vis.chart
      .append("text")
      .attr("class", "axis-title")
      .attr("x", -55)
      .attr("y", 5)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Genre");

    vis.chart
      .append("text")
      .attr("class", "axis-title")
      .attr("y", 910)
      .attr("x", 120)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(`Extremely Low`);

    vis.chart
      .append("text")
      .attr("class", "axis-title")
      .attr("y", 910)
      .attr("x", 930)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(`Extremely High`);

    // Add personality annotation
    vis.personalityLine = vis.chartArea
      .append("line")
      .attr("class", "personality-line")
      .attr("id", "highlight")
      .attr("opacity", 0);

    vis.personalityLabel = vis.chartArea
      .append("text")
      .attr("class", "personality-label")
      .attr("id", "personality-label")
      .attr("text-anchor", "middle")
      .attr("y", -20)
      .attr("dy", "0.85em")
      .attr("opacity", 0)
      .text("Your personality score");

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

    // Find domain for xScale
    let max = 0;
    let min = 100;
    vis.data.forEach((d) => {
      let d_max = d3.max(d.values, (d) => d[vis.trait]);
      if (d_max > max) {
        max = d_max;
      }
      let d_min = d3.min(d.values, (d) => d[vis.trait]);
      if (d_min < min) {
        min = d_min;
      }
    });

    // Set the scales for input domain
    vis.colorScale.domain([1, 5]);
    vis.xScale.domain([min, max + 1]);
    vis.yScale.domain(vis.media == "movies" ? movieGenres : bookGenres);

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
      .attr("transform", (d) => `translate(0,${vis.yScale(vis.yValue(d))})`);

    // Exit
    row.exit().remove();

    // 2. Level: columns
    // 2a) Cells
    const cell = row
      .merge(rowEnter)
      .selectAll(".h-cell")
      .data((d) => d.values);

    cell.exit().remove();

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

    // Set the positions of the annotations
    const personalityScore = vis.xScale.domain()[0];
    vis.personalityLine
      .attr("x1", (personalityScore + personalityScore + 1) / 2)
      .attr("x2", (personalityScore + personalityScore + 1) / 2)
      .attr("y1", 0)
      .attr("y2", vis.config.height)
      .attr("opacity", 0);

    vis.personalityLabel
      .attr("x", (personalityScore + personalityScore + 1) / 2)
      .attr("opacity", 0);

    // Highlight column when clicked
    cellEnter.on("click", (event, d) => {
      d3.select("#highlight")
        .attr(
          "x1",
          (vis.xScale(vis.xValue(d)) + vis.xScale(vis.xValue(d) + 1)) / 2
        )
        .attr(
          "x2",
          (vis.xScale(vis.xValue(d)) + vis.xScale(vis.xValue(d) + 1)) / 2
        )
        .style("stroke-width", cellWidth)
        .attr("opacity", 0.3)
        .style("display", "block");

      d3.select("#personality-label")
        .attr(
          "x",
          (vis.xScale(vis.xValue(d)) + vis.xScale(vis.xValue(d) + 1)) / 2
        )
        .attr("opacity", 1)
        .style("display", "block")
        .text("Your personality score: " + vis.xValue(d));
    });

    // Update axis
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}
