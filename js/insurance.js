// load data asynchronously
queue()
    .defer(d3.json, "data/plan_data.json")
    .defer(d3.json, "data/plan_costs.json")
    .defer(d3.json, "data/us-10m.json")
    .defer(d3.csv, "data/choropleth_data.csv")
    .await(createVis);

var mapDetail1 = null;
var mapDetail2 = null;
var mapDetail3 = null;
var detailData2 = null;
var detailData3 = null;

function createVis(error, planData1, planData2, mapTopJson, choroplethData) {
	if (error) {
		console.log(error);
	}

	// process plan data
    planData2.forEach(function(d) {
        d = +d;
    });
    planData2 = planData2.filter(function(d) {
        return (d > 100);
    });

    // process choropleth data
    choroplethData.forEach(function(d) {
        // convert to numeric values
        d.Code = +d.Code;
        d.Coverage = +d.Coverage;
        d.Premiums = +d.Premiums;
        d.Charges = +d.Charges;
    });

    // map state code to choropleth data
    var choroplethDataMap = {};
    choroplethData.forEach(function(d) { choroplethDataMap[d.Code] = d; });

    // convert TopoJSON to GeoJSON
    var usaStates = topojson.feature(mapTopJson, mapTopJson.objects.states).features;
    var usaCounties = topojson.feature(mapTopJson, mapTopJson.objects.counties).features;

    // merge choropleth data into GeoJSON
    usaStates.forEach(function(d) {
        if (d.id in choroplethDataMap) {
            d.properties.data = choroplethDataMap[d.id];
        }
    })

	// create visualization instances
    plansVis = new PlansVis("plansvis", planData1, planData2);

    var mapVis = new MapVis("mapvis", usaStates, usaCounties, choroplethData);

    mapDetail1 = new MiniDonut("mapdetailvis1", 0.92);

    detailData2 = [{key: "California", value: 225}, {key: "US Mean", value: 235}];
    var config2 = {title: "Monthly Premium Cost", fill: "#143451"};
    mapDetail2 = new MapBarChart("mapdetailvis2", detailData2, config2);

    detailData3 = [{key: "California", value: 3341}, {key: "US Mean", value: 2271}];
    var config3 = {title: "Hospital Expenses Per Patient Day", fill: "#63c1e6"};
    mapDetail3 = new MapBarChart("mapdetailvis3", detailData3, config3);
}

function stateClicked(d) {
    console.log(d);
    mapDetail1.data = d.properties.data.Coverage / 100.0;
    mapDetail1.wrangleData();

    detailData2[0].key = d.properties.data.State;
    detailData2[0].value = d.properties.data.Premiums;
    mapDetail2.data = detailData2;
    mapDetail2.wrangleData();

    detailData3[0].key = d.properties.data.State;
    detailData3[0].value = d.properties.data.Charges;
    mapDetail3.data = detailData3;
    mapDetail3.wrangleData();
}