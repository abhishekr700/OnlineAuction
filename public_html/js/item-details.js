var socket = io();
let queryString = decodeURIComponent(window.location);
queryString = queryString.split('/');
queryString = queryString[queryString.length - 1];
$(() => {

    let isOwner = $(".owner")[0].id;

    socket.emit('prodID', {prodId: queryString});
    socket.on('bid', (data) => {
        console.log(data);
        var bid = data.bids;
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
    });
    Number.prototype.zeroPad = function (length) {
        length = length || 2; // defaults to 2 if no parameter is passed
        return (new Array(length).join('0') + this).slice(length * -1);
    };
    let timer = new Timer();
    $.get(`/items/${$("#item-detail").data("itemid")}/time`, function (data) {
        if (data.timeRemaining > 0) {
            timer.start({countdown: true, startValues: {seconds: data.timeRemaining}});

            timer.addEventListener("secondsUpdated", function (e) {
                $('#timer .days').html(timer.getTimeValues().days);
                $('#timer .hours').html(timer.getTimeValues().hours.zeroPad());
                $('#timer .minutes').html(timer.getTimeValues().minutes.zeroPad());
                $('#timer .seconds').html(timer.getTimeValues().seconds.zeroPad());
            });

            timer.addEventListener('targetAchieved', function (e) {
                $('#timer').html("Bid Closed").css('font-size', 'x-large');
                //Emit event on timer ends
                $('#max-price').html("Sold At");
                socket.emit("bid-closed", {
                    prodID: $("#item-detail").data("itemid")
                });
            });
        }
        else {
            $('#max-price').html("Sold At");
            $('#timer').html("Bid Closed").css('font-size', 'x-large');
            socket.emit("bid-closed", {
                prodID: $("#item-detail").data("itemid")
            });
        }
    });

    socket.on("msg", (data) => {
        console.log(data);
        $("#msg").html(data.msg);
    })
});
