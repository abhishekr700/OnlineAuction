$(() => {
    //edit for phone 1
    var buttonclick=$('#ChangePhone1Button');
    var contentedit1=$('#contentedit');

    //toggle edit button
    buttonclick.on('click',function() {
        //set attribute content editable
        if (contentedit1.attr('data-click-state') == 1) {
            contentedit1.attr('data-click-state', 0);
            contentedit1.removeAttr("contenteditable");
        }
        //remove attribute content editable
        else {
            contentedit1.attr('data-click-state', 1);
            contentedit1.attr("contenteditable", "true");
        }
    });
    //edit for phone 2
    var contentedit2=$('#contentedit2');
    var buttonclick2=$('#ChangePhone2Button');
    buttonclick2.attr("data-phone").replace(/\s/g,'')

    //toggle edit button
    buttonclick2.on('click',function() {

        //set attribute content editable
        if (contentedit2.attr('data-click-state') == 1) {
            contentedit2.attr('data-click-state', 0)

            contentedit2.removeAttr("contenteditable");
            console.log("false");
        }
        //remove attribute content editable
        else {
            contentedit2.attr('data-click-state', 1);
            contentedit2.attr("contenteditable", "true");
            console.log("true");
        }
    });


    //edit profile post
    var editProfile=$('#editProfile');
    editProfile.click(function () {

        var content1=contentedit1.html().replace(/\s/g,'');
        var content2=contentedit2.html().replace(/\s/g,'');
        //update only if fields changed
        if(content1!=buttonclick.attr("data-phone").replace(/\s/g,'')||content2!=buttonclick2.attr("data-phone").replace(/\s/g,'')) {

            if (content1.length == 10&&content2.length&&content1.match(/^[0-9]+$/) != null&&content2.match(/^[0-9]+$/) != null) {
                $.post('/users/editprofile', {
                        phone1: contentedit1.html(),
                        phone2: contentedit2.html()
                    },
                    function () {
                        $('#edit-message').text("Updated Profile Page");
                        contentedit1.removeAttr("contenteditable");
                        contentedit2.removeAttr("contenteditable");
                        console.log("done");
                    })
            }
            else {
                $('#edit-message').text("Number Pattern not matched");
            }

        }
        else{
            $('#edit-message').text("Already Updated");

            }
    })

});