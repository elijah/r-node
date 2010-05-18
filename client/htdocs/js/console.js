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
 */

/*
 * An ExtJS wrapper around the R-Node R console.
 */
Ext.ns('rui.ux');

rui.ux.Console = Ext.extend(Ext.Panel, {

    consoleHistory: [],
    consoleHistoryPosition: 0,

    addToConsole: function(t, isResponse, noHighlight) {
        var c = Ext.get (this.consoleDivId);    
        if (isResponse) {
            if (Ext.isString (t))
                c.last().insertHtml ('beforeEnd', "<pre class='r-response'>" + t + "</pre>");
            else
                c.last().insertHtml ('beforeEnd', "<div class='r-response'>" + t.content + "</div>");
        } else {
            c.insertHtml ('beforeEnd', "<div class='console-snippet'><pre class='r-request'>" + t + "</pre></div>");
        }
        if (!noHighlight && Ext.isString(t)) {
            var pre = c.last().child('pre', true);
            sh_highlightElement(pre, sh_languages['r-syntax']);
        }

        c.scroll("b", c.getHeight());
    },

    enableConsole: function (e) {
        this.consoleInput.setDisabled(!e);
    },

    rResponseHandler: function(ok, data) {
        if (!ok) {
            this.addToConsole ("<b>" + data.message + "</b>", true, true);
        } else {
            if (data.response.plottable()) {
                try {
                    var h = Ext.getBody().getHeight();
                    var w = Ext.getBody().getWidth();
                    var gw = new Ext.Window({
                          height: Math.floor(h > w ? w / 2 : h / 2)
                        , width: Math.floor(h > w ? w / 2 : h / 2)
                        , title: 'Plot'
                        , layout: 'fit'
                        , minimizable: true
						, maximizable: true
                        , items: [
                            new rui.ux.Graph ({
                                id: 'showngraph'
                                , robject: data.response
                            })
                        ]
                        , listeners: {
                            minimize: function () {
                                rui.graphList.addGraph (data.response, data.command);
                                gw.close();
                            }
                        }
                    });
                    gw.show();
                } catch (e) {
                    alert ("Error plotting graph. Received Error: " + e);
                }
            } else {
                rui.R.formatForDisplay(data.response, function (s) { this.addToConsole (s, true); }.createDelegate(this) );
            }
        }

        this.fireEvent ('rresponse', ok, data);
    }

    , initComponent: function () {

        this.addEvents({ "rresponse" : true });

        this.consoleDivId = Ext.id();
        this.consoleInput = new Ext.form.TextField({
            region: 'south'
            , disabled: true
            , listeners: {
                specialkey: function (field, e) {
                    if (e.getKey() == e.ENTER) {
                        var q = field.getValue();
                        this.addToConsole("> " + q, false);
                        try {
                            field.setValue('');
                            this.consoleHistory.push (q);
                            this.consoleHistoryPosition = this.consoleHistory.length;
                            rui.R.eval(q, this.rResponseHandler.createDelegate(this), false);
                        } catch (e) {
                            alert ("Error evaluating command: " + e);
                        }
                    } else if (e.getKey() == e.UP) {
                        if (this.consoleHistoryPosition > 0) {
                            this.consoleHistoryPosition--;
                            field.setValue (this.consoleHistory[this.consoleHistoryPosition]);
                        }
                    } else if (e.getKey() == e.DOWN) {
                        if (this.consoleHistoryPosition < this.consoleHistory.length) {
                            this.consoleHistoryPosition++;
                            if (this.consoleHistoryPosition < this.consoleHistory.length) {
                                field.setValue (this.consoleHistory[this.consoleHistoryPosition]);
                            } else {
                                field.setValue('');
                            }
                        }
                    }

                }.createDelegate (this)
            }
        })

        Ext.apply (this, {
            layout: 'border'
            , items: [
                new Ext.BoxComponent({
                    region: 'center'
                    , autoEl: {
                        id: this.consoleDivId
                        , tag: 'div'
                        , cls: 'r-console'
                    }
                })
                , this.consoleInput
            ]
        });

        Ext.Ajax.request({
            url: "/blurb",
            success: function (response, options) {
                this.addToConsole (response.responseText, false, true);
            },
            scope: this
        });

        rui.ux.Console.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('rui-console', rui.ux.Console);
