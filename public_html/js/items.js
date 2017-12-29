$(function () {
    $.get('/items/all',function (data) {
        data.forEach(function (item) {
            console.log(item);
            $("#productlist").append(`
            <li id="${item._id}">
                <img src="../Images/" height="100">
                <div>Product Name:${item.name}</div>
                <div>Description:${item.desc}</div>
                <div>Category:${item.category}</div>
                <div>Minimum Bid:${item.basevalue}</div>
                <div>Duration:${item.duration}</div>
                <button data-btn="placebid">Place bid</button>
            
            </li>
            `)
        })
        $("button[data-btn=placebid]").click(placebid)
    })
});
function placebid(ev) {
    let id=ev.target.parentNode.id;
    console.log(id);
    window.location='/items/bid/'+id;
}