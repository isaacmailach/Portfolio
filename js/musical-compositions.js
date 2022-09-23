$(document).ready(function () {
    var play = false;
    var query = {};
    var item_data = {};
    var visible_item_data = [];
    var visible_item_num = {};
    var item_num = {};
    var current_url = 'https%3A%2F%2Fisaacmailach.im';
    var fade_in_delay = 75;
    var popup_open = false;
    var next_item = false;
    var previous_item = false;
    var first_item = null;
    var last_item = null;
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
            if (!item_data[i].name_shy) {
                item_data[i].name_shy = item_data[i].name;
            }
            var temp_item_data = item_data[i];
            item_num[temp_item_data.id] = i;
            if (!temp_item_data.hidden) {
                visible_item_data.push(temp_item_data);
                visible_item_num[temp_item_data.id] = visible_item_data.length - 1;
                var item = document.createElement('div');
                item.className = 'page-content-grid-item hide';
                if (temp_item_data.align_top) {item.className += ' align-top';}
                item.setAttribute('tabindex', 0);
                item.dataset.num = visible_item_data.length - 1;
                item.setAttribute('style', 'flex-grow: ' + parseInt(100 * Math.random()));
                var template = document.importNode(item_template.content, true);
                template.querySelector('.page-content-grid-item-image').src = 'img/musical-compositions/' + temp_item_data.id + '/image.jpg';
                template.querySelector('.page-content-grid-item-image').setAttribute('srcset', 'img/musical-compositions/' + temp_item_data.id + '/image.jpg, img/musical-compositions/' + temp_item_data.id + '/image-3x.jpg 2x');
                template.querySelector('.page-content-grid-item-image').setAttribute('alt', temp_item_data.name);
                template.querySelector('.page-content-grid-item-overlay-name').innerHTML = temp_item_data.name_shy;
                template.querySelector('.page-content-grid-item-overlay-date').innerText = temp_item_data.date;
                template.querySelector('.page-content-grid-item-overlay-instrumentation').innerText = 'For ' + temp_item_data.instrumentation;
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
        }

        var loaded_items = document.querySelectorAll('.page-content-grid-item');
        first_item = loaded_items[0].dataset.num;
        last_item = loaded_items[loaded_items.length -1].dataset.num;
        var counter = 0;
        var fade_in = setInterval(function () {
            loaded_items[counter].classList.remove('hide');
            counter++;
            if (counter === loaded_items.length) {
                clearInterval(fade_in);
            }
        }, fade_in_delay);
        document.querySelector('.page-content-search').classList.remove('hide');
        CheckQueries();
    }).fail(function () {
        OpenAlert("no-load");
       /*window.location.reload();*/
    });
    document.addEventListener('keydown', function (e) {
        var key = e.keyCode;
        if (key === 27) {
            CloseAlert('all');
            if (popup_open) {
                CloseModal();
            }
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

    document.querySelector('.alert_no-id .alert-content-close').addEventListener('click', function () {
        CloseAlert("no-id");
    });
    document.querySelector('.alert_no-load .alert-content-close').addEventListener('click', function () {
        CloseAlert("no-load");
    });

    document.querySelector('.page-content-search-icon').addEventListener('click', function () {
        search_input.focus();
    });
    var TypedSearch = debounce(function (query) {
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
        event.stopPropagation();
        if (popup_open && next_item) {
            NextItem();
        }
    });
    document.querySelector('.modal-arrow_right').addEventListener('click', function () {
        event.stopPropagation();
        if (popup_open && previous_item) {
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
        if (visible_item_data[num]) {
            current_num = num;
            current_data = visible_item_data[num];
            current_id = query.id = current_data.id;
            UpdateQueries();
            if (popup_open) {
                ResetModal();
            } else {
                OpenModal();
            }
        } else {
            OpenAlert("no-id");
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
        current_id = visible_item_data[current_num].id;
        var modal_header_image = modal_content.querySelector('.modal-content-header-image');
        modal_header_image.src = 'img/musical-compositions/' + current_id + '/cover.jpg';
        modal_header_image.previousSibling.setAttribute('srcset', 'img/musical-compositions/' + current_id + '/image-3x.jpg');
        audio_sources[0].src = 'audio/musical-compositions/' + current_id + '.mp3';
        audio_sources[1].src = 'audio/musical-compositions/' + current_id + '.ogg';
        $('.modal-content-body').append('<h3>' + visible_item_data[current_num].name_shy + '</h3><small>' + visible_item_data[current_num].date + '</small>' + '<h2>For ' + visible_item_data[current_num].instrumentation + '</h2>');
        if (current_data.credit) {
            $('.modal-content-credit').text('Image credit: ' + current_data.credit + '.');
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
            if (visible_item_data[current_num].video) {
                $('.modal-content-body').append('<div class="modal-content-body-video"><iframe src="https://www.youtube.com/embed/' + visible_item_data[current_num].video + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>')
            }
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
        if (current_num == visible_item_data.length - 1) {
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
        var previous_img = new Image();
        previous_img.src = 'img/musical-compositions/' + visible_item_data[parseInt(current_num) - 1].id + '/cover.jpg';
        var next_img = new Image();
        next_img.src = 'img/musical-compositions/' + visible_item_data[parseInt(current_num) + 1].id + '/cover.jpg';
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
            SetModal(parseInt(current_num) - 1);
            var img = new Image();
            img.src = 'img/musical-compositions/' + visible_item_data[parseInt(current_num) - 1].id + '/cover.jpg';
        }
    }
    function PreviousItem () {
        if (previous_item) {
            SetModal(parseInt(current_num) + 1);
            var img = new Image();
            img.src = 'img/musical-compositions/' + visible_item_data[parseInt(current_num) + 1].id + '/cover.jpg';
        }
    }
    function UpdateSocialLinks () {
        var current_name = encodeURI(current_data.name);
        $('.modal-content-header-toolbar-share-icon_email').attr('href', 'mailto:?body=' + current_url + '%3Fid%3D' + current_id + '&subject=' + current_name);
        $('.modal-content-header-toolbar-share-icon_facebook').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + current_url + '%3Fid%3D' + current_id + '&t=' + current_name);
        $('.modal-content-header-toolbar-share-icon_twitter').attr('href', 'https://twitter.com/share?url=' + current_url + '%3Fid%3D' + current_id + '&text=' + current_name);
        $('.modal-content-header-toolbar-share-icon_share').css('disply','none');
    }
    function OpenAlert (type) {
        $('.alert_' + type).css('pointer-events', 'auto');
        $('.alert_' + type).addClass('open');
        $('.alert_' + type + ' .alert-content-close').focus();
    }
    function CloseAlert (type) {
        if (type == "all") {
            $('.alert').css('pointer-events', 'none');
            $('.alert').removeClass('open');
        } else {
            $('.alert_' + type).css('pointer-events', 'none');
            $('.alert_' + type).removeClass('open');
        }
        if (type == "no-id" || type == "all") {
            query.id = '';
            UpdateQueries();
        }
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
        // Store current positions
        for (var i = 0; i < visible_item_data.length; i++) {
            var search_item = $('[data-num="' + i + '"]');
            var search_item_data = visible_item_data[i];
            search_item_data.old_pos = search_item.position();
            search_item_data.old_width = search_item.width();
            if (!search_item_data.hidden) {
                search_item_data.animate = true;
                search_item.css({animation: '', transform: '', transition: ''});
            } else {
                search_item_data.animate = false;
            }
        }
        // Hide items and store position for when they reappear
        // Make items re-appear
        for (var i = 0; i < visible_item_data.length; i++) {
            var search_item = $('[data-num="' + i + '"]');
            var search_item_data = visible_item_data[i];
            if (search_item.text().search(new RegExp(phrase, "i")) < 0) {
                search_item_data.hidden = true;
                search_item.css({'position': 'absolute', top: search_item_data.old_pos.top + 'px', left: search_item_data.old_pos.left + 'px', width: search_item_data.old_width + 'px'});
                search_item.addClass('hide_search');
            } else {
                search_item_data.hidden = false;
                search_item.css({'position': '', top: '', left: '', width: ''});
            }
        }
        // Make items appear in old positions using transforms
        for (var i = 0; i < visible_item_data.length; i++) {
            var search_item = $('[data-num="' + i + '"]');
            var search_item_data = visible_item_data[i];
            if (!search_item_data.hidden) {
                search_item_data.new_width = search_item.width();
                search_item.removeClass('hide_search');
                if (search_item_data.animate) {
                    search_item_data.new_pos = search_item.position();
                    search_item.css({transform: 'translate(' + (search_item_data.old_pos.left - search_item_data.new_pos.left) + 'px, ' + (search_item_data.old_pos.top - search_item_data.new_pos.top) + 'px) scale(' + (search_item_data.old_width / search_item_data.new_width) + ', 1)', transition: 'none'});
                }
            }
        }
        // Animate return to new position
        setTimeout(function () {
        for (var i = 0; i < visible_item_data.length; i++) {
            var search_item = $('[data-num="' + i + '"]');
            var search_item_data = visible_item_data[i];
            if (!search_item_data.hidden) {
                search_item.css({animation: 'search_animate 0.5s cubic-bezier(0.4, 0, 0.2, 1)'});
            }
        }
        }, 1);
        // Clear animations
        setTimeout(function () {
            for (var i = 0; i < visible_item_data.length; i++) {
                var search_item = $('[data-num="' + i + '"]');
                var search_item_data = visible_item_data[i];
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
            SetModal(visible_item_num[query.id]);
        }
    }

    function debounce(func, wait, immediate) {
      var timeout;
      return function executedFunction() {
        var context = this;
        var args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };
});
