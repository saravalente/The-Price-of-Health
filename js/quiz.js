var numCorrect = 0;
var currAnalysisItem = 1;
var moveDict = {
    "quiz-analysis-div-1": true,
    "quiz-analysis-div-2": true,
    "quiz-analysis-div-3": true,
    "quiz-analysis-div-4": true,
    "quiz-analysis-div-5": true,
    "quiz-analysis-div-6": true,
};

// listen for mouse scroll on overlay
$("#quiz-analysis").bind("wheel", function(e) {
    // var delta = e.originalEvent.wheelDelta;
    var delta = -1 * e.originalEvent.deltaY;
    if (delta >= 0) {
        return;
    }

    if (delta <= -10) {
        if (currAnalysisItem == 1 && moveDict["quiz-analysis-div-1"]) {
            $("#quiz-analysis-div-1").fadeOut(500);
            moveDict["quiz-analysis-div-1"] = false;
            setTimeout(function() {
                $("#quiz-analysis-div-2").css("visibility", "visible");
                currAnalysisItem += 1;
            }, 1000);
        }
        if (currAnalysisItem == 2 && moveDict["quiz-analysis-div-2"]) {
            $("#quiz-analysis-div-2").fadeOut(500);
            moveDict["quiz-analysis-div-2"] = false;
            setTimeout(function() {
                $("#quiz-analysis-div-3").css("visibility", "visible");
                currAnalysisItem += 1;
            }, 1000);
        }
        if (currAnalysisItem == 3 && moveDict["quiz-analysis-div-3"]) {
            $("#quiz-analysis-div-3").fadeOut(500);
            moveDict["quiz-analysis-div-3"] = false;
            setTimeout(function() {
                $("#quiz-analysis-div-4").css("visibility", "visible");
                currAnalysisItem += 1;
            }, 1000);
        }
        if (currAnalysisItem == 4 && moveDict["quiz-analysis-div-4"]) {
            $("#quiz-analysis-div-4").fadeOut(500);
            moveDict["quiz-analysis-div-4"] = false;
            setTimeout(function() {
                $("#quiz-analysis-div-5").css("visibility", "visible");
                currAnalysisItem += 1;
            }, 1000);
        }
        if (currAnalysisItem == 5 && moveDict["quiz-analysis-div-5"]) {
            $("#quiz-analysis-div-5").fadeOut(500);
            moveDict["quiz-analysis-div-5"] = false;
            setTimeout(function() {
                $("#quiz-analysis-div-6").css("visibility", "visible");
                currAnalysisItem += 1;
                document.getElementById("scroll-icon-text").innerHTML = "Click to Continue";
                $("#mouse-icon-btn").click(function() {
                    window.location.href = "global.html";
                });
            }, 1000);
        }
    }

    e.preventDefault();
});

function quizButtonClicked(button) {
    var questionNumber = button.classList[1].substring(1, 2);
    $(".q" + questionNumber).removeClass("selected-answer");
    button.classList.add("selected-answer");

    $(".q" + questionNumber).each(function(i, b) {
        if (b.classList.contains("selected-answer")) {
            b.style.background = "rgba(99,193,230,0.5)";
        } else {
            b.style.background = "transparent";
        }
    });
}

function quizSubmitted() {
    numCorrect = 0;

    // get selected answers
    if ($(".selected-answer").length < 5) {
        $("#quiz-error-message").html("Error: please answer all questions");
        return;
    }
    $("#quiz-error-message").html("");
    $(".selected-answer").each(function(i, b) {
        if (!b.classList.contains("correct-answer")) {
            b.style.background = "rgba(255,0,0,0.5)";
        } else {
            numCorrect += 1;
        }
    });
    $(".correct-answer").css("background", "rgba(0,255,0,0.5");
    $("#quiz-submit").html("VIEW RESULTS");

    // disable scrolling
    $("body").css("overflow", "hidden");

    var message = "";
    if (numCorrect == 5) {
        message = "You're practically an expert!";
    } else if (numCorrect == 4) {
        message = "You're pretty good at this!";
    } else if (numCorrect == 3 || numCorrect == 2) {
        message = "Not too bad!";
    } else if (numCorrect == 1 || numCorrect == 0) {
        message = "Oof! Not so hot!";
    }

    $("#quiz-analysis-1").html("<strong>" + message + "</strong>");
    $("#quiz-analysis-2").html("You got " + numCorrect + "/5 questions!");

    openOverlay();
}

function openOverlay() {
    $("#overlay-content-div").css("opacity", "0");
    $("#quiz-results-span").css("visibility", "hidden");
    document.getElementById("quiz-analysis").style.width = "400px";
    setTimeout(function() {
        $("#quiz-results-span").css("visibility", "visible");
        $("#mouse-div").css("visibility", "visible");
        $("#overlay-content-div").css("opacity", "1");
    }, 500);
}

function closeOverlay() {
    $("#overlay-content-div").css("opacity", "0");
    $("#quiz-results-span").css("visibility", "hidden");
    document.getElementById("quiz-analysis").style.width = "0%";

    // re-enable scrolling
    $("body").css("overflow", "auto");
    $("#mouse-div").css("visibility", "hidden");
}