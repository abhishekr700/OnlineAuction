$(function () {
    //Get all items and display
    $.get('/items/all',function (data) {
        data.forEach(function (item) {
            console.log(item);
            $("#productlist").append(`
            <li id="${item._id}">
                <img src="../Images/" height="100">
                <div>Product Name:${item.name}</div>
                <!--<div>Description:${item.desc}</div>-->
                <div>Category:${item.category}</div>
                <!--<div>Minimum Bid:${item.basevalue}</div>-->
                <div>Duration:${item.duration}</div>
                <button data-btn="details">View Item Details</button>
            
            </li>
            `)
        });
        $("button[data-btn='details']").click(RedirectToItemDetails);
    })
});

//Open the Item's details page in a new tab
function RedirectToItemDetails(ev) {
    let id = ev.target.parentNode.id;
    console.log(id);
    window.open ('/items/' + id);
}