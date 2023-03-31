class CircularBarplot {
    /**
     * Class constructor with initial configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 500,
            tooltipPadding: 15,
            margin: _config.margin || { top: 50, right: 50, bottom: 50, left: 120 },
            innerRadius: 80,
            outerRadius: Math.min(this.containerWidth, this.containerHeight) / 2
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

        vis.xScale = d3.scaleBand().range([0, 2 * Math.PI]);

        vis.yScale = d3.scaleRadial().range([vis.innerRadius, vis.outerRadius]).domain([0, d3.max(vis.data, d => d.ipip_0)]);

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

        vis.updateVis();
    }

    /**
     * Prepare the data and scales before we render it.
     */
    updateVis() {
        const vis = this;

        // Specificy accessor functions
        vis.xValue = (d) => d.name;
        vis.yValue = (d) => d.ipip_O;

        // Set the scale input domains
        vis.xScale.domain(movieGenres);
        vis.yScale.domain([7, 21]);

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
            .attr("fill", "#69b3a2")
            .attr("d", d3.arc()
                .innerRadius(vis.innerRadius)
                .outerRadius(function (d) { return y(d['Value']); })
                .startAngle(function (d) { return x(d.ipip_0); })
                .endAngle(function (d) { return x(d.ipip_0) + xScale.bandwidth(); })
                .padAngle(0.01)
                .padRadius(vis.innerRadius))

        // Add genre labels
        vis.chart.append("g")
            .selectAll("g")
            .data(vis.data)
            .enter()
            .append("g")
            .attr("text-anchor", function (d) { return (x(d.name) + xScale.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
            .attr("transform", function (d) { return "rotate(" + ((x(d.name) + xScale.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['Value']) + 10) + ",0)"; })
            .append("text")
            .text(function (d) { return (d.name) })
            .attr("transform", function (d) { return (x(d.name) + xScale.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
            .style("font-size", "11px")
            .attr("alignment-baseline", "middle")

        // Update axis
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }
}
