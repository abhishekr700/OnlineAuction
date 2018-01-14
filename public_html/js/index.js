$(()=> {
    $('.special.cards .image').dimmer({
        on: 'hover'
    });
    //Update timers for each item displayed
    let list = $("#productlist").children();

    for (let item of list) {
        updateTimer(item.getAttribute("id"));
    }

    //Add event handler for "View Details" button
   // console.log( $("button[data-btn='details']"));
    $("button[data-btn='details']").click(RedirectToItemDetails);
});
//Update timer of a single product
function updateTimer(prodID) {
    let timer = new Timer();

    //Get time from server
    $.get(`/items/${prodID}/time`, function (data) {
        // console.log(data.timeRemaining);
        if (data.timeRemaining > 0) {
            timer.start({countdown: true, startValues: {seconds: data.timeRemaining}});

            timer.addEventListener("secondsUpdated", function (e) {
                $(`div[data-timer="${prodID}"] .days`).html(timer.getTimeValues().days);
                $(`div[data-timer="${prodID}"] .hours`).html(timer.getTimeValues().hours);
                $(`div[data-timer="${prodID}"] .minutes`).html(timer.getTimeValues().minutes);
                $(`div[data-timer="${prodID}"] .seconds`).html(timer.getTimeValues().seconds);
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