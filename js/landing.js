var currHeadlineIndex = 0;
var headlines = [
    {src: "images/headlines/headline_1.png", link: "http://www.latimes.com/business/hiltzik/la-fi-hiltzik-medicare-ryan-20171208-story.html"},
    {src: "images/headlines/headline_2.png", link: "http://www.latimes.com/politics/la-na-pol-drug-prices-report-20171130-story.html"},
    {src: "images/headlines/headline_3.png", link: "http://www.latimes.com/business/lazarus/la-fi-lazarus-phone-fees-20171205-story.html"},
    {src: "images/headlines/headline_4.png", link: "https://www.nytimes.com/2017/12/09/health/drug-prices-generics-insurance.html"},
    {src: "images/headlines/headline_5.png", link: "https://www.nytimes.com/interactive/2017/11/28/us/politics/obamacare-individual-mandate-penalty-maps.html"},
    {src: "images/headlines/headline_6.png", link: "https://www.usnews.com/news/best-countries/articles/2017-11-28/older-americans-are-sicker-than-seniors-in-other-wealthy-nations-survey-finds"}
];

var totalDelta = 0;
var scrollElementParams = {
    "text-scroll-1": {
        opacity: 1,
        decreaseOpacity: true,
        active: true,
        stopped: false,
        translation: 0,
        scale: 1,
    },
    "text-scroll-2": {
        opacity: 0.75,
        decreaseOpacity: false,
        active: false,
        stopped: false,
        translation: 100,
        scale: 0.9,
    },
    "text-scroll-3": {
        opacity: 0.5,
        decreaseOpacity: false,
        active: false,
        stopped: false,
        translation: 200,
        scale: 0.8,
    },
    "text-scroll-4": {
        opacity: 0.25,
        decreaseOpacity: false,
        active: false,
        stopped: false,
        translation: 300,
        scale: 0.7,
    },
    "text-scroll-5": {
        opacity: 0,
        decreaseOpacity: false,
        active: false,
        stopped: false,
        translation: 400,
        scale: 0.6,
    },
    "text-scroll-6": {
        opacity: -0.25,
        decreaseOpacity: false,
        active: false,
        stopped: false,
        translation: 500,
        scale: 0.5,
    },
    "text-scroll-7": {
        opacity: -0.5,
        decreaseOpacity: false,
        active: false,
        stopped: false,
        translation: 600,
        scale: 0.4,
    }
};

// listen for mouse scroll
$(document).bind("wheel", function(e) {
    // var delta = e.originalEvent.wheelDelta;
    var delta = -1 * e.originalEvent.deltaY;

    // only allow users to scroll downwards
    if (delta >= 0) { return; }
    totalDelta += delta;

    for (var i=1; i<=7; i++) {
        var currScrollElement = scrollElementParams["text-scroll-" + i];

        if (!currScrollElement.stopped && totalDelta <= (i - 1) * -250) {
            currScrollElement.active = true;
        }

        if (currScrollElement.active) {
            // if element is active, translate upwards, scale, and decrease opacity
            var translation = 0.2 * (totalDelta - ((i - 1) * -250)) + currScrollElement.translation;

            if (i == 6 && translation <= 100) {
                translation = 100;
                currScrollElement.active = false;
                currScrollElement.stopped = true;
            } else if (i == 7 && translation <= 225) {
                translation = 225;
                currScrollElement.active = false;
                currScrollElement.stopped = true;

                document.getElementById("scroll-icon-text").innerHTML = "Click to Explore";
                $("#mouse-icon-btn").click(function() {
                    window.location.href = "quiz.html";
                });
            }
            else if (translation <= -500) {
                translation = -500;
                currScrollElement.active = false;
                currScrollElement.stopped = true;
            }

            var scale = -0.0005 * (totalDelta - ((i - 1) * -250)) + currScrollElement.scale;

            if (currScrollElement.decreaseOpacity) {
                // decrease opacity
                var opacity = 0.001 * (totalDelta - ((2 * i - 1) * -250)) + currScrollElement.opacity;
            } else {
                // increase opacity
                var opacity = -0.001 * (totalDelta - ((i - 1) * -250)) + currScrollElement.opacity;
                if (opacity >= 1) {
                    opacity = 1;
                    currScrollElement.opacity = 1;
                    if (i <= 5) {
                        currScrollElement.decreaseOpacity = true;
                    }
                }
            }

            $("#text-scroll-" + i).css("transform", "translate(0%," + translation + "%) scale(" + scale + "," + scale + ")");
            $("#text-scroll-" + i).css("opacity", opacity);
        }
    }
});

function displayNextHeadline() {
    currHeadlineIndex = (currHeadlineIndex == headlines.length - 1) ? 0 : currHeadlineIndex + 1;

    $("#headline")
        .fadeOut(500, function() {
            $("#headline").attr("src", headlines[currHeadlineIndex].src);
        })
        .fadeIn(600);

    $("#headline-link").attr("href", headlines[currHeadlineIndex].link);
}

function startTimer() {
    setInterval(displayNextHeadline, 4000);
}
