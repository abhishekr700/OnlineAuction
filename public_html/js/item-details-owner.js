var socket = io();
let queryString = decodeURIComponent(window.location);
queryString = queryString.split('/');
queryString = queryString[queryString.length - 1];
//queryString=queryString.substr(6);
//console.log(" prodId: "+queryString[queryString.length-1]);
$(() => {
    console.log(queryString);
    socket.emit('prodID', {prodId: queryString});
    socket.on('bid', (data) => {
        console.log("def");
        var bid = data.bids;
        console.log(bid);
        var ul = $("#bids");
        ul.html("");
        if (bid.allBids.length === 0) {
        } else {

            bid.allBids.forEach((Bid) => {
                ul.prepend(`
                                <div class="item">
                    <img class="ui avatar image" src="../u.jpg">
                    <div class="content">
                      <div class="header">${Bid.userID}</div>
                      <div class="description">Placed a bid for <strong>${Bid.price}</strong></div>
                    </div>
                  </div>
                `)
            });

        }
    })

    let timer = new Timer();
    $.get(`/items/${$("#item-detail").data("itemid")}/time`, function (data) {
        // console.log("ll");
        console.log(data.timeRemaining);
        if (data.timeRemaining > 0) {
            timer.start({countdown: true, startValues: {seconds: data.timeRemaining}});

            timer.addEventListener("secondsUpdated", function (e) {
                $('#timer .days').html(timer.getTimeValues().days);
                $('#timer .hours').html(timer.getTimeValues().hours);
                $('#timer .minutes').html(timer.getTimeValues().minutes);
                $('#timer .seconds').html(timer.getTimeValues().seconds);
            });

            timer.addEventListener('targetAchieved', function (e) {
                $('#timer').html("Bid Closed");
                //Emit event on timer ends
                socket.emit("bid-closed",{
                    prodID: $("#item-detail").data("itemid")
                });
            });
        }
        else {
            $('#timer').html("Bid Closed");
        }
    })

    socket.on("msg",(data)=>{
        console.log(data);
        $("#msg").html(data.msg);
    })
});
