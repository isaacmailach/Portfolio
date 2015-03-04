$(document).ready(function () {
    var hidden_elements = $('.hide');;
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