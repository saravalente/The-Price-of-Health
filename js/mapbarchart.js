MapBarChart = function(_parentElement, _data, _config) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.config = _config;

    this.initVis();
}

MapBarChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 30, right: 0, bottom: 30, left: 40 };

    vis.width = 210 - vis.margin.left - vis.margin.right;
    vis.height = 160 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // scales and axes
    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.3)
        .paddingOuter(0.3);
    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);
    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .ticks(5)
        .tickFormat(function(d) {
            return "$" + d.toLocaleString();
        });

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // bar chart title
    vis.svg.append("text")
        .attr("x", vis.width/2)
        .attr("y", 0 - vis.margin.top/2)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-weight", "200")
        .text(vis.config.title);

    // (Filter, aggregate, modify data)
    vis.wrangleData();
}

MapBarChart.prototype.wrangleData = function() {
    var vis = this;

    // Update the visualization
    vis.updateVis();
}

// key: "California"
// value: 100
MapBarChart.prototype.updateVis = function() {
    var vis = this;

    // update domains
    vis.x.domain(vis.data.map(function(d) { return d.key; }));
    vis.y.domain([0, d3.max(vis.data, function(d) { return d.value; })]);

    // draw rectangles, data-join (rect now contains the update selection)
    var rect = vis.svg.selectAll("rect")
        .data(vis.data);

    // enter (initialize the newly added elements)
    rect.enter()
        .append("rect")
        .attr("class", "bar")
        .style("fill", vis.config.fill)
        .style("opacity", 0.65)
        // enter and update (set the dynamic properties of the elements)
        .merge(rect)
        .transition()
        .duration(500)
        .attr("x", function(d) { return vis.x(d.key); })
        .attr("y", function(d) { return vis.y(d.value); })
        .attr("width", vis.x.bandwidth())
        .attr("height", function(d) { return vis.height - vis.y(d.value); });

    // exit
    rect.exit().remove();

    // update the axes
    vis.svg.select(".x-axis")
        .transition()
        .duration(500)
        .call(vis.xAxis);
    vis.svg.select(".y-axis")
        .transition()
        .duration(500)
        .call(vis.yAxis);
}