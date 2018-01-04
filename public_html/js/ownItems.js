$(function () {

        $("button[data-btn='details']").click(RedirectToItemDetails);
    })
//Open the Item's details page in a new tab
function RedirectToItemDetails(ev) {
    let id = ev.target.parentNode.id;
    console.log(id);
    window.open('/items/' + id);
}