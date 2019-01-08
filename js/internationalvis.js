var formatDate = d3.timeFormat("%Y");

InternationalVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;

    this.initVis();
}

InternationalVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 40, right: 55, bottom: 110, left: 50 };

    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

    // svg drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // scales and axes
    vis.x = d3.scaleLinear()
        .range([0,vis.width])
        .domain(d3.extent(vis.data, function(d) { return d.Health_Expenditure; }));
    vis.y = d3.scaleLinear()
        .range([vis.height,0])
        .domain(d3.extent(vis.data, function(d) { return d.Life_Expectancy; }));
    vis.xAxis = d3.axisBottom()
        .scale(vis.x);
    vis.yAxis = d3.axisLeft()
        .scale(vis.y);
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
        .text("Life Expectancy vs. Health Expenditure, 1970-2013");

    // axis labels
    vis.svg.append("text")
        .attr("class", "axis-label y-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -35)
        .attr("x", 0 - (vis.height / 2))
        .style("text-anchor", "middle")
        .text("Life Expectancy in Years");
    vis.svg.append("text")
        .attr("class", "axis-label x-label")
        .attr("y", vis.height + 40)
        .attr("x", vis.width / 2)
        .style("text-anchor", "middle")
        .text("Annual Per Capita Health Expenditure, Inflation-Adjusted ($)");

    // year slider
    vis.startYear = new Date("1970");
    vis.endYear = new Date("2014");
    vis.currentYear = vis.startYear;
    vis.yearScale = d3.scaleTime()
        .domain([vis.startYear, vis.endYear])
        .range([0, vis.width - 80])
        .clamp(true);
    vis.slider = vis.svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + 80 + "," + (vis.height + 75) + ")");

    vis.slider.append("line")
        .attr("class", "track")
        .attr("x1", vis.yearScale.range()[0])
        .attr("x2", vis.yearScale.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() { vis.slider.interrupt(); })
            .on("start drag", function() {
                vis.currentYear = vis.yearScale.invert(d3.event.x);
                vis.updateSlider();
            })
        );

    vis.slider.insert("g", ".track-overlay")
        .attr("class", "slider-tick")
        .attr("transform", "translate(0," + 15 + ")")
        .selectAll("text")
        .data(vis.yearScale.ticks(10))
        .enter()
        .append("text")
        .attr("x", vis.yearScale)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatDate(d); });

    vis.handle = vis.slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    vis.label = vis.slider.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(formatDate(vis.startYear))
        .attr("transform", "translate(0," + (-15) + ")");

    // slider play button
    vis.svg.append("rect")
        .attr("class", "slider-button")
        .attr("x", 0)
        .attr("y", vis.height + 60)
        .attr("height", 30)
        .attr("width", 60)
        .attr("rx", 10)
        .attr("rx", 10)
        .attr("fill", "#23af35")
        .on("mouseover", function(d) {
            d3.select(this).attr("fill", "#3cb74c");
            d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function(d) {
            d3.select(this).attr("fill", "#23af35");
        })
        .on("click", function(d) {
            vis.playButtonClicked();
        });
    vis.svg.append("text")
        .attr("class", "button-text")
        .style("cursor", "pointer")
        .attr("x", 30)
        .attr("y", vis.height + 75)
        .attr("alignment-baseline", "central")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .style("font-weight", "100")
        .on("mouseover", function(d) {
            d3.select(".slider-button").attr("fill", "#3cb74c");
        })
        .on("mouseout", function(d) {
            d3.select(".slider-button").attr("fill", "#23af35");
        })
        .on("click", function(d) {
            vis.playButtonClicked();
        })
        .text("Play");
    vis.paused = true;

    // line
    vis.line = d3.line()
        .curve(d3.curveLinear)
        .x(function(d) { return vis.x(d.expenditure); })
        .y(function(d) { return vis.y(d.expectancy); });

    // tooltips
    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0, 0])
        .html(function(d) {
            return d.country;
        });
    vis.svg.call(vis.tip);

    // filter, aggregate, modify data
    vis.wrangleData();
}

