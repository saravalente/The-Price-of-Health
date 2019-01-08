/*
 * MapVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _statesData	    -- the actual states data: usaStates
 * @param _countiesData     -- the actual counties data: usaCounties
 * @param _choroplethData   -- the choropleth map data: choroplethData
 */

// number formatter
var f = d3.format(",");

MapVis = function(_parentElement, _statesData, _countiesData, _choroplethData) {
    this.parentElement = _parentElement;
    this.statesData = _statesData;
    this.countiesData = _countiesData;
    this.choroplethData = _choroplethData;

    this.initVis();
}

MapVis.prototype.initVis = function() {
    var vis = this;

    vis.currSelection = null;

    vis.margin = { top: 60, right: 0, bottom: 0, left: 0 };

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 480 - vis.margin.top - vis.margin.bottom;

    // svg drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // projection and path
    vis.projection = d3.geoAlbersUsa()
        .translate([vis.width / 2, vis.height / 2])
        .scale([800]);
    vis.path = d3.geoPath()
        .projection(vis.projection);

    // color scale
    vis.color = d3.scaleQuantize()
        .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)",
                "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)",
                "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)"]);

    // initialize selection to coverage
    vis.selection = "Coverage";

    // visualization title
    vis.svg.append("text")
        .attr("x", vis.width / 2)
        .attr("y", -45)
        .style("text-anchor", "middle")
        .style("font-weight", 300)
        .style("font-size", "20px")
        .style("fill", "#143451")
        .text("Overview of the US Healthcare Landscape");

    // visualization subtitle
    vis.svg.append("text")
        .attr("x", vis.width / 2)
        .attr("y", -20)
        .style("text-anchor", "middle")
        .style("font-weight", 300)
        .style("font-size", "16px")
        .style("fill", "#143451")
        .style("opacity", "0.6")
        .text("Click on a state to see details below the map");

    // radio buttons
    vis.radioButtons = ["Coverage", "Premiums", "Charges"];
    vis.radioButtonTextMap = {
        Coverage: "Percent Covered",
        Premiums: "Mean Premium",
        Charges: "Hospital Expenses"
    };
    vis.radioButtonStates = [1, 0, 0];
    vis.svg.selectAll(".radio")
        .data(vis.radioButtons)
        .enter()
        .append("text")
        .attr("class", "radio")
        .attr("x", function(d, index) { return 168 + index * 200; })
        .attr("y", 10)
        .style("font-size", "12px")
        .style("text-anchor", "start")
        .style("fill", "#00264d")
        .style("font-weight", 500)
        .text(function(d) { return vis.radioButtonTextMap[d]; });

    // tooltips
    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0,0])
        .html(function(d) {
            if ("data" in d.properties) {
                var stateName = d.properties.data.State;
                var dataValue = d.properties.data[vis.selection];

                if (isNaN(dataValue)) {
                    return stateName + ": N/A";
                } else {
                    if (vis.selection == "Coverage") {
                        return stateName + ": " + f(dataValue) + "%";
                    } else {
                        return stateName + ": " + "$" + f(dataValue);
                    }
                }
            } else {
                return "N/A";
            }
        });
    vis.svg.call(vis.tip);

    // filter, aggregate, modify data
    vis.wrangleData();
}

MapVis.prototype.wrangleData = function() {
    var vis = this;

    // update the visualization
    vis.updateVis();
}

