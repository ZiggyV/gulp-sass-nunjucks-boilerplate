/* MAIN.JS
 * --------------------------------------------------
 *  Example JS file with best practices based on a 
 *  podcast from DevTips:
 *  https://www.youtube.com/watch?v=RMiTxHba5fo 
 *  
 *  !IMPORTANT!
 *  gulp-purgecss will remove css for classes that are 
 *  added with JS. You can whitelist these classes 
 *  by adding them in gulpfile.js [line 232]
 * -------------------------------------------------- */

(function($) {
    // initiate variables
    var count,
        hello,
        smiley,
        $clicks,
        $nav__link,
        nav,
        $link__dropdown,
        $nav__nested,
        $nav__trigger,
        $stopProp,
        $body; // i use '$' before a variable when it's a selector
    
    function handleBodyClick() {
        count+=1;
        $clicks.addClass('is-active');
        $clicks.html('You clicked ' + count + ((count != 1) ? ' times':' time') + '!');

        if ($nav__nested.hasClass('is-open')) {
            $nav__nested.toggleClass('is-closed');
            $nav__nested.toggleClass('is-open');
        }
    }

    function expandNav(e) {
        e.preventDefault();

        $nav__nested.toggleClass('is-closed');
        $nav__nested.toggleClass('is-open');
    }

    function expandMobileNav() {
        nav.toggleClass('m-open');
        nav.toggleClass('m-closed');
    }

    // prevent parent from being notified from event
    function stopProp(e) {
        e.stopPropagation();
    }

    // event bindings
    function bindings() {
        console.log(hello + smiley);

        $nav__link.on('click', stopProp);
        $nav__trigger.on('click', stopProp);
        $stopProp.on('click', stopProp);
        $link__dropdown.on('click', expandNav);
        $nav__trigger.on('click', expandMobileNav);
        $body.on('click', handleBodyClick);
    }

    $(document).ready(function() {
        // assign variables when DOM is ready
        hello = 'Hi';
        smiley = ' :)';
        count = 0;
        $clicks = $('.clicks');
        nav = $('nav');
        $nav__link = $('.nav__link');
        $link__dropdown = $('.link--dropdown');
        $nav__nested = $('.nav__nested');
        $nav__trigger = $('.nav__trigger');
        $stopProp = $('.stopProp');
        $body = $('body');

        // execute bindings 
        bindings();
    });
})(jQuery);

