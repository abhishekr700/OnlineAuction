$(()=>{
    $('#bid').click(()=>{
        var socket=io();
        console.log($('#bid')[0].name);
        socket.emit('bid2',{prodId:$('#bid')[0].name});

    })
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
