$(()=> {
    $('.special.cards .image').dimmer({
        on: 'hover'
    });
    //Update timers for each item displayed
    let list = $("#productlist").children(".card");

    for (let item of list) {
        updateTimer(item.getAttribute("id"));
    }

    //Add event handler for "View Details" button
    // console.log( $("button[data-btn='details']"));
    $("button[data-btn='details']").click(RedirectToItemDetails);
});
Number.prototype.zeroPad = function(length) {
    length = length || 2; // defaults to 2 if no parameter is passed
    return (new Array(length).join('0')+this).slice(length*-1);
};
//Update timer of a single product
function updateTimer(prodID) {
    let timer = new Timer();

    //Get time from server
    $.get(`/items/${prodID}/time`, function (data) {
        // console.log(data.timeRemaining);
        if (data.timeRemaining > 0) {
            timer.start({countdown: true, startValues: {seconds: data.timeRemaining}});

            timer.addEventListener("secondsUpdated", function (e) {
                if(timer.getTimeValues().days== '0' && timer.getTimeValues().hours=='0'&& timer.getTimeValues().minutes == '0' && timer.getTimeValues().seconds<50 ) {
                    $(`div[data-timer="${prodID}"]`).css('color', 'red');
                    $(`div[data-timer="${prodID}"]`).css('font-size', 'large');
                }
                $(`div[data-timer="${prodID}"] .days`).html(timer.getTimeValues().days);
                $(`div[data-timer="${prodID}"] .hours`).html(timer.getTimeValues().hours.zeroPad());
                $(`div[data-timer="${prodID}"] .minutes`).html(timer.getTimeValues().minutes.zeroPad());
                $(`div[data-timer="${prodID}"] .seconds`).html(timer.getTimeValues().seconds.zeroPad());
            });

            timer.addEventListener('targetAchieved', function (e) {
                $(`div[data-timer="${prodID}"]`).html("Bid Closed");
            });
        }
        else {
            //If bid already closed
            $(`div[data-timer="${prodID}"]`).html("Bid Closed");
        }
    })
}

//Event handler for "View Item Details" button (Open the Item's details page in a new tab)
function RedirectToItemDetails(ev) {
    let id = ev.target.parentNode.id;
    console.log(id);
    window.open('/items/' + id);
}