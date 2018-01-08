var socket=io();
let queryString = decodeURIComponent(window.location);
queryString = queryString.split('/');
queryString=queryString[queryString.length-1];
//queryString=queryString.substr(6);
//console.log(" prodId: "+queryString[queryString.length-1]);
$(()=>{
    // socket.emit('bid',{prodId:queryString});
    // socket.on('bid',(data)=>{
    //     data.bids.forEach(function (bid) {
    //         console.log(bid);
    //         if(bid.allBids.length==0){}else{
    //        var li= $(` <li id="${bid._id}"></li>`);
    //         bid.allBids.forEach((Bid)=> {
    //             li.append( `<div>user Id:${Bid.userID}</div>
    //             <div>price:${Bid.price}</div>
    //             <div>Time:${Bid.time}</div>`)
    //         });
    //         //console.log(li);
    //         $("#bids").append(li);
    //         }})
    //     });
    var elements = $('.bidid');
    // console.log("kkk",elements[0]);
    let id = elements[0].getAttribute('id');
    console.log(id);
    if(id) {
        console.log(queryString);
        socket.emit('bid', {prodId: queryString});
        socket.on('bid', (data) => {
            console.log("data", data);
            data.bids.forEach(function (bid) {
                console.log(bid);
                if (bid.allBids.length == 0) {
                } else {
                    var li = $(` <li id="${bid._id}"></li>`);
                    bid.allBids.forEach((Bid) => {
                        li.append(`<div>user Id:${Bid.userID}</div>
                <div>price:${Bid.price}</div>
                <div>Time:${Bid.time}</div>`)
                    });
                    //console.log(li);
                    $("#bids").append(li);
                }
            })
            // $.post(`/items/${id}/bid`,
            //     {
            //         bidprice:$('#minbid').val()
            //     },(data)=>{console.log(data);}
            // )
        });
    }
    let timer = new Timer();
    //timer.start();
    // console.log($("#item-detail").data("itemid"));
    $.get(`/items/${$("#item-detail").data("itemid")}/time`,function(data){
        console.log("ll");
        //console.log(data.timeRemaining);

        timer.start({countdown: true, startValues: {seconds: data.timeRemaining}});
        $('#timer').html(timer.getTimeValues().toString());

        timer.addEventListener("secondsUpdated", function (e) {
            $('#timer').html(timer.getTimeValues().toString());
        });

        timer.addEventListener('targetAchieved', function (e) {
            $('#timer').append('KABOOM!!');
        });
    })
});
