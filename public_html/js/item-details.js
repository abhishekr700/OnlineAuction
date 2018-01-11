var socket = io();

$(() => {
    let name = $(".bidplaced")[0].id;

    socket.emit("prodID", {
        prodId: $('#bid')[0].name
    })
    socket.on('bid', (data) => {
        var bid = data.bids;
        var ul = $("#bids");
        ul.html("");
        if (bid.allBids.length === 0) {
        } else {

            bid.allBids.forEach((Bid) => {
                var li = $("<li></\li>");
                var div = $(`<div>user Id:${Bid.userID}</div>
                <div>price:${Bid.price}</div>
                <div>Time:${Bid.time}</div>`);
                li.append(div);
                ul.append(li);
            });

        }
    })
    if (name) {
        console.log($('#bid')[0].name);
        socket.emit('bid2'
            , {prodId: $('#bid')[0].name});

    }

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
                    prodID: $('#bid')[0].name
                });
            });
        }
        else {
            $('#timer').html("Bid Closed");
        }
    })

    socket.on("msg",(data)=>{
        $("#msg").html(data.msg);
    })
});
