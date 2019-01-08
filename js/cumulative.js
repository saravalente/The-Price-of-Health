/*
 * CumulativeVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data	            -- the actual spending data: spendingData
 */

var formatPercent = d3.format(".0%");

CumulativeVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
}

CumulativeVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 40, right: 50, bottom: 70, left: 60 };

    vis.width = 500 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    // svg drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // scales and axes
    vis.x = d3.scaleLinear()
        .range([0,vis.width])
        .domain([0,1]);
    vis.y = d3.scaleLinear()
        .range([vis.height,0])
        .domain([0,1]);
    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickSizeInner(-vis.height)
        .tickPadding(10)
        .tickFormat(formatPercent);
    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickSizeInner(-vis.width)
        .tickPadding(10)
        .tickFormat(formatPercent);
    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.svg.append("g")
        .attr("class", "y-axis axis");
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);

    // visualization title
    vis.svg.append("text")
        .attr("x", vis.width / 2)
        .attr("y", -25)
        .style("text-anchor", "middle")
        .style("font-weight", 300)
        .style("font-size", "20px")
        .style("fill", "#143451")
        .text("Cumulative Distribution of Healthcare Spending");

    // axis labels
    vis.svg.append("text")
        .attr("class", "axis-label y-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", 0 - (vis.height / 2))
        .style("text-anchor", "middle")
        .text("Cumulative Percent of Total Spending");
    vis.svg.append("text")
        .attr("class", "axis-label x-label")
        .attr("y", vis.height + 40)
        .attr("x", vis.width / 2)
        .style("text-anchor", "middle")
        .text("Percent of Population Ordered by Healthcare Spending");

    // set up grid points for freehand drawing
    vis.xCoords = d3.range(0,21).map(function(d) {
        return (d * 5.0) / 100.0;
    });
    vis.yCoords = d3.range(0,41).map(function(d) {
        return (d * 2.5) / 100.0;
    });
    vis.xToY = {};
    vis.xCoords.forEach(function(d) {
        vis.xToY[d] = -1;
    });

    // line plots
    vis.line = d3.line()
        .x(function(d) { return vis.x(d.x); })
        .y(function(d) { return vis.y(d.y); })
        .curve(d3.curveCardinal.tension(0.5));
    vis.svg.append("path")
        .attr("class", "line");
    vis.answerLine = d3.line()
        .x(function(d) { return vis.x(d.percent_population / 100.0); })
        .y(function(d) { return vis.y(d.percent_spending / 100.0); })
        .curve(d3.curveCardinal.tension(0.5));
    vis.svg.append("path")
        .attr("class", "answer-line");
    vis.answerShown = false;

    // drag behavior
    vis.svg.append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .style("fill", "none")
        .style("pointer-events", "all");
    vis.svg.call(d3.drag()
        .container(function() { return this; })
        .on("drag", function() {
            var dragX = Math.max(0.01, Math.min(vis.x.invert(d3.event.x), 1.0));
            var dragY = Math.max(0.01, Math.min(vis.y.invert(d3.event.y), 1.0));

            var closest = getClosestPoint(dragX, dragY, vis.xCoords, vis.yCoords);
            if (vis.xToY[closest[0]] != closest[1]) {
                vis.xToY[closest[0]] = closest[1];
                vis.updateVis();
            }
        }));

    // tooltips
    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            var percent_population = 100 - d.percent_population;
            var percent_spending = Math.round((100 - d.percent_spending) * 10) / 10;
            if (percent_population == 0) {
                return "100% of the population accounts for 100% of spending";
            }
            return "Top " + percent_population + "% of spenders account for " + percent_spending + "% of spending";
        });
    vis.svg.call(vis.tip);

    // filter, aggregate, modify data
    vis.wrangleData();
}

function getClosestPoint(x0, y0, xCoords, yCoords) {
    var ix = d3.bisectLeft(xCoords, x0);
    var x1 = (x0 - xCoords[ix - 1]) > (xCoords[ix] - x0) ? xCoords[ix] : xCoords[ix - 1];
    var iy = d3.bisectLeft(yCoords, y0);
    var y1 = (y0 - yCoords[iy - 1]) > (yCoords[iy] - y0) ? yCoords[iy] : yCoords[iy - 1];
    return [x1, y1];
}

CumulativeVis.prototype.wrangleData = function() {
    var vis = this;

    // update the visualization
    vis.updateVis();
}

CumulativeVis.prototype.updateVis = function() {
    var vis = this;

    var points = [];
    vis.xCoords.forEach(function(d) {
        if (vis.xToY[d] != -1) {
            points.push({x: d, y: vis.xToY[d]});
        }
    });

    // data-join (circle now contains the update selection)
    vis.circle = vis.svg.selectAll(".user")
        .data(points);
    // enter (initialize the newly added elements)
    vis.circle.enter()
        .append("circle")
        .attr("class", "user")
        .attr("r", 4)
        .attr("fill", "#b85050")
        // enter and update (set the dynamic properties of the elements)
        .merge(vis.circle)
        .attr("cx", function(d) { return vis.x(d.x); })
        .attr("cy", function(d) { return vis.y(d.y); });
    // exit
    vis.circle.exit().remove();

    // add line overlay
    vis.svg.select(".line")
        .attr("d", vis.line(points))
        .attr("stroke", "#d28c8c");

    if (points.length > 0) {
        if (!vis.answerShown) {
            document.getElementById("done-btn").disabled = false;
        }
        document.getElementById("start-over-btn").disabled = false;
    }
}

CumulativeVis.prototype.showAnswer = function() {
    var vis = this;

    vis.svg.selectAll(".answer")
        .data(vis.data)
        .enter()
        .append("circle")
        .attr("class", "answer")
        .attr("r", 4)
        .attr("fill", "#1f4788")
        .attr("cx", function(d) { return vis.x(d.percent_population / 100.0); })
        .attr("cy", function(d) { return vis.y(d.percent_spending / 100.0); })
        .on("mouseover", vis.tip.show)
        .on("mouseout", vis.tip.hide);
    vis.svg.select(".answer-line")
        .attr("d", vis.answerLine(vis.data))
        .attr("stroke", "#59abe3");
}

CumulativeVis.prototype.doneButtonClicked = function() {
    var vis = this;

    if (!document.getElementById("done-btn").disabled) {
        if (!vis.answerShown) {
            document.getElementById("done-btn").disabled = true;
            vis.answerShown = true;
            vis.showAnswer();

            // show corresponding text
            // stop typewriter effect if it's still ongoing
            clearTimeout(timeout);
            document.getElementById("typewriter-effect").innerHTML = "Turns out, the distribution is extremely unequal! " +
                "<span style='color: #af1400; opacity: 0.8;'><strong>1%</strong></span> of the population accounts for <span style='color: #af1400; opacity: 0.8;'><strong>20%</strong></span> of spending. " +
                "<span style='color: #af1400; opacity: 0.8;'><strong>5%</strong></span> of the population accounts for <span style='color: #af1400; opacity: 0.8;'><strong>50%</strong></span> of spending. " +
                "Hover over the data points to explore more. <b>Scroll down to see a cost breakdown.</b>"
        }
    }
}

CumulativeVis.prototype.startOverButtonClicked = function() {
    var vis = this;

    vis.xCoords.forEach(function(d) {
        vis.xToY[d] = -1;
    });

    vis.updateVis();
}