MapVis.prototype.updateVis = function() {
    var vis = this;
    vis.dataExtent = d3.extent(vis.choroplethData, function(d) { return d[vis.selection]; });
    vis.color.domain(vis.dataExtent);

    // data-join (circles now contains the update selection)
    vis.circles = vis.svg.selectAll("circle")
        .data(vis.radioButtonStates);
    // enter (initialize the newly added circle elements)
    vis.circles.enter()
        .append("circle")
        .attr("stroke", "#00264d")
        .attr("stroke-width", 3)
        .attr("opacity", 0.9)
        .on("click", function(d, index) {
            if (d == 0) {
                vis.radioButtonStates = vis.radioButtonStates.map(function(d) { return 0; });
                vis.radioButtonStates[index] = 1;
                vis.selection = vis.radioButtons[index];
                vis.updateVis();
            }
        })
        // enter and update (set the dynamic properties of the elements)
        .merge(vis.circles)
        .attr("cx", function(d, index) { return 150 + index * 200; })
        .attr("cy", 6)
        .attr("r", 8)
        .attr("fill", "#00264d")
        .attr("fill-opacity", function(d) {
            if (d) { return 1; }
            else {return 0; };
        });
    // exit
    vis.circles.exit().remove();

    // data-join (map now contains the update selection)
    vis.map = vis.svg.selectAll("path")
        .data(vis.statesData);
    // enter (initialize the newly added map elements)
    vis.map.enter()
        .append("path")
        .attr("d", vis.path)
        .attr("stroke", "#ccc")
        .attr("stroke-opacity", 0.2)
        .on("mouseover", function(d) {
            d3.select(this).style("stroke", "black");
            d3.select(this).style("stroke-opacity", 1);
            vis.tip.show(d);
        })
        .on("mouseout", function(d) {
            d3.select(this).style("stroke", "#ccc");
            d3.select(this).style("stroke-opacity", 0.2);
            vis.tip.hide(d);
        })
        .on("click", function(d) {
            stateClicked(d);
        })
    // enter and update (set the dynamic properties of the elements)
        .merge(vis.map)
        .transition()
        .duration(1000)
        .attr("fill", function(d) {
            if ("data" in d.properties) {
                var dataValue = d.properties.data[vis.selection];

                if (isNaN(dataValue)) {
                    return "#ccc";
                } else {
                    return vis.color(dataValue);
                }
            } else {
                return "#ccc";
            }
        });
    // exit
    vis.map.exit().remove();

    vis.addLegend();
}

MapVis.prototype.addLegend = function() {
    var vis = this;
    var lw = 20, lh = 20;
    var numBins = 9;
    var legendBins = getLegendBins(vis.dataExtent, numBins);
    var legendLabels = getLegendLabels(vis.dataExtent, numBins, vis.selection);

    // data-join (legend now contains the update selection)
    vis.legend = vis.svg.selectAll("rect")
        .data(legendBins);
    // enter (initialize the newly added legend elements)
    vis.legend.enter()
        .append("rect")
        .attr("width", lw)
        .attr("height", lh)
        .attr("stroke", "#ccc")
        .attr("stroke-opacity", 0.2)
        // enter and update (set the dynamic properties of the elements)
        .merge(vis.legend)
        .attr("x", vis.width - 90)
        .attr("y", function(d, index) { return vis.height - (index * lh) - (2 * lh) - 90; })
        .style("fill", function(d) { return vis.color(d); });
    // exit
    vis.legend.exit().remove();

    // data-join (labels now contains the update selection)
    vis.labels = vis.svg.selectAll(".legend")
        .data(legendLabels);
    // enter (initialize the newly added label elements)
    vis.labels.enter()
        .append("text")
        .attr("class", "legend")
        // enter and update (set the dynamic properties of the elements)
        .merge(vis.labels)
        .attr("x", vis.width - 60)
        .attr("y", function(d, index) { return vis.height - (index * lh) - lh - 90; })
        .style("font-size", "10px")
        .style("alignment-baseline", "central")
        .text(function(d) { return d; });
    // exit
    vis.labels.exit().remove();
}

function getLegendBins(dataExtent, numBins) {
    var increment = Math.ceil((dataExtent[1] - dataExtent[0]) / (numBins + 1));
    var legendBins = [];
    for (var i = 1; i <= numBins; i++) {
        legendBins.push(dataExtent[0] + i * increment);
    }
    return legendBins;
}

function getLegendLabels(dataExtent, numBins, selection) {
    var increment = Math.floor((dataExtent[1] - dataExtent[0]) / numBins);
    var legendLabels = [];
    for (var i = 0; i < numBins; i++) {
        if (selection == "Coverage") {
            legendLabels.push(f(dataExtent[0] + i * increment) + "%");
        } else {
            var labelNumber = Math.ceil((dataExtent[0] + i * increment) / 10.0) * 10;
            legendLabels.push("$" + f(labelNumber));
        }
    }
    if (selection == "Coverage") {
        legendLabels.push(f(dataExtent[1]) + "%");
    } else {
        var labelNumber = Math.ceil(dataExtent[1] / 10.0) * 10;
        legendLabels.push("$" + f(labelNumber));
    }
    return legendLabels;
}