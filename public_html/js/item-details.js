var socket=io();
$(()=>{
    var name=$(".bidplaced")[0].id;

        console.log(name);
    if(name)
    {
        console.log($('#bid')[0].name);
        socket.emit('bid2',{prodId:$('#bid')[0].name});

    }
    let timer = new Timer();
    //timer.start();
    // console.log($("#item-detail").data("itemid"));
    $.get(`/items/${$("#item-detail").data("itemid")}/time`,function(data){
        // console.log("ll");
        console.log(data.timeRemaining);

        timer.start({countdown: true, startValues: {seconds: data.timeRemaining}});

        timer.addEventListener("secondsUpdated", function (e) {
            $('#timer .days').html(timer.getTimeValues().days);
            $('#timer .hours').html(timer.getTimeValues().hours);
            $('#timer .minutes').html(timer.getTimeValues().minutes);
            $('#timer .seconds').html(timer.getTimeValues().seconds);
        });

        timer.addEventListener('targetAchieved', function (e) {
            $('#timer').append('KABOOM!!');
        });
    })
});
