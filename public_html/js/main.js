$( ()=> {
    $("#user").click(()=>{
        //TODO: bid for product to be added later
        window.location = '/user.html'
    });

    $("#admin").click(()=>{
        window.location = '/pplacer.html'
    })

    $.get('/userproducts',function (data) {
        data.forEach(function (item) {
            console.log(item);
            $("#productlist").append(`
            <li id="${item.id}">
                <img src="../Images/" height="100">
                <div>Product Name:${item.name}</div>
                <div>Description:${item.desc}</div>
                <div>Category:${item.category}</div>
                <div>Minimum Bid:${item.basevalue}</div>
                <div>Duration:${item.duration}</div>
                <button>Place bid</button>
            
            </li>
            `)
        })
    })
});