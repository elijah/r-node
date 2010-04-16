/**
 *  Copyright 2010 Jamie Love

 *  This file is part of the "R-Node Client".

 *  R-Node Client is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  R-Node Client is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.

 *  You should have received a copy of the GNU General Public License
 *  along with R-Node Client.  If not, see <http://www.gnu.org/licenses/>.

 * Functions specific to index.js
 */

Ext.ns ('rui');

rui.R = new rnode.R.API();
rui.savedPlots = [];

rui.commandHistory = [];
rui.currentCommandHistoryLocation = 0;

function addToConsole(t, isResponse, noHighlight) {
    if (isResponse) {
        if (Ext.isString (t))
            $('#console div').last().append ("<pre class='r-response'>" + t + "</pre>");
        else
            $('#console div').last().append ("<div class='r-response'>" + t.content + "</div>");
    } else {
        $('#console').append ("<div class='console-snippet'><pre class='r-request'>" + t + "</pre></div>");
    }
    if (!noHighlight && Ext.isString(t))
        sh_highlightElement($('#console pre').last()[0], sh_languages['r-syntax']);

    $("#console").animate({ scrollTop: $("#console").attr("scrollHeight") - $('#console').height() }, 100);
}

function plotGraph (robject) {
    rui.R.graph (robject, 'svgplot', {
        callback: function (ok) { $('#plottrigger').trigger('click'); }
    });
}

function addToCarousel (robject, originalCommand) {
    rui.savedPlots.push (robject);
    $('#mainCarousel').append ("<div class='carousel-item' title='" + encodeURIComponent(originalCommand.get()) + "' id='carouselitem" + rui.savedPlots.length + "'></div>");
    rui.R.graph (robject, "carouselitem" + rui.savedPlots.length, {
        small: true
    });
    $('#carouselitem' +  rui.savedPlots.length).click(function () { 
        rui.R.graph (robject, 'svgplot', {
            callback: function (ok) { $('#plottrigger').trigger('click'); }
        }) 
    });
}

function rResponseHandler(ok, data) {
    if (!ok) {
        addToConsole ("<b>" + data.message + "</b>", true, true);
    } else {
        if (data.response.plottable()) {
            try {
                plotGraph (data.response);
                addToCarousel(data.response, data.command);
            } catch (e) {
                alert ("Error plotting graph. Received Error: " + e);
            }
        } else {
            rui.R.formatForDisplay(data.response, function (s) { addToConsole (s, true); });
        }
        
    }
}

$(document).ready(function() {
    $('#entryfield').val('');
    $('#entryfield').keypress(function (e) {
        if (e.keyCode == 38) { // up key
             if (rui.currentCommandHistoryLocation > 0) {
                rui.currentCommandHistoryLocation--;
                $(this).val(rui.commandHistory[rui.currentCommandHistoryLocation]);
             } 
        } else if (e.keyCode == 40) { // down
             if (rui.currentCommandHistoryLocation < rui.commandHistory.length) {
                rui.currentCommandHistoryLocation++;
                if (rui.currentCommandHistoryLocation >= rui.commandHistory.length) {
                    $(this).val('');
                } else {
                    $(this).val(rui.commandHistory[rui.currentCommandHistoryLocation]);
                }
             } 
        } else if (e.keyCode == 13) {
            var q = $(this).val();
            addToConsole("> " + q, false);
            try {
                $(this).val('');
                rui.commandHistory.push (q);
                rui.currentCommandHistoryLocation++;
                rui.R.eval(q, rResponseHandler);
            } catch (e) {
                alert ("Error evaluating command: " + e);
            }
        }
    });

    $.ajax({
        url: "/blurb",
        success: function (data) {
            addToConsole (data, false, true);
        }
    });

    $("#plottrigger").fancybox({
        'scrolling': 'no',
        'titleShow': false,
        autoDimensions: false,
        autoScale: false,
        width: 800,
        height: 410,
        'onClosed': function () {
            $('#entryfield').val(''); // Not sure why we need this here, in theory it should work just with the entryfield's change handler.
            $('#entryfield').focus();
            $('#svgplot').html('');
            $('#plot').css( {'position': 'absolute', 'left': '-10000' });
        },
        onComplete: function () {
            $('#plot').css( {'position': 'relative', 'left': '0' });
        }
    });

    // Deal with login - 
    $('#entryfield').attr("disabled", "disabled");

    $('#loginbox').hide();
    $('#loginboxtrigger').fancybox ({
        scrolling: 'no',
        modal: true,
        onClosed: function () {
            $('#entryfield').focus();
        }
    });
    $('#loginboxbutton').click (function () {
        $.fancybox.showActivity();
        rui.R.connect ($('#loginboxuser').val(), $('#loginboxpass').val(), function (result) {
            $.fancybox.hideActivity();
            if (result) {
                $.fancybox.close();
                $('#loginbox').hide();
            } else {
                $('#loginboxpass').val('');
            }

        });
    });
    $('#loginboxpass').keypress(function (e) { if (e.keyCode == 13) $('#loginboxbutton').click(); });
    $('#loginboxuser').keypress(function (e) { if (e.keyCode == 13) $('#loginboxbutton').click(); });

    $.ajax({
        url: '__authmethods',
        success: function (method) {
            $('#entryfield').attr("disabled", "");
            if (method == "None") {
                rui.R.connect ('', '', function (result) { // Even though we need no username/password, we still log in to get a session ID.
                });
            } else if (method == "UserAndPassword") {
                $('#loginbox').show();
                $('#loginboxtrigger').trigger ('click');
                $('#loginboxuser').focus();
            }
        }
    });


    $('#downloadsvggraph').click (function () {
        $.download ( "/download/?sid=" + rui.R.sid, { sid: $('#svgplot').html() }, 'POST');
    });

    $.ajax({
        url: 'recent-changes.txt',
        success: function (data) {
            $.jGrowl(data.replace(/\n/g, '<br/>'), {
                header: 'Recent Changes',
                sticky: true
            });
        }
    });


    $('.slide-out-div').tabSlideOut({
        tabHandle: '.handle',                     //class of the element that will become your tab
        pathToTabImage: 'assets/feedback.png',    //path to the image for the tab //Optionally can be set using css
        imageHeight: '122px',                     //height of tab image           //Optionally can be set using css
        imageWidth: '40px',                       //width of tab image            //Optionally can be set using css
        tabLocation: 'left',                      //side of screen where tab lives, top, right, bottom, or left
        speed: 300,                               //speed of animation
        action: 'click',                          //options: 'click' or 'hover', action to trigger animation
        topPos: '200px',                          //position from the top/ use if tabLocation is left or right
        leftPos: '20px',                          //position from left/ use if tabLocation is bottom or top
        fixedPosition: false                      //options: true makes it stick(fixed position) on scroll
    });

    $('#feedbackbtn').click(function () {
        var feedback = $('#feedbacktxt').val();
        if (feedback.length > 0) {
            $.post ('/feedback', feedback);
        }
        $('#feedbacktxt').val('');
        $('.handle').click();
    });
});
