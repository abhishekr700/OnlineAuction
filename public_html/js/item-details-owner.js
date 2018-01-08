var socket=io();
let queryString = decodeURIComponent(window.location);
queryString = queryString.split('/');
queryString=queryString[queryString.length-1];
//queryString=queryString.substr(6);
//console.log(" prodId: "+queryString[queryString.length-1]);
$(()=>{
    console.log(queryString);
    socket.emit('bid',{prodId:queryString});
    socket.on('bid',(data)=>{
        console.log("def");
        var bid=data.bids;
        console.log(bid);
        var ul= $("#bids");
             ul.html("");
            if(bid.allBids.length===0){}else{

                bid.allBids.forEach((Bid)=> {
                    var li=$("<li></\li>");
                 var div=$( `<div>user Id:${Bid.userID}</div>
                <div>price:${Bid.price}</div>
                <div>Time:${Bid.time}</div>`);
                    li.append(div);
                    ul.append(li);
                });

            }})
    let timer = new Timer();
    //timer.start();
    // console.log($("#item-detail").data("itemid"));
    $.get(`/items/${$("#item-detail").data("itemid")}/time`,function(data){
        // console.log(data);
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
