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

// Variable to hold request
var request;

$(function() {

    $('#login_submit').on('click', function(e) {

        // Prevent default posting of form - put here to work in case of errors
        var username = $("#username_login").val();
        var password = $('#password_login').val();
        $("#span_login").text("");
        $("#span_login").removeClass("alert alert-danger");
        if(username && password)
        { 
        // Abort any pending request
        if (request) {
            request.abort();
        }
        // setup some local variables
        var $form = $('#login_form');

        // Let's select and cache all the fields
        var $inputs = $form.find("input, select, button, textarea");

        // Serialize the data in the form
        var serializedData = $form.serialize();

        // Let's disable the inputs for the duration of the Ajax request.
        // Note: we disable elements AFTER the form data has been serialized.
        // Disabled form elements will not be serialized.
        $inputs.prop("disabled", true);

        // Fire off the request to /form.php
        request = $.ajax({
            url: "/login",
            type: "POST",
            data: serializedData,
            success: function(response) {
                if(!response.error)
                {
                    alert("Logged in successfully");
                    $('#modalLoginForm').modal('hide');
                    location.reload();
                }
                else
                {
                    $("#span_login").addClass("alert alert-danger");
                    $("#span_login").text(response.error);
                    $('#modalLoginForm').modal('show');
                    $inputs.prop("disabled", false);
                }              
            },
            error: function(e) {
                alert("An error has occurred");              
            }
        });
    }
    });

});


$(function() {
    $('#signup_submit').on('click', function(e) 
    {
        var username = $("#username_signup").val();
        var password = $('#password_signup').val();
        $("#span-signup").text("");
        $("#span-signup").removeClass("alert alert-danger");
        if(username && password)
        { 
        // Abort any pending request
        if (request) {
            request.abort();
        }
        // setup some local variables
        var $form = $('#signup_form');

        // Let's select and cache all the fields
        var $inputs = $form.find("input, select, button, textarea");

        // Serialize the data in the form
        var serializedData = $form.serialize();

        // Let's disable the inputs for the duration of the Ajax request.
        // Note: we disable elements AFTER the form data has been serialized.
        // Disabled form elements will not be serialized.
        $inputs.prop("disabled", true);

        // Fire off the request to /form.php
        request = $.ajax({
            url: "/register",
            type: "POST",
            data: serializedData,
            success: function(response) {
                if(!response.error)
                {
                    $('#modalSignUpForm').modal('hide');
                    alert("Signed up successfully");                                       
                }
                else
                {
                    $("#span-signup").addClass("alert alert-danger");
                    $("#span-signup").text(response.error);
                    $('#modalSignUpForm').modal('show');
                    $inputs.prop("disabled", false);
                }              
            },
            error: function(e) {
                alert("An error has occurred");              
            }
        });
       
    }
    });
});