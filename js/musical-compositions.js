$(document).ready(function () {
    Math.random();
    $.getJSON('data/item-database.json', function (database) {
        for (var i = 0; i < database.item.length; i++) {
            $('.page-content-grid').append('<div class="page-content-grid-item"><h1>' + database.item[i].name + '</h1></div>');
        }
        alert(database.item[1].name);
    }).fail(function(){alert('cow');});
});