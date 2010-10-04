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

    Ext.Ajax.on('requestexception', function (conn, response, options) {
        if (response.status == 403) {
            console.log(options);
            rui.login (function () { 
                var u = options.url.replace (/sid=[a-z0-9]+/, "sid=" + rui.R.sid);
                options.url = u;
                Ext.Ajax.request(options);
            });
        }
    });

    Ext.Ajax.request({
        url: '__authmethods',
        success: function (xhr, options) {
            rui.pageLoadMask.hide();
            rui.loginAuthMethod = xhr.responseText;
            rui.login (function () {
                rui.console.enableConsole (true);
                rui.objectTree.root.expand();
            });
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

    rui.scratchpad = new rui.ux.ScratchPad ({
        title: '*scratch*'
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
            url: '/_R/objects'
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

    var graphChangeCallback = function (ok, response, options) {
        if (!ok) {
            Ext.Msg.show ({
                title: 'Cannot configure server',
                msg: '<b>Cannot configure server graph output format. Received:</b> ' + response.responseText,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR
            });
        }
    };

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
                                xtype: 'tbbutton',
                                text: 'Graphs',
                                menu: [
                                    {
                                        text: 'Use SVG when available'
                                        , checked: rui.R.graphUsingProtovis
                                        , xtype: 'menucheckitem'
                                        , handler: function (b) {
                                            var x = rui.R.graphUsingProtovis ? false : true;
                                            rui.R.setGraphFormat (null, x, graphChangeCallback);
                                        }
                                    },
                                    {
                                        text: 'Output format'
                                        , menu: [
                                            {
                                                text: 'PNG'
                                                , xtype: 'menucheckitem'
                                                , checked: true
                                                , group: 'graphOutputFormat'
                                                , handler: function () {
                                                    rui.R.setGraphFormat ('png', null, graphChangeCallback);
                                                }
                                            },
                                            {
                                                text: 'TIFF'
                                                , xtype: 'menucheckitem'
                                                , group: 'graphOutputFormat'
                                                , handler: function () {
                                                    rui.R.setGraphFormat ('tiff', null, graphChangeCallback);
                                                }
                                            },
                                            {
                                                text: 'PDF'
                                                , xtype: 'menucheckitem'
                                                , group: 'graphOutputFormat'
                                                , handler: function () {
                                                    rui.R.setGraphFormat ('pdf', null, graphChangeCallback);
                                                }
                                            },
                                            {
                                                text: 'JPEG'
                                                , xtype: 'menucheckitem'
                                                , group: 'graphOutputFormat'
                                                , handler: function () {
                                                    rui.R.setGraphFormat ('jpeg', null, graphChangeCallback);
                                                }
                                            },
                                            {
                                                text: 'BMP'
                                                , xtype: 'menucheckitem'
                                                , group: 'graphOutputFormat'
                                                , handler: function () {
                                                    rui.R.setGraphFormat ('bitmap', null, graphChangeCallback);
                                                }
                                            }
                                       ]
                                    }
                                ]
                                
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
            , new Ext.TabPanel ({
                region: 'center'
                , activeTab: 0
                , border: false
                , deferredRender: false
                , items: [
                    rui.console
                    , rui.scratchpad
                ]
            })
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
