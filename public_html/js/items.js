$(function () {

    $('#filter').click(()=> {

        $('.ui.sidebar').sidebar('toggle');

    });
    $('.context.example .ui.sidebar')
        .sidebar({
            context: $('.context.example .bottom.segment'),
            dimPage:false
        })
        .sidebar('attach events', '.context.example .menu .item')
    ;

    //Update timers for each item displayed
    let list = $("#productlist").children();
    var noitem=$('#NoItems');
    if(noitem.length===0) {
        for (let item of list.children()) {
            updateTimer(item.getAttribute("id"));
        }

        //Add event handler for "View Details" button
        $("button[data-btn='details']").click(RedirectToItemDetails);
    }

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
                    $(`div[data-timer="${prodID}"]`).css('font-size', '3vmin');
                }
                $(`div[data-timer="${prodID}"] .days`).html(timer.getTimeValues().days);
                $(`div[data-timer="${prodID}"] .hours`).html(timer.getTimeValues().hours.zeroPad());
                $(`div[data-timer="${prodID}"] .minutes`).html(timer.getTimeValues().minutes.zeroPad());
                $(`div[data-timer="${prodID}"] .seconds`).html(timer.getTimeValues().seconds.zeroPad());
                $(`div[data-max-price="${prodID}"]`).html("Current Value");
            });

            timer.addEventListener('targetAchieved', function (e) {
                let timer=`div[data-timer="${prodID}"]`;
                $(timer).html("Bid Closed");
                $(`div[data-max-price="${prodID}"]`).html("Sold At");
                $(timer).css("font-size","x-large");
                $(timer).css("color","blue");
            });
        }
        else {
            //If bid already closed
            let timer=`div[data-timer="${prodID}"]`;
            $(`div[data-max-price="${prodID}"]`).html("Sold At")
            $(timer).html("Bid Closed");
            $(timer).css("font-size"," x-large");
            $(timer).css("color","purple");
        }
    })
}

//Event handler for "View Item Details" button (Open the Item's details page in a new tab)
function RedirectToItemDetails(ev) {
    let id = ev.target.parentNode.id;
    window.open('/items/' + id);
}