InternationalVis.prototype.wrangleData = function() {
    var vis = this;

    vis.displayData = vis.data.filter(function(d) {
        return d.Year <= vis.currentYear;
    });

    // turn data into proper input format
    vis.processedDataMap = {};
    vis.circleData = [];
    vis.displayData.forEach(function(d) {
        if (!(d.Code in vis.processedDataMap)) {
            vis.processedDataMap[d.Code] = {
                country: d.Country,
                values: []
            };
        }

        vis.processedDataMap[d.Code]["values"].push(
            { year: d.Year, country: d.Country, expenditure: d.Health_Expenditure, expectancy: d.Life_Expectancy }
        );
        vis.circleData.push(
            { year: d.Year, code: d.Code, expenditure: d.Health_Expenditure, expectancy: d.Life_Expectancy }
        );
    });
    vis.processedData = Object.values(vis.processedDataMap);

    // update the visualization
    vis.updateVis();
}

InternationalVis.prototype.updateSlider = function() {
    var vis = this;

    // update position and text of label according to slider scale
    vis.handle.attr("cx", vis.yearScale(vis.currentYear));
    vis.label.attr("x", vis.yearScale(vis.currentYear))
        .text(formatDate(vis.currentYear));

    // filter data set and redraw plot
    vis.wrangleData();
}

InternationalVis.prototype.updateVis = function() {
    var vis = this;

    // data-join (vis.country now contains the update selection)
    vis.country = vis.svg.selectAll(".country-path")
        .data(vis.processedData);
    // enter (initialize the newly added elements)
    vis.country.enter()
        .append("path")
        .attr("class", "country-path")
        .attr("pointer-event", "visibleStroke")
        .style("stroke-opacity", 0.5)
        .on("mouseover", function(d) {
            d3.select(this).style("stroke-width", 3.5);
            vis.tip.show(d);
        })
        .on("mouseout", function(d) {
            if (d.country == "United States") {
                d3.select(this).style("stroke", "red").style("stroke-width", 1);
            } else {
                d3.select(this).style("stroke", "gray").style("stroke-width", 1);
            }
            vis.tip.hide(d);
        })
        // enter and update (set the dynamic properties of the elements)
        .merge(vis.country)
        .attr("d", function(d) {
            return vis.line(d.values);
        })
        .attr("id", function(d) {
            return d.country.split(" ").join("-");
        })
        .style("stroke", function(d) {
            if (d.country == "United States") {
                return "red";
            } else {
                return "gray";
            }
        });
    // exit
    vis.country.exit().remove();

    // remove country labels
    vis.svg.selectAll(".country-label").remove();

    // re-add country labels
    vis.svg.selectAll(".country-label")
        .data(vis.processedData)
        .enter()
        .append("text")
        .attr("class", "country-label")
        .attr("x", function(d) {
            return vis.x(d.values[d.values.length - 1].expenditure) + 3;
        })
        .attr("y", function(d) {
            return vis.y(d.values[d.values.length - 1].expectancy) - 3;
        })
        .text(function(d) {
            if (d.country != "United States") {
                return;
            }
            return d.country;
        });
}

InternationalVis.prototype.playButtonClicked = function() {
    var vis = this;
    if (vis.paused) {
        vis.svg.select(".button-text")
            .text("Pause");
        vis.paused = false;
        vis.timer = setInterval(function() { vis.step(); }, 200);
    } else {
        vis.svg.select(".button-text")
            .text("Play");
        vis.paused = true;
        clearInterval(vis.timer);
    }
}

InternationalVis.prototype.step = function() {
    var vis = this;
    vis.updateSlider();
    var nextYear = +formatDate(vis.currentYear) + 2;
    if (nextYear > 2014) {
        vis.currentYear = vis.startYear;
        vis.svg.select(".button-text")
            .text("Play");
        vis.paused = true;
        clearInterval(vis.timer);
    } else {
        vis.currentYear = new Date(String(nextYear));
    }
}

InternationalVis.prototype.highlightCountry = function(countryId) {
    vis = this;
    countryId = countryId.split(" ").join("-");
    var currPath = vis.svg.select("#" + countryId);
    if (!currPath.empty() && currPath.style("stroke") == "red") {
        currPath.style("stroke", "gray");
    } else if (!currPath.empty()) {
        currPath.style("stroke", "red");
    }
}