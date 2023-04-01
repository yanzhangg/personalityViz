class CircularBarplot {
    /**
     * Class constructor with initial configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1000,
            containerHeight: _config.containerHeight || 800,
            tooltipPadding: 15,
            margin: _config.margin || { top: 300, right: 50, bottom: 200, left: 500 },
            innerRadius: 80,
            outerRadius: Math.min(_config.containerWidth, _config.containerHeight) / 2
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
                `translate(${vis.config.margin.left + 50},${vis.config.margin.top + 80})`
            );

        vis.chart = vis.chartArea.append("g");

        // Append title
        vis.chartArea.append('text')
            .attr('class', 'title')
            .attr('x', -50)
            .attr('y', 120)
            .attr('dy', '1em')
            .text('Openness')
            .style('font-size', '12px');

        // Initialize scales
        vis.xScale = d3.scaleBand()
            .range([0, 2 * Math.PI])
            .align(0);

        vis.yScale = d3.scaleRadial()
            .range([vis.innerRadius, vis.outerRadius]);

        vis.updateVis();
    }

    /**
     * Prepare the data and scales before we render it.
     */
    updateVis() {
        const vis = this;

        // Specificy accessor functions
        // vis.xValue = (d) => d.name;
        // vis.yValue = (d) => d.sum;
        
        // Set the scale input domain
        vis.xScale.domain(vis.data.map(function (d) {
            return d.name;
        }));

        vis.yScale.domain([0, 400]);// TODO: find max

        vis.renderVis();
    }
    /**
     * Bind data to visual elements.
     */
    renderVis() {
        const vis = this;

        console.log(vis.data);

        // Add bars
        vis.chart
            .selectAll(".path")
            .data(vis.data)
            .enter()
            .append("path")
            .attr("class", 'path')
            .attr("fill", "#69b3a2")
            .attr("d", d3.arc()
                .innerRadius(vis.innerRadius)
                .outerRadius(d => d.sum)
                // .outerRadius(d => vis.yScale(d.sum))
                .startAngle(d => vis.xScale(d.name))
                .endAngle(d => vis.xScale(d.name) + vis.xScale.bandwidth())
                .padAngle(0.01)
                .padRadius(vis.innerRadius));

        // Add genre labels
        vis.chart.append("g")
            .selectAll("g")
            .data(vis.data)
            .enter()
            .append("g")
            .attr("text-anchor", function (d) { return (vis.xScale(d.name) + vis.xScale.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
            .attr("transform", function (d) { 
                return "rotate(" + ((vis.xScale(d.name) + vis.xScale.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (d.sum + 10) + ",0)"; })
            .append("text")
            .text(function (d) { return (d.name.substring(0, d.name.length - 3)) })
            .attr("transform", function (d) { return (vis.xScale(d.name) + vis.xScale.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
            .style("font-size", "11px")
            .attr("alignment-baseline", "middle");
    }
}
