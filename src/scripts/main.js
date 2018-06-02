/* MAIN.JS
 * --------------------------------------------------
 *  Example JS file with best practices based on a 
 *  podcast from DevTips:
 *  https://www.youtube.com/watch?v=RMiTxHba5fo 
 *  
 *  !IMPORTANT!
 *  gulp-purgecss will remove css for classes that are 
 *  added with JS. You can whitelist these classes 
 *  by adding them in gulpfile.js [line 171]
 * -------------------------------------------------- */

(function($) {
    // initiate variables
    var count,
        hello,
        smiley,
        $clicks,
        $nav,
        $body; // i use '$' before a variable when it's a selector
    
    function handleBodyClick() {
        count+=1;
        $clicks.addClass('is--active');
        $clicks.html('You clicked ' + count + ((count != 1) ? ' times':' time') + '!');
    }

    // prevent parent from being notified from event
    function stopProp(e) {
        e.stopPropagation();
    }

    // event bindings
    function bindings() {
        console.log(hello + smiley);
        $nav.on('click', stopProp);
        $body.on('click', handleBodyClick);
    }

    $(document).ready(function() {
        // assign variables when DOM is ready
        hello = 'Hi';
        smiley = ' :)';
        count = 0;
        $clicks = $('.clicks');
        $nav = $('nav ul li a');
        $body = $('body');

        // execute bindings 
        bindings();
    });
})(jQuery);

