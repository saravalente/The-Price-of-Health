var typewriterIndex = 0;
var typewriterText = "What's the distribution of health care spending in the US? Relatively equal? Or does a " +
    "small portion of the population account for most of it? Draw your best guess! Once you've finished, we'll " +
    "compare your line to reality.";
var typewriterSpeed = 25;
var timeout = null;

// load data asynchronously
queue()
    .defer(d3.json, "data/diseases.json")
    .defer(d3.csv, "data/spending_data.csv")
    .await(createVis);

// create event handler
var eventHandler = {};

function createVis(error, diseasesData, spendingData) {
    if (error) {
        console.log(error);
    }

    // process spending data
    spendingData.forEach(function(d) {
        // convert to numeric values
        d.percent_population = +d.percent_population;
        d.percent_spending = +d.percent_spending;
    });

    var sunBurst = new SunBurst("sunburst", diseasesData);
    var cumulativeVis = new CumulativeVis("cumulativevis", spendingData);

    // bind event handlers
    $(eventHandler).bind("doneButtonClicked", function (event) {
        cumulativeVis.doneButtonClicked();
    });
    $(eventHandler).bind("startOverButtonClicked", function (event) {
        cumulativeVis.startOverButtonClicked();
    });

    // start typewriter effect
    typeWriter();
}

function doneClicked() {
    $(eventHandler).trigger("doneButtonClicked");
}

function startOverClicked() {
    $("#done-btn").addClass("disabled");
    $("#start-over-btn").addClass("disabled");
    $(eventHandler).trigger("startOverButtonClicked");
}

function typeWriter() {
    if (typewriterIndex < typewriterText.length) {
        document.getElementById("typewriter-effect").innerHTML += typewriterText.charAt(typewriterIndex);
        typewriterIndex++;
        timeout = setTimeout(typeWriter, typewriterSpeed);
    }
}