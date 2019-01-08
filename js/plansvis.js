HEIGHT = 20;

function getTobaccoString(){
  if($('#smoking').is(":checked")){
    var v = 'smoking';
  }
  else {
    var v = 'nonsmoking';
  }
  return v;
}

function getIndividualString(){
  if($('#isindividual').is(":checked")){
    var v = 'Individual';
  }
  else {
    var v = 'Couple';
  }
  return v;
}

function getIndividualText(name){
    if(name == 'Individual'){
        return "an individual";
    }
    else{
        return "a couple";
    }
}

function getDependentsText(name){
  if(name=='kids0'){
    var v = 'no';
  }
  else if(name == 'kids1'){
    var v = 'one';
  }
  else if(name == 'kids2'){
    var v = 'two';
  }
  else if (name == 'kids3'){
    var v = 'three or more';
  }
  else {
    var v = 'undef';
  }
  return v;
}

function getTobaccoText(name){
  if(name == "smoking"){
      return "uses tobacco";
  }
  else{
      return " doesn't use tobacco";
  }
}


PlansVis = function(_parentElement, _data1, _data2) {
    this.parentElement = _parentElement;
    this.data1 = _data1;
    this.displayData1 = _data1;
    this.displayData2 = _data2;
    this.data2 = _data2;

    this.initVis();
}

PlansVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 40, right: 10, bottom: 50, left: 40};
    vis.width = 500 - vis.margin.left - vis.margin.right;
    vis.height = 260 - vis.margin.top - vis.margin.bottom;

    // svg drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(0," + 0 + ")");

    // scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width])
        .domain([0, d3.max(vis.data2, function(d) { return d; })]);

    vis.bins = d3.histogram()
        .domain(vis.x.domain())
        .thresholds(vis.x.ticks(20))
        (vis.data2);

    vis.y = d3.scaleLinear()
        .domain([0, d3.max(vis.bins, function(d) { return d.length; })])
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickFormat(function(d) {
            return "$" + d.toLocaleString();
        });

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);

    // visualization title
    vis.svg.append("text")
        .attr("x", vis.width / 2)
        .attr("y", -25)
        .style("text-anchor", "middle")
        .style("font-weight", 200)
        .style("font-size", "16px")
        .style("fill", "#03002e")
        .text("Distribution of Plans");

    // axis labels
    vis.svg.append("text")
        .attr("class", "axis-label x-label")
        .attr("y", vis.height + 40)
        .attr("x", vis.width / 2)
        .style("text-anchor", "middle")
        .style("font-weight", 200)
        .style("font-size", "14px")
        .text("Plan Cost");

    vis.bar = vis.svg.selectAll(".bar")
        .data(vis.bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) {
            return "translate(" + vis.x(d.x0) + "," + vis.y(d.length) + ")";
        });

    vis.bar.append("rect")
        .attr("x", 1)
        .attr("fill", "#143451")
        .attr("width", vis.x(vis.bins[0].x1) - vis.x(vis.bins[0].x0) - 1)
        .attr("height", function(d) {
            return vis.height - vis.y(d.length);
        });

    $('#state').on("change", function(){
        vis.wrangleData();
    });

    $('#age').on("change", function(){
        vis.wrangleData();
    });

    $('#plan').on("change", function(){
        vis.wrangleData();
    });

    $('.tobacco').click(function(){
        vis.wrangleData();
    });

    $('.isindividual').click(function(){
        vis.wrangleData();
    });

    $('#dependents').on("change", function(){
        vis.wrangleData();
    });

    vis.wrangleData();
}

PlansVis.prototype.updateText = function(custom){
  var vis = this;

  console.log(custom);

    if(custom){
        $('#textbox').css('visibility', 'hidden');
        $('#error').css('visibility', 'visible');
    }
    else{
        $('#textbox').css('visibility', 'visible');
        $('#error').css('visibility', 'hidden');
    }

    $('#state-fill').text(abbrState(vis.state, 'name'));
    $('#age-fill').text(vis.age);
    $('#plan-fill').text(vis.plan.toLowerCase());
    $('#tobacco-fill').text(getTobaccoText(vis.tobacco));
    $('#individual-fill').text(getIndividualText(vis.individual));
    $('#dependents-fill').text(getDependentsText(vis.dependents));
}

PlansVis.prototype.wrangleData = function() {
    var vis = this;

    vis.state = $('#state').val();
    vis.plan = $('#plan').val();
    vis.age = $('#age').val();
    vis.ageRange = checkAgeRange(vis.age);
    vis.individual = getIndividualString();
    vis.tobacco = getTobaccoString();
    vis.dependents = $('#dependents').val();

    // update the visualization
    vis.updateVis();
}


PlansVis.prototype.updateVis = function() {
    var vis = this;
    d3.select(".target").remove();

    try{
        var price = vis.displayData1[vis.state][vis.plan][vis.individual][vis.ageRange][vis.dependents][vis.tobacco];
        $('#price-fill').text('$' + price.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
        if(price < 100) {
          throw 'Error';
        }
        // Update the text
        vis.updateText();
        vis.svg.append("rect")
            .attr("x", vis.x(price))
            .attr("y", 0)
            .attr("width", 3)
            .attr("height", vis.height)
            .attr("fill", "yellow")
            .attr("opacity", .9)
            .attr("class", "target");
    }
    catch(err) {
        vis.updateText('That plan is not documented.');
    }
}

abbrState = function abbrState(input, to){
    var states = [
        ['Arizona', 'AZ'],
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    if (to == 'abbr'){
        input = input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        for(i = 0; i < states.length; i++){
            if(states[i][0] == input){
                return(states[i][1]);
            }
        }
    } else if (to == 'name'){
        input = input.toUpperCase();
        for(i = 0; i < states.length; i++){
            if(states[i][1] == input){
                return(states[i][0]);
            }
        }
    }
}

checkAgeRange = function(x){
    if (x <= 29){
        return "age21"
    }
    else if (x <= 39 && x > 29){
        return "age30"
    }
    else if (x <= 49 && x > 39){
        return "age40"
    }
    else{
        return "age50"
    }
}