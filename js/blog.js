$(document).ready(function () {
    var query = {};
    var subString = window.location.search.substring(1).split('&');
    var item_data = {};
    var current_url = 'http%3A%2F%2Fisaacmailach.github.io%2FPortfolio%2Fblog.html';
    
    for (var i = 0; i < subString.length; i++) {
        var vars = subString[i].split('=');
        query[vars[0]] = vars[1];
    }
    var test = $.get('text/blog/0003.txt', function (text) {return text;});
    $.getJSON('data/blog.json', function (database) {
        for (var i = 0; i < database.item.length; i++) {
            item_data[database.item[i].id] = database.item[i];
            $('.page-content-aside').append('<a class="page-content-aside-item" data-id="' + database.item[i].id + '">' + database.item[i].name + '<time>' + database.item[i].date + '</time></a>');
            if (i < 3) {
                $.get('text/blog/' + database.item[i].id + '.txt', function (text) {
                    $('.page-content-articlebox').append('<article class="page-content-articlebox-article">' + marked(text) + '</article>');
                });
            }
        }
        //$('.page-content-articlebox').append('<article class="page-content-grid-item hide" data-id="' + database.item[i].id + '" style="flex: ' + Math.random() + ' 0 ' + (250 + (Math.random() * 250)) + 'px;"><img class="page-content-grid-item-image" src="img/musical-compositions/' + database.item[i].id + '/image.jpg" /><div class="page-content-grid-item-overlay"><h3 class="page-content-grid-item-overlay-heading">' + database.item[i].name + '</h1><small class="page-content-grid-item-overlay-meta">' + database.item[i].date + '</small></div></div>');
        $('.page-content-aside-search').removeClass('hide');
        if (query.q) {
            SearchItems(query.q);
            $('.page-content-search-input').val(query.q).focus();
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
        query.q = $(this).val();
        UpdateQueries();
    });
});