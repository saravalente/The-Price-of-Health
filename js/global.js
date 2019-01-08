var internationalVis = null;

function openOverlay() {
    $("#overlay-content-div").css("opacity", "0");
    $("#about-data-span").css("visibility", "hidden");
    document.getElementById("global-data-info").style.width = "350px";
    setTimeout(function() {
        $("#overlay-content-div").css("opacity", "1");
        $("#about-data-span").css("visibility", "visible");
    }, 500);
}

function closeOverlay() {
    $("#overlay-content-div").css("opacity", "0");
    $("#about-data-span").css("visibility", "hidden");
    document.getElementById("global-data-info").style.width = "0%";
}

$("#about-data-button").css("visibility", "hidden");
d3.csv("data/international_data.csv", function(error, data) {
    if (error) {
        console.log(error);
    }

    // process international data
    data.forEach(function(d) {
        // convert to date object and numeric values
        d.Year = new Date(d.Year);
        d.Health_Expenditure = +d.Health_Expenditure;
        d.Life_Expectancy = +d.Life_Expectancy;
    });

    // create visualization instance
    internationalVis = new InternationalVis("internationalvis", data);

    // show about data button
    $("#about-data-button").css("visibility", "visible");
});

// add click listeners to search elements
$("#search-bar-list li").click(function(e) {
    var countryName = $(this).find("span").html();
    internationalVis.highlightCountry(countryName);
})

function updateSearch() {
    var input = document.getElementById("search-input");
    var filter = input.value.toUpperCase();
    var ul = document.getElementById("search-bar-list");
    var li = ul.getElementsByTagName("li");

    // loop through all list items, and hide those that don't match the search query
    for (var i = 0; i < li.length; i++) {
        var a = li[i].getElementsByTagName("span")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}