$(()=>{
    //Initialize dropdown
    $('.ui.dropdown').dropdown({
        transition: 'drop',
        on: 'hover',
        duration: 300
    });
    console.log("Dropdown done");
});