MiniDonut = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
}

MiniDonut.prototype.initVis = function() {
    var vis = this;

    vis.width = 160;
    vis.height = 160;
    vis.twoPi = 2 * Math.PI;
    vis.formatPercent = d3.format(".0%");
    vis.progress = 0;

    vis.arc = d3.arc()
        .startAngle(0)
        .innerRadius(58)
        .outerRadius(66)
        .cornerRadius(12);

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .append("g")
        .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");

    vis.meter = vis.svg.append("g")
        .attr("class", "meter");

    vis.meter.append("path")
        .attr("class", "background")
        .attr("d", vis.arc.endAngle(vis.twoPi));

    vis.foreground = vis.meter.append("path")
        .attr("class", "foreground");

    vis.percentComplete = vis.meter.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "percent-complete")
        .attr("dy", "0em")
        .style("font-size", "32px")
        .style("font-weight", "300")
        .style("fill", "#143451");

    vis.description = vis.meter.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "description")
        .attr("dy", "2.3em")
        .text("Coverage")
        .style("font-size", "12px")
        .style("font-weight", "300")
        .style("fill", "#333333");

    // (Filter, aggregate, modify data)
    vis.wrangleData();
}

MiniDonut.prototype.wrangleData = function() {
    var vis = this;

    vis.progress = 0;
    vis.percentage = vis.data;
    vis.interpolation = d3.interpolate(vis.progress, vis.percentage);

    // Update the visualization
    vis.updateVis();
}

MiniDonut.prototype.updateVis = function() {
    var vis = this;

    d3.transition().duration(1000).tween("progress", function() {
        return function(t) {
            vis.progress = vis.interpolation(t);
            vis.foreground.attr("d", vis.arc.endAngle(vis.twoPi * vis.progress));
            vis.percentComplete.text(vis.formatPercent(vis.progress));
        }
    });
}