$(document).ready(function () {
    var query = {};
    var subString = window.location.search.substring(1).split('&');
    var item_data = {};
    var current_url = 'http%3A%2F%2Fisaacmailach.im%2Fblog.html';
    
    for (var i = 0; i < subString.length; i++) {
        var vars = subString[i].split('=');
        query[vars[0]] = vars[1];
    }
    $.getJSON('data/blog.json', function (database) {
        for (var i = 0; i < database.item.length; i++) {
            item_data[database.item[i].post] = database.item[i];
            $('.page-content-aside').append('<a class="page-content-aside-item hide" data-post="' + database.item[i].post + '">' + database.item[i].name + '<time class="page-content-aside-item-date">' + database.item[i].date + '</time></a>');
            if (i < 3) {
                $.get('text/blog/' + database.item[i].post + '.html', function (text) {
                    $('.page-content-articlebox').append('<article class="page-content-articlebox-article hide">' + text + '</article>');
                    var hidden_elements = $('.hide');
                    var fade_in_delay = 75;
                    var counter = 0;
                    (function FadeIn () {
                        if (counter == hidden_elements.length) return;
                        setTimeout(function () {
                            $(hidden_elements[counter]).removeClass('hide');
                            counter++;
                            FadeIn();
                        }, fade_in_delay);
                    })();
                });
            }
        }
        if (query.q) {
            SearchItems(query.q);
            $('.page-content-search-input').val(query.q).focus();
        }
        $('.page-content-aside-item').click(function () {
            OpenPost($(this).data('post'));
        });
        if (query.post) {
            OpenPost(query.post);
        }
    }).fail(function () {
        alert('Sorry! Could not load the webpage properly. Make sure you are connected to the Internet and then try refreshing the page.');
    });
    
    $('.page-content-aside-search-icon').click(function () {
        $('.page-content-aside-search-inputbox-input').focus();
    });
    $('.page-content-aside-search-inputbox-input').focus(function () {
        $('.page-content-aside-search-icon').addClass('page-content-aside-search-icon_focus');
    });
    $('.page-content-aside-search-inputbox-input').focusout(function () {
        $('.page-content-aside-search-icon').removeClass('page-content-aside-search-icon_focus');
    });
    $('.page-content-aside-search-inputbox-input').keyup(function () {
        SearchItems($(this).val());
    });
    function OpenPost (post) {
        $('.page-content-articlebox-article').addClass('hide');
        setTimeout(function () {
            $('.page-content-articlebox').empty();
            $.get('text/blog/' + post + '.html', function (text) {
                $('.page-content-articlebox').html('<article class="page-content-articlebox-article hide">' + text + '</article>');
                setTimeout(function () {$('.page-content-articlebox-article').removeClass('hide');}, 1);
            });
        }, 280);
        query.post = post;
        UpdateQueries();
    }
    function SearchItems (phrase) {
        $('.page-content-aside-item').each(function () {
            var item = this;
            if ($(this).text().search(new RegExp(phrase, "i")) < 0) {
                $(this).addClass('hide');
                setTimeout(function () {$(item).css('display', 'none');}, 280);
            } else {
                $(this).css('display', 'block');
                setTimeout(function () {$(item).removeClass('hide');}, 1);
            }
        });
    }
    function UpdateQueries () {
        var queryString = '';
        for (var prop in query) {
            if (query[prop]) {
                queryString += prop + '=' + query[prop] + '&';
            }
        }
        window.history.replaceState('', 'Isaac Mailach - Blog', window.location.pathname + '?' + queryString);
    }
});