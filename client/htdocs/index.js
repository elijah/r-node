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

Ext.BLANK_IMAGE_URL = 'js/extjs/resources/images/default/s.gif';

Ext.onReady (function () {

    rui.pageLoadMask = new Ext.LoadMask(Ext.getBody(), {msg:"Loading..."});

    rui.pageLoadMask.show();

    Ext.Ajax.request({
        url: '__authmethods',
        success: function (xhr, options) {
            rui.pageLoadMask.hide();
            if (xhr.responseText == "None") {
                rui.R.connect ('', '', function (result) { // Even though we need no username/password, we still log in to get a session ID.
                    rui.console.enableConsole (true);
                });
            } else if (xhr.responseText == "UserAndPassword") {
                new rui.ux.LoginWindow({
                    listeners: {
                        close: function () { // Current approach - if window closes, we're logged in!
                            rui.console.enableConsole (true);
                        }
                    }
                }).show();
            }
        }
    });

    rui.console = new rui.ux.Console ({
                      region: 'center'
                      , title: 'R Console'
                  });

    var mainContainer = new Ext.Panel ({
        layout: 'border'
        , items: [
            new Ext.Panel ({
                  region: 'north'
                , height: 135
                , layout: 'vbox'
                , layoutConfig: {
                    align: 'stretch'
                }
                , items: [{
                        html: "<div id='banner'></div>"
                        , border: false
                    },
                    new Ext.Toolbar({
                        items: [
                            {
                               xtype: 'tbfill'
                            },
                            {
                                xtype: 'tbbutton',
                                text: 'Feedback',
                                handler: function () {
                                    new rui.ux.Feedback().show();
                                }
                            },
                            {
                                xtype: 'tbbutton',
                                text: 'Help',
                                menu: [
                                    {
                                        text: 'About'
                                        , handler: function () {
                                            Ext.Msg.alert ("About", "<a href='http://www.squirelove.net/r-node'>R-Node</a>, a web interface to <a href= 'http://www.r-project.org/'>R</a>.");
                                        }
                                    },
                                    {
                                        text: 'Recent Changes to R-Node'
                                        , handler: function () {
                                            rui.loadHelp ('recent-changes.txt');
                                        }
                                    },
                                    {
                                        text: 'R Instance Info'
                                        , handler: function () {
                                            rui.loadHelp ('__info');
                                        }
                                    },
                                    {
                                        text: 'R Command Help'
                                        , handler: function () {
                                            rui.loadHelp ('doc/index.html');
                                        }
                                    }
                                ]
                            }
                        ]
                    })
                ]
            }),
            {
                html: ""
                , width: 300
                , region: 'west'
                , split: true
                , title: 'Holding Area'
            },
            {
                html: "graphs"
                , height: 200
                , region: 'south'
                , split: true
                , title: 'Recent Graphs'
            },
            rui.console
        ]
    });

    var viewport = new Ext.Viewport({
        layout:'fit'
        , items:[ 
            mainContainer
        ]       
    });
    viewport.doLayout(false);    
});
