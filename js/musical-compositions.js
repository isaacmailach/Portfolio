$(document).ready(function () {
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
    var current_data = {};
    
    var search_input = document.querySelector('.page-content-search-input');
    var modal = document.querySelector('.modal');
    var modal_content = modal.querySelector('.modal-content');
    var audio = modal_content.querySelector('.modal-content-audio');
    var audio_sources = audio.getElementsByTagName('source');
    var modal_header_toolbar = modal_content.querySelector('.modal-content-header-toolbar');
    var play_button = modal_header_toolbar.querySelector('.modal-content-header-toolbar-player-play');
    var modal_player_time = modal_header_toolbar.querySelector('.modal-content-header-toolbar-player-time');
    
    var modal_content_J = $('.modal-content');
    
    $.getJSON('data/musical-compositions.json', function (database) {
        item_data = database.item;
        var item_template = document.querySelector('.page-content-grid-item_template');
        for (var i = 0; i < database.item.length; i++) {
            var temp_item_data = item_data[i];
            item_num[temp_item_data.id] = i;
            var item = document.createElement('div');
            item.className = 'page-content-grid-item hide';
            if (temp_item_data.align_top) {item.className += ' align-top';}
            item.setAttribute('tabindex', 0);
            item.dataset.num = i;
            if (temp_item_data.id == '0010') {
                item.setAttribute('style', 'flex-grow: 150;');
            } else {
                item.setAttribute('style', 'flex-grow: ' + parseInt(100 * Math.random()));
            }
            var template = document.importNode(item_template.content, true);
            template.querySelector('.page-content-grid-item-image').src = 'img/musical-compositions/' + temp_item_data.id + '/image.jpg';
            template.querySelector('.page-content-grid-item-overlay-heading').innerText = temp_item_data.name;
            template.querySelector('.page-content-grid-item-overlay-meta').innerText = temp_item_data.date;
            item.appendChild(template);
            item.setAttribute('title', temp_item_data.name);
            item.addEventListener('keydown', function (e) {
                if (!popup_open) {
                    if (e.keyCode === 37) {
                        this.previousSibling.focus();
                    } else if (e.keyCode === 39) {
                        this.nextSibling.focus();
                    }
                }
            });
            item.addEventListener('click', function () {
                SetModal(this.dataset.num);
            });
            document.querySelector('.page-content-grid').appendChild(item);
        }
        
        var counter = 0;
        var fade_in = setInterval(function () {
            document.querySelectorAll('.page-content-grid-item')[counter].classList.remove('hide');
            counter++;
            if (counter == database.item.length) {
                clearInterval(fade_in);
            }
        }, fade_in_delay);
        document.querySelector('.page-content-search').classList.remove('hide');
        CheckQueries();
    }).fail(function () {
        alert('Sorry! Could not load the webpage properly. Make sure you are connected to the Internet and then try refreshing the page.');
    });
    document.addEventListener('keydown', function (e) {
        var key = e.keyCode;
        if (key === 27 && popup_open) {
            CloseModal();
        } else if (key === 32 && popup_open) {
            ToggleAudio();
            e.preventDefault(); 
        } else if (key === 37 && popup_open) {
            NextItem();
        } else if (key === 39 && popup_open) {
            PreviousItem();
        } else if (key === 13) {
            document.activeElement.click();
        }
    });
    modal_content.addEventListener('click', function () {
        event.stopPropagation();
    });
    modal.addEventListener('click', CloseModal);
    modal_content.querySelector('.modal-content-header-close').addEventListener('click', CloseModal);
    
    document.querySelector('.page-content-search-icon').addEventListener('click', function () {
        search_input.focus();
    });
    var TypedSearch = _.debounce(function (query) {
        SearchItems(query);
    }, 300);
    search_input.addEventListener('keyup', function () {
        
        TypedSearch(this.value);
    });
    search_input.addEventListener('search', function () {
        SearchItems(this.value);
    });
    
    play_button.addEventListener('click', ToggleAudio);
    document.querySelector('.modal-arrow_left').addEventListener('click', function () {
        if (popup_open && next_item) {
            NextItem();
        }
        event.stopPropagation();
    });
    document.querySelector('.modal-arrow_right').addEventListener('click', function () {
        if (popup_open && previous_item) {
            PreviousItem();
        }
        event.stopPropagation();
    });
    modal_content_J.on('swiperight', function () {
        if (popup_open && next_item && document.documentElement.clientWidth <= 700) {
            NextItem();
        }
    });
    modal_content_J.on('swipeleft', function () {
        if (popup_open && previous_item && document.documentElement.clientWidth <= 700) {
            PreviousItem();
        }
    });
    audio.addEventListener('loadedmetadata', UpdateAudioTime, false);
    audio.onprogress = function () {
        modal_header_toolbar.querySelector('.modal-content-header-toolbar-player-progress-loaded').style.width = audio.buffered.end(audio.buffered.length - 1) / audio.duration * 100 + '%';
    }
    audio.ontimeupdate = function () {
        UpdateAudioTime();
        modal_header_toolbar.querySelector('.modal-content-header-toolbar-player-progress-played').style.width = audio.currentTime / audio.duration * 100 + '%';
    }
    audio.onended = function () {
        ToggleAudio();
    }
    modal_header_toolbar.querySelector('.modal-content-header-toolbar-player-progress').addEventListener('click', function (e) {
        audio.currentTime = ((e.pageX - $(this).offset().left) / $(this).innerWidth()) * audio.duration;
    });
    
    function UpdateAudioTime () {
        modal_player_time.innerText = ConvertTime(audio.currentTime) + ' / ' + ConvertTime(audio.duration);
    }
    function SetModal (num) {
        current_num = num;
        current_data = item_data[num];
        current_id = query.id = current_data.id;
        // FIX THIS
        UpdateQueries();
        if (popup_open) {
            ResetModal();
        } else {
            OpenModal();
        }
    }
    function ToggleAudio () {
        if (play) {
            play = false;
            play_button.innerHTML = '&#xf04b;';
            audio.pause();
        } else {
            play = true;
            play_button.innerHTML = '&#xf04c;';
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
    function UpdateModal () {
        current_id = item_data[current_num].id;
        var modal_header_image = modal_content.querySelector('.modal-content-header-image');
        modal_header_image.src = 'img/musical-compositions/' + current_id + '/cover.jpg';
        modal_header_image.previousSibling.setAttribute('srcset', 'img/musical-compositions/' + current_id + '/image.jpg');
        audio_sources[0].src = 'audio/musical-compositions/' + current_id + '.mp3';
        audio_sources[1].src = 'audio/musical-compositions/' + current_id + '.ogg';
        $('.modal-content-body').append('<h3>' + item_data[current_num].name + '</h3><small>' + item_data[current_num].date + '</small>' + '<h2>For ' + item_data[current_num].instrumentation + '</h2>');
        if (current_data.credit) {
            $('.modal-content-credit').text('Image by ' + current_data.credit + '.');
        }
        $('.page-content-grid-item[data-num=' + current_num + ']').addClass('page-content-grid-item_focus');
        audio.load();
        if (current_data.light) {
            $('.modal-content-header').addClass('light');
        } else {
            $('.modal-content-header').removeClass('light');
        }
        UpdateSocialLinks();
        $.get('text/musical-compositions/' + current_id + '.html', function (text) {
            $('.modal-content-body').append(text);
        });
    }
    function ClearModal () {
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
    function ResetModal () {
        CheckFirstLast();
        $('.modal-content').addClass('hide');
        setTimeout(function () {
            ClearModal();
            UpdateModal();
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
    function OpenModal () {
        $('.modal').css('pointer-events', 'auto');
        CheckFirstLast();
        UpdateModal();
        popup_open = true;
        $('.modal-content-header-close').focus();
        setTimeout(function () {$('.modal').addClass('open')}, 100);
    }
    function CloseModal () {
        $('.page-content-grid-item[data-num=' + current_num + ']').focus();
        $('.modal').removeClass('open');
        setTimeout(function () {
            ClearModal();
            $('.modal').css('pointer-events', 'none');
        }, 500);
        query.id = '';
        UpdateQueries();
        popup_open = false;
        current_num = null;
        current_id = null;
        current_data = {};
        next_item = false;
        previous_item = false;
    }
    function NextItem () {
        if (next_item) {
            SetModal(current_num - 1);
        }
    }
    function PreviousItem () {
        if (previous_item) {
            SetModal(current_num + 1);
        }
    }
    function UpdateSocialLinks () {
        var current_name = encodeURI(current_data.name);
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
        window.history.replaceState('', 'Isaac Mailach - Musical Compositions' + (query.id ? ' - ' + current_data.name : ''), window.location.pathname + queryString);
        document.title = 'Isaac Mailach - Musical Compositions' + (query.id ? ' - ' + current_data.name : '');
    }
    function SearchItems (phrase) {
        query.q = phrase;
        UpdateQueries();
        for (var i = 0; i < item_data.length; i++) {
            var search_item = $('[data-num="' + i + '"]');
            var search_item_data = item_data[i];
            search_item_data.old_pos = search_item.position();
            search_item_data.old_width = search_item.width();
            if (!search_item_data.hidden) {
                search_item_data.animate = true;
                search_item.css({animation: '', transform: '', transition: ''});
            } else {
                search_item_data.animate = false;
            }
        }
        for (var i = 0; i < item_data.length; i++) {
            var search_item = $('[data-num="' + i + '"]');
            var search_item_data = item_data[i];
            if (search_item.text().search(new RegExp(phrase, "i")) < 0) {
                search_item_data.hidden = true;
                search_item.css({'position': 'absolute', top: search_item_data.old_pos.top + 'px', left: search_item_data.old_pos.left + 'px', width: search_item_data.old_width + 'px'});
                search_item.addClass('hide_search');
            } else {
                search_item_data.hidden = false;
                search_item.css({'position': '', top: '', left: '', width: ''});
            }
        }
        for (var i = 0; i < item_data.length; i++) {
            var search_item = $('[data-num="' + i + '"]');
            var search_item_data = item_data[i];
            if (!search_item_data.hidden) {
                search_item_data.new_width = search_item.width();
                search_item.removeClass('hide_search');
                if (search_item_data.animate) {
                    search_item_data.new_pos = search_item.position();
                    search_item.css({transform: 'translate(' + (search_item_data.old_pos.left - search_item_data.new_pos.left) + 'px, ' + (search_item_data.old_pos.top - search_item_data.new_pos.top) + 'px) scale(' + (search_item_data.old_width / search_item_data.new_width) + ', 1)', transition: 'none'});
                }
            }
        }
        setTimeout(function () {
        for (var i = 0; i < item_data.length; i++) {
            var search_item = $('[data-num="' + i + '"]');
            var search_item_data = item_data[i];
            if (!search_item_data.hidden) {
                search_item.css({animation: 'search_animate 0.5s cubic-bezier(0.4, 0, 0.2, 1)'});
            }
        }
        }, 1);
        setTimeout(function () {
            for (var i = 0; i < item_data.length; i++) {
                var search_item = $('[data-num="' + i + '"]');
                var search_item_data = item_data[i];
                if (!search_item_data.hidden) {
                    search_item.css({animation: '', transform: '', transition: ''});
                }
            }
        }, 501);
    }
    function CheckQueries () {
        var subString = window.location.search.substring(1).split('&');
        query = {id: '', q: ''};
        for (var i = 0; i < subString.length; i++) {
            var vars = subString[i].split('=');
            query[vars[0]] = vars[1];
        }
        if (query.id) {
            SetModal(item_num[query.id]);
        }
        if (query.q) {
            var query_text = decodeURI(query.q);
            SearchItems(query_text);
            search_input.value = query_text;
        }
    }
});
