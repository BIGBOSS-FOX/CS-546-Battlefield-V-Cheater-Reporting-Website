jQuery('body').bind('click', function(e) {
    console.log("Clicked!");
    if (jQuery(e.target).closest('.navbar').length < 1) {
        // click happened outside of .navbar, so hide
        var opened = jQuery('.navbar-collapse').hasClass('collapse show');
        if (opened === true) {
            jQuery('.navbar .navbar-collapse').collapse('hide');
        }
    }
});