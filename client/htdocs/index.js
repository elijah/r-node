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
                    rui.objectTree.root.expand();
                });
            } else if (xhr.responseText == "UserAndPassword") {
                new rui.ux.LoginWindow({
                    listeners: {
                        close: function () { // Current approach - if window closes, we're logged in!
                            rui.console.enableConsole (true);
                            rui.objectTree.root.expand();
                        }
                    }
                }).show();
            }
        }
    });

    Ext.Ajax.request({
        url: '__capabilities',
        success: function (xhr, options) {
            rui.serverCapabilities = Ext.util.JSON.decode(xhr.responseText);
        }
    });

    rui.console = new rui.ux.Console ({
          region: 'center'
          , title: 'R Console'
          , listeners: {
            rresponse: function (ok, data) {
                // If the console runs a command, reload the tree of objects, but only
                // if we've got an ok
                if (ok)
                    rui.objectTree.root.reload();
            }
          }
      });

    rui.graphList = new rui.ux.GraphList({
        height: 200
        , region: 'south'
        , split: true
        , title: 'Recent Graphs'
    });

    rui.objectTree = new Ext.tree.TreePanel ({
        useArrows: true
        , autoScroll: true
        , animate: true
        , containerScroll: true
        , border: false
        , loader: new Ext.tree.TreeLoader({
            url: '/R/objects'
            , requestMethod: 'GET'
            , listeners: {
                beforeload: function(treeLoader, node) {
                    treeLoader.baseParams.sid = rui.R.sid;
                }
            }
        })
        , root: {
            nodeType: 'async'
            , text: 'R'
            , id: 'root'
        }
        , tools: [
            {
                id: 'refresh'
                , handler: function(e, tool, tree, tc) {
                    tree.root.reload();
                }
            }
        ]
    })

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
                                xtype: 'tbbutton',
                                text: 'Upload Data',
                                handler: function () {
                                    if (!rui.serverCapabilities) {
                                        Ext.Msg.alert('Feature Unavailable', 'File upload unavailable at this time.');
                                    } else if (!rui.serverCapabilities['file-upload']) {
                                        Ext.Msg.alert('Feature Disabled', 'File upload has been disabled by the Administrator.');
                                    } else {
                                        new rui.ux.FileUpload().show();
                                    }
                                }
                            },
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
                width: 300
                , region: 'west'
                , split: true
                , title: 'R Session Objects'
                , layout: 'fit'
                , items: [
                    rui.objectTree
                ]
            }
            , rui.graphList
            , rui.console
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
