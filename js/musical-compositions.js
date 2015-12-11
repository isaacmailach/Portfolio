$(document).ready(function () {
    var audio = $('.modal-content-audio')[0];
    var play = false;
    var query = {};
    var subString = window.location.search.substring(1).split('&');
    var item_data = {};
    var current_url = 'http%3A%2F%2Fisaacmailach.im';
    var fade_in_delay = 75;
    var popup_open = false;
    var next_item = false;
    var previous_item = false;
    var current_id = null;
    var current_id_int = null;
    
    for (var i = 0; i < subString.length; i++) {
        var vars = subString[i].split('=');
        query[vars[0]] = vars[1];
    }
    $.getJSON('data/musical-compositions.json', function (database) {
        for (var i = 0; i < database.item.length; i++) {
            item_data[database.item[i].id] = database.item[i];
            $('.page-content-grid').append('<div class="page-content-grid-item hide" tabindex="0" data-id="' + database.item[i].id + '" style="flex-grow: ' + Math.random() + ';"><img class="page-content-grid-item-image" src="img/musical-compositions/' + database.item[i].id + '/image.jpg" /><div class="page-content-grid-item-overlay"><h3 class="page-content-grid-item-overlay-heading">' + database.item[i].name + '</h1><small class="page-content-grid-item-overlay-meta">' + database.item[i].date + '</small></div></div>');
            if (i === database.item.length - 1) {
                $('.page-content-grid-item').click(function () {
                    OpenPopup($(this).data('id'));
                });
                $('.page-content-grid-item').bind('keyup', function(e) {
                    if (e.keyCode === 13 && !popup_open     ) {
                        OpenPopup($(this).data('id'));
                    }
                });
                if (query.id) {
                    OpenPopup(query.id);
                }
            }
        }
        var counter = 0;
        (function FadeIn () {
            if (counter == database.item.length) return;
            setTimeout(function () {
                $('.page-content-grid-item:nth-of-type(' + (counter + 1) + ')').removeClass('hide');
                counter++;
                FadeIn();
            }, fade_in_delay);
        })();
        $('.page-content-search').removeClass('hide');
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
        } else if (e.keyCode === 32) {
            ToggleAudio();
            e.preventDefault(); 
        } else if (e.keyCode === 37 && popup_open && next_item) {
            NextItem();
        } else if (e.keyCode === 39 && popup_open && previous_item) {
            PreviousItem();
        }
    });
    $('.modal-content').click(function () {
        event.stopPropagation();
    });
    $('.modal, .modal-content-header-close-icon').click(function () {
        ClosePopup();
    });
    $('.modal-content-header-close').bind('keyup', function(e) {
        if (e.keyCode === 13) {
            ClosePopup();
        }
    });
    
    $('.page-content-search-icon').click(function () {
        $('.page-content-search-input').focus();
    });
    $(document).scroll(function (e) {
        e.preventDefault();
    });
    
    $('.page-content-search-input').keyup(function () {
        SearchItems($(this).val());
        query.q = $(this).val();
        UpdateQueries();
    });
    
    $('.modal-content-header-toolbar-icon_play').click(function () {
        ToggleAudio();
    });
    $('.modal-content-header-toolbar-icon_play').bind('keyup', function(e) {
        if (e.keyCode === 13) {
            ToggleAudio();
        }
    });
    audio.ontimeupdate = function () {
        $('.modal-content-header-toolbar-progress-time').text(ConvertTime(audio.currentTime) + ' / ' + ConvertTime(audio.duration));
        $('.modal-content-header-toolbar-progress-bar-played').css('width', audio.currentTime / audio.duration * 100 + '%');
        $('.modal-content-header-toolbar-progress-bar-loaded').css('width', audio.buffered.end(audio.buffered.length - 1) / audio.duration * 100 + '%');
    }
    audio.onended = function () {
        ToggleAudio();
    }
    $('.modal-content-header-toolbar-progress-bar').click(function (e) {
        audio.currentTime = ((e.pageX - $(this).offset().left) / $(this).innerWidth()) * audio.duration;
    });
    
    function ToggleAudio () {
        if (play) {
            play = false;
            $('.modal-content-header-toolbar-icon_play').html('&#xf04b;');
            audio.pause();
        } else {
            play = true;
            $('.modal-content-header-toolbar-icon_play').html('&#xf04c;');
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
    function UpdatePopup () {
        $('.modal-content-header-image').attr('src', 'img/musical-compositions/' + current_id + '/cover.jpg');
        $('.modal-content-audio').html('<source src="audio/musical-compositions/' + current_id + '.mp3" type="audio/mp3" /><source src="audio/musical-compositions/' + current_id + '.ogg type="audio/ogg" />');
        $('.modal-content-body').append('<h3>' + item_data[current_id].name + '</h3><small>' + item_data[current_id].date + '</small>');
        if (item_data[current_id].credit) {
            $('.modal-content-credit').text('Image by ' + item_data[current_id].credit + '.');
        }
        query.id = current_id;
        UpdateQueries();
        audio.load();
        if (item_data[current_id].dark) {
            $('.modal-content-header').addClass('white');
        } else {
            $('.modal-content-header').removeClass('white');
        }
        UpdateSocialLinks();
        $.get('text/musical-compositions/' + current_id + '.html', function (text) {
            $('.modal-content-body').append(text);
        });
    }
    function ClearPopup () {
        if (play) {
            ToggleAudio();
        }
        $('.modal-content-header-toolbar-icon_play').html('&#xf04b;');
        setTimeout(function () {
            $('.modal-content-header-toolbar-progress-bar-played').css('width', 0);
            $('.modal-content-header-toolbar-progress-bar-loaded').css('width', 0);
        }, 1);
        $('.modal-content-body').empty();
        $('.modal-content-credit').empty();
    }
    function ResetPopup () {
        $('.modal-content').addClass('hide');
        if (current_id_int == Object.keys(item_data).length + 1) { // Temporary fix
            next_item = false;
        } else {
            next_item = true;
        }
        if (current_id_int == 2) {
            previous_item = false;
        } else {
            previous_item = true;
        }
        setTimeout(function () {
            ClearPopup();
            UpdatePopup();
        }, 501);
        setTimeout(function () {
            $('.modal-content').removeClass('hide');
        }, 601);
    }
    function OpenPopup (id) {
        current_id = id;
        current_id_int = parseInt(id);
        if (current_id_int == Object.keys(item_data).length + 1) { // Temporary fix
            next_item = false;
        } else {
            next_item = true;
        }
        if (current_id_int == 2) {
            previous_item = false;
        } else {
            previous_item = true;
        }
        UpdatePopup();
        popup_open = true;
        $('.modal').css('display', 'block');
        setTimeout(function () {$('.modal').addClass('open');}, 100);
    }
    function ClosePopup () {
        query.id = '';
        UpdateQueries();
        $('.modal').removeClass('open');
        setTimeout(function () {
            $('.modal').css('display', 'none');
            ClearPopup();
        }, 501);
        popup_open = false;
        current_id = null;
        current_id_int = null;
    }
    function NextItem () {
        current_id = ConvertToId(current_id_int + 1);
        current_id_int = current_id_int + 1;
        ResetPopup();
    }
    function PreviousItem () {
        current_id = ConvertToId(current_id_int - 1);
        current_id_int = current_id_int - 1;
        ResetPopup();
    }
    function UpdateSocialLinks () {
        $('.modal-content-header-toolbar-share-icon_facebook').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + current_url + '%3Fid%3D' + current_id + '&t=' + item_data[current_id].name);
        $('.modal-content-header-toolbar-share-icon_google').attr('href', 'https://plus.google.com/share?url=' + current_url + '%3Fid%3D' + current_id);
        $('.modal-content-header-toolbar-share-icon_pinterest').attr('href', 'https://www.pinterest.com/pin/create/button/?url=' + current_url + '%3Fid%3D' + current_id + '&media=' + current_url + '%2Fimg%2Fmusical-compositions%2F' + current_id + '%2Fimage.jpg&description=' + item_data[current_id].name);
        $('.modal-content-header-toolbar-share-icon_linkedin').attr('href', 'https://www.linkedin.com/shareArticle?mini=true&url=' + current_url + '%3Fid%3D' + current_id + '&title=' + item_data[current_id].name);
        $('.modal-content-header-toolbar-share-icon_tumblr').attr('href', 'https://www.tumblr.com/share/link?url=' + current_url + '%3Fid%3D' + current_id + '&name=' + item_data[current_id].name);
        $('.modal-content-header-toolbar-share-icon_twitter').attr('href', 'https://twitter.com/share?url=' + current_url + '%3Fid%3D' + current_id + '&text=' + item_data[current_id].name);
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
    function ConvertToId (num) {
        if (num < 10) {
            return "000" + num;
        } else if (num >= 10 && num < 100) {
            return "00" + num;
        } else if (num >= 100 && num < 1000) {
            return "0" + num;
        } else {
            return num;
        }
    }
    if (query.id) {
        OpenPopup(query.id);
    }
});
