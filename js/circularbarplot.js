class CircularBarplot {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _name, _highlightedTrait) {
    this.config = {
      parentElement: _config.parentElement,
      margin: _config.margin || { top: 50, right: 50, bottom: 50, left: 55 },
      containerWidth: _config.containerWidth || 400,
      containerHeight: _config.containerHeight || 400,
      tooltipPadding: 15,
      innerRadius: 80,
      outerRadius: 200,
    };
    this.data = _data;
    this.name = _name;
    this.highlightedTrait = _highlightedTrait;
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
      .attr(
        "width",
        vis.config.containerWidth +
          vis.config.margin.left +
          vis.config.margin.right
      )
      .attr(
        "height",
        vis.config.containerHeight +
          vis.config.margin.top +
          vis.config.margin.bottom
      );

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chartArea = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.containerWidth / 2 + vis.config.margin.left},${
          vis.config.containerHeight / 2 + vis.config.margin.top
        })`
      );

    vis.chart = vis.chartArea.append("g");

    // Append title
    vis.chartArea
      .append("text")
      .attr("class", "title")
      .attr(
        "x",
        vis.name == "Conscientiousness"
          ? -60
          : vis.name == "Openness"
          ? -35
          : vis.name == "Extraversion" || vis.name == "Neuroticism" ? -38 : -46
      )
      .attr("y", -10)
      .attr("dy", "1em")
      .text(vis.name)
      .style("font-size", "15px");

    // Initialize scales
    vis.xScale = d3
      .scaleBand()
      .range([0, 2 * Math.PI])
      .align(0);

    vis.yScale = d3
      .scaleRadial()
      .range([vis.config.innerRadius, vis.config.outerRadius]);

    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    const vis = this;

    // Set the scale input domain
    vis.xScale.domain(
      vis.data.map(function (d) {
        return d.name;
      })
    );
    vis.yScale.domain(d3.extent(vis.data, (d) => d.sum));

    vis.renderVis();
  }
  /**
   * Bind data to visual elements.
   */
  renderVis() {
    const vis = this;

    // Add bars
    vis.chart
      .selectAll(".path")
      .data(vis.data)
      .enter()
      .append("path")
      .attr("class", "path")
      .attr("fill", "#69b3a2")
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(vis.config.innerRadius)
          .outerRadius((d) => vis.yScale(d.sum))
          .startAngle((d) => vis.xScale(d.name))
          .endAngle((d) => vis.xScale(d.name) + vis.xScale.bandwidth())
          .padAngle(0.01)
          .padRadius(vis.config.innerRadius)
      )
      .on("mouseover", (event, d) => {
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                    <div class='tooltip-title'><b>Genre:</b> ${d.name.substring(
                      0,
                      d.name.length - 3
                    )}</div>
                    <div><b>Total Score:</b> ${d.sum}</div>
                    `);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      });

    // Bidirectional Link - change opacity and stroke if trait is selected
    const bars = vis.chart
      .selectAll(".path")
      .attr("opacity", (d) => {
        if (vis.highlightedTrait == vis.name) {
          return "1.0";
        } else {
          return "0.7";
        }
      })
      .attr("stroke", (d) => {
        if (vis.highlightedTrait == vis.name) {
          return "#333";
        } else {
          return "none";
        }
      })
      // Trigger updates to other circular barplots and change heatmap when trait clicked on
      .on("click", function (event, d) {
        changeTraitView(vis.name);
      });

    // Add genre labels
    vis.chart
      .append("g")
      .selectAll("g")
      .data(vis.data)
      .enter()
      .append("g")
      .attr("text-anchor", function (d) {
        return (vis.xScale(d.name) + vis.xScale.bandwidth() / 2 + Math.PI) %
          (2 * Math.PI) <
          Math.PI
          ? "end"
          : "start";
      })
      .attr("transform", function (d) {
        return (
          "rotate(" +
          (((vis.xScale(d.name) + vis.xScale.bandwidth() / 2) * 180) / Math.PI -
            90) +
          ")" +
          "translate(" +
          (vis.yScale(d.sum) + 10) +
          ",0)"
        );
      })
      .append("text")
      .text(function (d) {
        return d.name.substring(0, d.name.length - 3);
      })
      .attr("transform", function (d) {
        return (vis.xScale(d.name) + vis.xScale.bandwidth() / 2 + Math.PI) %
          (2 * Math.PI) <
          Math.PI
          ? "rotate(180)"
          : "rotate(0)";
      })
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  }
}
