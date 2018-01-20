$(()=>{
    console.log("Loaded");
    $('.message .close')
        .on('click', function() {
            $(this)
                .closest('.message')
                .transition('fade')
            ;
        })
    ;
});

function checkSame() {
    let val1 = $("#newpass1").val();
    let val2 = $("#newpass2").val();
    console.log(val1, val2);
    if (val1 === val2) {
        return true;
    }
    else {
        $('.negative.message').removeClass('hidden')
        return false;
    }
}