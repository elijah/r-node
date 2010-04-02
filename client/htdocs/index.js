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
    rui.R.graph (robject, 'plot', {
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
        rui.R.graph (robject, 'plot', {
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
            } catch (e) {
                alert ("Error plotting graph. Received Error: " + e);
            }
            addToCarousel(data.response, data.command);
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
        'onClosed': function () {
            $('#entryfield').val(''); // Not sure why we need this here, in theory it should work just with the entryfield's change handler.
            $('#entryfield').focus();
            $('#plot').html('').hide();
        }
    });


    $('#loginboxuser').focus();
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
    $('#loginboxtrigger').trigger ('click');

});
