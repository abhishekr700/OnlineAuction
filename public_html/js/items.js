$(function () {
        $("button[data-btn='details']").click(RedirectToItemDetails);
    let list = $("#productlist").children();
    console.log(list);
    console.log(typeof list);
    console.log(list[0]);
    for(let item of list){
        console.log(item);
        console.log(item.getAttribute("id"))
        updateTimer(item.getAttribute("id"))
    }
});

//Update Timers
function updateTimer(prodID){
    let timer = new Timer();

    $.get(`/items/${prodID}/time`, function (data) {
        // console.log("ll");
        console.log(data.timeRemaining);
        if(data.timeRemaining > 0){
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
            $(`div[data-timer="${prodID}"]`).html("Bid Closed");
        }
    })
}

//Open the Item's details page in a new tab
function RedirectToItemDetails(ev) {
    let id = ev.target.parentNode.id;
    console.log(id);
    window.open('/items/' + id);
}