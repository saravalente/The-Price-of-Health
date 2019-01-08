var formatPercent = d3.format(".2%");
// Based on https://bl.ocks.org/mbostock/4348373


SunBurst = function(_parentElement, _data) {
  var vis = this;

  vis.data = _data;
  vis.parentElement = _parentElement;

  vis.initVis();
}

SunBurst.prototype.initVis = function(){
  vis = this;
    $("#explanation").css('visibility', 'hidden');

  parentCategory = "all";

  vis.color = d3.scaleOrdinal(d3.schemeCategory10);
  vis.partition = d3.partition();
  vis.width = 450;
  vis.height = 450;
  vis.radius = (Math.min(vis.width, vis.height) / 2) - 10;
  vis.x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);
  vis.y = d3.scaleSqrt()
    .range([0, vis.radius]);
  vis.arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, vis.x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, vis.x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, vis.y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, vis.y(d.y1)); });

  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width)
    .attr("height", vis.height)
    .append("g")
    .attr("transform", "translate(" + vis.width / 2 + "," + (vis.height / 2) + ")");
    

  vis.wrangleData();
}


SunBurst.prototype.wrangleData = function(){
  var vis = this;
  // Sort in decreasing order
  vis.data.children.forEach(function(d, i){
    d.children.sort(function(a, b){
      return b.size - a.size;
    })
  });

  vis.root = d3.hierarchy(vis.data);
  vis.root.sum(function(d) { return d.size; });
  console.log(vis.root);
  vis.parentTotal = vis.root.value;

  vis.updateVis();
}

SunBurst.prototype.updateVis = function(){
  var vis = this;

    // tooltips
    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0,0])
        .html(function(d) {
          return d.data.name;
        });
    vis.svg.call(vis.tip);

  vis.svg.selectAll("path")
      .data(vis.partition(vis.root).descendants())
      .enter().append("path")
      .attr("d", vis.arc)
      .style("fill", function(d) {
        return vis.color((d.children ? d : d.parent).data.name);
      })
      .style("opacity", function(d){
        return d.children ? 1 : 0.5;
      })
      .style("cursor", function(d){
        return d.children ? "pointer": "default";
      })
      .on("click", function(d){
        return d.children ? click(d) : function(d){};
      })
      .on("mouseover", function(d) {
          $('#explanation').css('visibility', 'visible');
        if (d.data.name == 'All'){
          $('#explanation').text();
            $('#parent-cat').text(parentCategory);
        }
        else if(d.value == vis.parentTotal){
          $('#percentage').text(vis.parent.data.name);
            $('#parent-cat').text(parentCategory);
        }
        else if((d.value / vis.parentTotal) < .01){
            $('#cat-name').text(d.data.name.toLowerCase());
            $('#percentage').text('>1%');
            $('#parent-cat').text(parentCategory);
        }
        else {
          $('#cat-name').text(d.data.name.toLowerCase());
          $('#percentage').text(formatPercent(d.value / vis.parentTotal));
            $('#parent-cat').text(parentCategory);
          // console.log(vis.parentTotal);
          d3.select(this).style("stroke", "black");
          d3.select(this).style("stroke-opacity", 1);
          if (d.data.name == 'All') {
            vis.tip.hide(d);
          }
          else {
            vis.tip.show(d);
          }
        }
      })
      .on("mouseout", function(d) {
          d3.select(this).style("stroke", "white");
          vis.tip.hide(d);
      })
      .append("title")
      // .text(computeTextFunction(vis.parentTotal)); // Partial appliication.  Doesn't work tho :(

  function click(d) {
    vis.parentTotal = d.value;
    parentCategory = d.data.name.toLowerCase();
    vis.svg.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(vis.x.domain(), [d.x0, d.x1]);
        var yd = d3.interpolate(vis.y.domain(), [d.y0, 1]);
        var yr = d3.interpolate(vis.y.range(), [d.y0 ? 20 : 0, vis.radius]);
        return function(t) { vis.x.domain(xd(t)); vis.y.domain(yd(t)).range(yr(t)); };
      })
      .selectAll("path")
      .attrTween("d", function(d) { return function() { return vis.arc(d); }; });
  }
}




