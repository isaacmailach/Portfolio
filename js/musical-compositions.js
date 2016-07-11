$(document).ready(function () {
    var audio = $('.modal-content-audio')[0];
    var play = false;
    var query = {};
    var item_data = {};
    var item_num = {};
    var current_url = 'https%3A%2F%2Fisaacmailach.im';
    var fade_in_delay = 75;
    var popup_open = false;
    var next_item = false;
    var previous_item = false;
    var current_id = null;
    var current_num = null;
    var old_id = '';
    var old_q = '';
    
    $.getJSON('data/musical-compositions.json', function (database) {
        item_data = database.item;
        var item_template = document.querySelector('.page-content-grid-item_template');
        var item_element_proto = Object.create(HTMLElement.prototype);
        item_element_proto.createdCallback = function () {
            this.className = 'page-content-grid-item hide';
            if (item_data[i].align_top) {this.className += ' align-top';}
            this.setAttribute('tabindex', 0);
            this.setAttribute('data-num', i);
            if (item_data[i].id == '0010') {
                this.setAttribute('style', 'flex-grow: 150;');
            } else {
                this.setAttribute('style', 'flex-grow: ' + parseInt(100 * Math.random()));
            }
            var template = document.importNode(item_template.content, true);
            template.querySelector('.page-content-grid-item-image').src = 'img/musical-compositions/' + item_data[i].id + '/image.jpg';
            template.querySelector('.page-content-grid-item-overlay-heading').innerText = item_data[i].name;
            template.querySelector('.page-content-grid-item-overlay-meta').innerText = item_data[i].date;
            this.appendChild(template);
        }
        var item_element = document.registerElement('page-content-grid-item', {prototype: item_element_proto});
        for (var i = 0; i < database.item.length; i++) {
            item_num[item_data[i].id] = i;
            var item = document.createElement('page-content-grid-item');
            $('.page-content-grid').append(item);
        }
        $('.page-content-grid-item').click(function () {
            current_num = $(this).data('num');
            query.id = item_data[current_num].id;
            UpdateQueries();
            OpenPopup();
        });
        $('.page-content-grid-item').bind('keyup', function(e) {
            if (e.keyCode === 13) {
                current_num = $(this).data('num');
                query.id = item_data[current_num].id;
                UpdateQueries();
                if (popup_open) {
                    ResetPopup();
                } else {
                    OpenPopup();
                }
            }
        });
        $('.page-content-grid-item').keydown(function (e) {
            if (!popup_open) {
                if (e.keyCode === 37) {
                    $(this).prev('.page-content-grid-item').focus();
                } else if (e.keyCode === 39) {
                    $(this).next('.page-content-grid-item').focus();
                }
            }
        });
        
        window.onpopstate = function (event) {
            CheckQueries();
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
        CheckQueries();
    }).fail(function () {
        alert('Sorry! Could not load the webpage properly. Make sure you are connected to the Internet and then try refreshing the page.');
    });
    $(document).keydown(function (e) {
        if (e.keyCode === 27) {
            query.id = '';
            UpdateQueries();
            ClosePopup();
        } else if (e.keyCode === 32 && popup_open) {
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
        query.id = '';
        UpdateQueries();
        ClosePopup();
    });
    $('.modal-content-header-close').bind('keyup', function(e) {
        if (e.keyCode === 13) {
            query.id = '';
            UpdateQueries();
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
        query.q = $(this).val();
        SearchItems_debounce($(this).val());
    });
    $('.page-content-search-input').on('search', function () {
        query.q = $(this).val();
        UpdateQueries();
        SearchItems($(this).val());
    });
    
    $('.modal-content-header-toolbar-player-play').click(function () {
        ToggleAudio();
    });
    $('.modal-content-header-toolbar-player-play').keyup(function(e) {
        if (e.keyCode === 13) {
            ToggleAudio();
        }
    });
    $('.modal-arrow_left').click(function () {
        if (popup_open && next_item) {
            NextItem();
        }
        event.stopPropagation();
    });
    $('.modal-arrow_right').click(function () {
        if (popup_open && previous_item) {
            PreviousItem();
        }
        event.stopPropagation();
    });
    $('.modal-content').on("swiperight", function () {
        if (popup_open && next_item) {
            NextItem();
        }
    });
    $('.modal').on("swipeleft", function () {
        if (popup_open && previous_item) {
            PreviousItem();
        }
    });
    audio.addEventListener('loadedmetadata', function () {
        $('.modal-content-header-toolbar-player-time').text(ConvertTime(audio.currentTime) + ' / ' + ConvertTime(audio.duration));
    }, false);
        audio.onprogress = function () {
        $('.modal-content-header-toolbar-player-progress-loaded').css('width', audio.buffered.end(audio.buffered.length - 1) / audio.duration * 100 + '%');
    }
    audio.ontimeupdate = function () {
        $('.modal-content-header-toolbar-player-time').text(ConvertTime(audio.currentTime) + ' / ' + ConvertTime(audio.duration));
        $('.modal-content-header-toolbar-player-progress-played').css('width', audio.currentTime / audio.duration * 100 + '%');
    }
    audio.onended = function () {
        ToggleAudio();
    }
    $('.modal-content-header-toolbar-player-progress').click(function (e) {
        audio.currentTime = ((e.pageX - $(this).offset().left) / $(this).innerWidth()) * audio.duration;
    });
    
    function ToggleAudio () {
        if (play) {
            play = false;
            $('.modal-content-header-toolbar-player-play').html('&#xf04b;');
            audio.pause();
        } else {
            play = true;
            $('.modal-content-header-toolbar-player-play').html('&#xf04c;');
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
        current_id = item_data[current_num].id;
        $('.modal-content-header-image').attr('src', 'img/musical-compositions/' + current_id + '/cover.jpg');
        $('.modal-content-header-image').prev('source').attr('srcset', 'img/musical-compositions/' + current_id + '/image.jpg');
        $('.modal-content-audio').html('<source src="audio/musical-compositions/' + current_id + '.mp3" type="audio/mp3" /><source src="audio/musical-compositions/' + current_id + '.ogg" type="audio/ogg" />');
        $('.modal-content-body').append('<h3>' + item_data[current_num].name + '</h3><small>' + item_data[current_num].date + '</small>' + '<h2>For ' + item_data[current_num].instrumentation + '</h2>');
        if (item_data[current_num].credit) {
            $('.modal-content-credit').text('Image by ' + item_data[current_num].credit + '.');
        }
        $('.page-content-grid-item[data-num=' + current_num + ']').addClass('page-content-grid-item_focus');
        $('.modal-content-header-close').focus();
        audio.load();
        if (item_data[current_num].dark) {
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
            $('.modal-content-header-toolbar-player-progress-played, .modal-content-header-toolbar-player-progress-loaded').css('width', 0);

        }, 1);
        $('.modal-content-body').empty();
        $('.modal-content-credit').empty();
        $('.page-content-grid-item[data-num!=' + current_num + ']').removeClass('page-content-grid-item_focus');
    }
    function ResetPopup () {
        CheckFirstLast();
        $('.modal-content').addClass('hide');
        setTimeout(function () {
            ClearPopup();
            UpdatePopup();
        }, 501);
        setTimeout(function () {
            $('.modal-content').removeClass('hide');
        }, 601);
    }
    function CheckFirstLast () {
        if (current_num == 0) {
            next_item = false;
            $('.modal-arrow_left').addClass('modal-arrow_disabled');
        } else {
            next_item = true;
            $('.modal-arrow_left').removeClass('modal-arrow_disabled');
        }
        if (current_num == item_data.length - 1) {
            previous_item = false;
            $('.modal-arrow_right').addClass('modal-arrow_disabled');
        } else {
            previous_item = true;
            $('.modal-arrow_right').removeClass('modal-arrow_disabled');
        }
    }
    function OpenPopup () {
        $('.modal').css('pointer-events', 'auto');
        CheckFirstLast();
        UpdatePopup();
        popup_open = true;
        setTimeout(function () {$('.modal').addClass('open')}, 80);
    }
    function ClosePopup () {
        $('.page-content-grid-item[data-num=' + current_num + ']').focus();
        $('.modal').removeClass('open');
        setTimeout(function () {
            ClearPopup();
            $('.modal').css('pointer-events', 'none');
        }, 500);
        popup_open = false;
        current_num = null;
        current_id = null;
        next_item = false;
        previous_item = false;
    }
    function NextItem () {
        current_num -= 1;
        query.id = item_data[current_num].id;
        UpdateQueries();
        ResetPopup();
    }
    function PreviousItem () {
        current_num += 1;
        query.id = item_data[current_num].id;
        UpdateQueries();
        ResetPopup();
    }
    function UpdateSocialLinks () {
        var current_name = encodeURI(item_data[current_num].name);
        $('.modal-content-header-toolbar-share-icon_email').attr('href', 'mailto:?body=' + current_url + '%3Fid%3D' + current_id + '&subject=' + current_name);
        $('.modal-content-header-toolbar-share-icon_facebook').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + current_url + '%3Fid%3D' + current_id + '&t=' + current_name);
        $('.modal-content-header-toolbar-share-icon_google').attr('href', 'https://plus.google.com/share?url=' + current_url + '%3Fid%3D' + current_id);
        $('.modal-content-header-toolbar-share-icon_pinterest').attr('href', 'https://www.pinterest.com/pin/create/button/?url=' + current_url + '%3Fid%3D' + current_id + '&media=' + current_url + '%2Fimg%2Fmusical-compositions%2F' + current_id + '%2Fimage.jpg&description=' + current_name);
        $('.modal-content-header-toolbar-share-icon_linkedin').attr('href', 'https://www.linkedin.com/shareArticle?mini=true&url=' + current_url + '%3Fid%3D' + current_id + '&title=' + current_name);
        $('.modal-content-header-toolbar-share-icon_tumblr').attr('href', 'https://www.tumblr.com/share/link?url=' + current_url + '%3Fid%3D' + current_id + '&name=' + current_name);
        $('.modal-content-header-toolbar-share-icon_twitter').attr('href', 'https://twitter.com/share?url=' + current_url + '%3Fid%3D' + current_id + '&text=' + current_name);
    }
    function UpdateQueries () {
        var queryString = '';
        var queryLength = 0;
        for (var prop in query) {
            if (query[prop]) {
                queryLength++;
                if (queryLength == 1) {
                    queryString += '?';
                } else if (queryLength > 1) {
                    queryString += '&';
                }
                queryString += prop + '=' + query[prop];
            }
        }
        if (old_id !== query.id) {
            window.history.pushState('', 'Isaac Mailach - Musical Compositions' + (query.id ? ' - ' + item_data[item_num[query.id]].name : ''), window.location.pathname + queryString);
            document.title = 'Isaac Mailach - Musical Compositions' + (query.id ? ' - ' + item_data[item_num[query.id]].name : '');
            old_id = query.id;
        } else {
            window.history.replaceState('', 'Isaac Mailach - Musical Compositions', window.location.pathname + queryString);
            document.title = 'Isaac Mailach - Musical Compositions';
        }
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
        old_q = encodeURI(phrase);
    }
    var SearchItems_debounce = _.debounce(function (query) {
        UpdateQueries();
        SearchItems(query);
    }, 300);
    function CheckQueries () {
        var subString = window.location.search.substring(1).split('&');
        query = {id: '', q: ''};
        for (var i = 0; i < subString.length; i++) {
            var vars = subString[i].split('=');
            query[vars[0]] = vars[1];
        }
        if (old_id !== query.id) {
            old_id = query.id;
            current_num = item_num[query.id];
            if (!query.id) {
                ClosePopup();
            } else if (!popup_open) {
                OpenPopup();
            } else if (popup_open) {
                ResetPopup();
            }
        }
        if (old_q !== query.q) {
            SearchItems(decodeURI(query.q));
            $('.page-content-search-input').val(decodeURI(query.q));
        }
    }
});
