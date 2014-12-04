$(document).ready(function () {
    var audio = $('.popup-content-audio')[0];
    var play = false;
    var query = {};
    var subString = window.location.search.substring(1).split('&');
    
    for (var i = 0; i < subString.length; i++) {
        var vars = subString[i].split('=');
        query[vars[0]] = vars[1];
    }
    if (query.id) {
        OpenPopup(query.id);
    }
    $.getJSON('data/musical-compositions.json', function (database) {
        for (var i = 0; i < database.item.length; i++) {
            $('.page-content-grid').append('<div class="page-content-grid-item hide" data-id="' + database.item[i].id + '" style="flex: ' + Math.random() + ' 0 ' + (250 + (Math.random() * 250)) + 'px;"><img class="page-content-grid-item-image" src="img/musical-compositions/' + database.item[i].id + '/image.jpg" /><div class="page-content-grid-item-overlay"><h3 class="page-content-grid-item-overlay-heading">' + database.item[i].name + '</h1><small class="page-content-grid-item-overlay-meta">' + database.item[i].date + '</small></div></div>');
        }
        var counter = 0;
        (function FadeIn () {
            if (counter == database.item.length) return;
            setTimeout(function () {
                $('.page-content-grid-item:nth-of-type(' + (counter + 1) + ')').removeClass('hide');
                counter++;
                FadeIn();
            }, 75);
        })();
        $('.page-content-grid-item').click(function () {
            OpenPopup($(this).data('id'));
        });
        if (query.q) {
            SearchItems(query.q);
            $('.page-content-search-input').val(query.q).focus();
        }
    }).fail(function () {
        alert('Sorry! Could not load the webpage properly. Make sure you are connected to the Internet and then try refreshing the page.');
    });
    $(document).keydown(function (e) {
        if (e.keyCode === 27) {
            ClosePopup();
        }
        if (e.keyCode === 32) {
            ToggleAudio();
            e.preventDefault(); 
        }
    });
    $('.popup-content').click(function () {
        event.stopPropagation();
    });
    $('.popup, .popup-content-header-close').click(function () {
        ClosePopup();
    });
    
    $('.page-content-search-icon').click(function () {
        $('.page-content-search-input').focus();
    });
    
    $('.page-content-search-input').keyup(function () {
        SearchItems($(this).val());
        query.q = $(this).val();
        UpdateQueries();
    });
    
    $('.popup-content-header-toolbar-icon_play').click(function () {
        ToggleAudio();
    });
    audio.ontimeupdate = function () {
        $('.popup-content-header-toolbar-progress-time').text(ConvertTime(audio.currentTime) + ' / ' + ConvertTime(audio.duration));
        $('.popup-content-header-toolbar-progress-bar-played').css('width', audio.currentTime / audio.duration * 100 + '%');
        $('.popup-content-header-toolbar-progress-bar-loaded').css('width', audio.buffered.end(audio.buffered.length - 1) / audio.duration * 100 + '%');
    }
    
    function ToggleAudio () {
        if (play) {
            play = false;
            $('.popup-content-header-toolbar-icon_play').html('&#xf04b;');
            audio.pause();
        } else {
            play = true;
            $('.popup-content-header-toolbar-icon_play').html('&#xf04c;');
            audio.play();
        }
    }
    function ConvertTime (time) {
        var intTime = Math.ceil(time);
        var seconds = intTime % 60;
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        if (time >= 0) {
            return Math.floor(intTime / 60) + ':' + seconds;
        } else {
            return '0:00';
        }
    }
    function OpenPopup (id) {
        $.get('text/musical-compositions/' + id + '.txt', function (text) {
            $('.popup-content-header-image').attr('src', 'img/musical-compositions/' + id + '/cover.jpg');
            $('.popup-content-audio').html('<source src="audio/musical-compositions/' +id + '.mp3" type="audio/mp3" /><source src="audio/musical-compositions/' +id + '.ogg type="audio/ogg" />')
            $('.popup-content-body').html(marked(text));
            query.id = id;
            UpdateQueries();
            $('.popup').css('display', 'block');
            setTimeout(function () {$('.popup').addClass('open');}, 50);
            audio.load();
        }, 'text').fail(function () {
            alert('Sorry! Could not load the webpage properly. Make sure you are connected to the Internet and then try refreshing the page.');
        });
    }
    function ClosePopup () {
        query.id = '';
        UpdateQueries();
        $('.popup').removeClass('open');
        setTimeout(function () {$('.popup').css('display', 'none');}, 1001);
        audio.pause();
        play = false;
        $('.popup-content-header-toolbar-icon_play').html('&#xf04b;');
        $('.popup-content-header-toolbar-progress-bar-played').css('width', 0);
        $('.popup-content-header-toolbar-progress-bar-loaded').css('width', 0);
    }
    function UpdateQueries () {
        var queryString = '';
        for (var prop in query) {
            if (query[prop]) {
                queryString += prop + '=' + query[prop] + '&';
            }
        }
        window.history.replaceState('', 'Isaac Mailach - Musical Compositions', window.location.pathname + '?' + queryString);
    }
    function SearchItems (phrase) {
        $('.page-content-grid-item').each(function () {
            var item = this;
            if ($(this).text().search(new RegExp(phrase, "i")) < 0) {
                $(this).addClass('hide');
                setTimeout(function () {$(item).css('display', 'none');}, 501);
            } else {
                $(this).css('display', 'block');
                setTimeout(function () {$(item).removeClass('hide');}, 1);
            }
        });
    }
});