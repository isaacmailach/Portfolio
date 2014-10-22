$(document).ready(function () {
    if (CheckQueries().id) {
        OpenPopup(CheckQueries().id);
    }
    $.getJSON('data/musical-compositions.json', function (database) {
        for (var i = 0; i < database.item.length; i++) {
            $('.page-content-grid').append('<div class="page-content-grid-item" data-id="' + database.item[i].id +'" style="flex-grow: ' + Math.random() + ';"><img class="page-content-grid-item-image" src="img/musical-compositions/' + database.item[i].id + '/image.jpg" /><div class="page-content-grid-item-overlay"><h3 class="page-content-grid-item-overlay-heading">' + database.item[i].name + '</h1><small class="page-content-grid-item-overlay-meta">' + database.item[i].date + '</small></div></div>');
        }
        $('.page-content-grid-item').click(function () {
            OpenPopup($(this).data('id'));
        });
    }).fail(function () {
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
    $('.popup, .popup-content-close').click(function () {
        ClosePopup();
    });
    
    function CheckQueries () {
        var query = {};
        var substring = window.location.search.substring(1).split('&');
        for (var i = 0; i < substring.length; i++) {
            var vars = substring[i].split('=');
            query[vars[0]] = vars[1];
        }
        return query;
    }
    function OpenPopup (id) {
        $.get('text/musical-compositions/' + id + '.txt', function (text) {
            $('.popup-content-image').attr('src', 'img/musical-compositions/' + id + '/cover.jpg');
            $('.popup-content-body').html(marked(text));
            window.history.replaceState('', 'Isaac Mailach - Musical Compositions', window.location.pathname + '?id=' + id);
            $('.popup').css('display', 'block');
            setTimeout(function () {$('.popup').addClass('open');}, 50);
        }, 'text').fail(function () {
            alert('Sorry! Could not load the webpage properly. Make sure you are connected to the Internet and then try refreshing the page.');
        });
    }
    function ClosePopup () {
        window.history.replaceState('', 'Isaac Mailach - Musical Compositions', window.location.pathname);
        $('.popup').removeClass('open');
        setTimeout(function () {$('.popup').css('display', 'none');}, 1001);
    }
});