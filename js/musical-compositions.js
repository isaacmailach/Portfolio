$(document).ready(function () {
    Math.random();
    $.getJSON('data/musical-compositions.json', function (database) {
        for (var i = 0; i < database.item.length; i++) {
            $('.page-content-grid').append('<div class="page-content-grid-item" data-id="' + database.item[i].id +'" style="flex-grow: ' + Math.random() + ';"><img class="page-content-grid-item-image" src="img/musical-compositions/' + database.item[i].id + '/image.jpg" /><div class="page-content-grid-item-overlay"><h1 class="page-content-grid-item-overlay-heading">' + database.item[i].name + '</h1></div></div>');
        }
        $('.page-content-grid-item').click(function () {
            OpenPopup($(this).data('id'));
        });
        
    }).fail(function(){
        alert('Sorry! Could not load the webpage properly. Make sure you are connected to the Internet and then try refreshing the page.');
    });
    $(document).keydown(function (e) {
        if (e.keyCode === 27) {
            ClosePopup();
        }
    });
    $('.popup-content').click(function () {
        event.stopPropagation();
    });
    $('.popup').click(function () {
        ClosePopup();
    });
    
    
    function OpenPopup (id) {
        $('.popup').css('display', 'block');
        setTimeout(function () {$('.popup').addClass('open');}, 50);
        $('.popup-content-image').attr('src', 'img/musical-compositions/' + id + '/cover.jpg');
    }
    function ClosePopup () {
        $('.popup').removeClass('open');
        setTimeout(function () {$('.popup').css('display', 'none');}, 1001);
    }
});