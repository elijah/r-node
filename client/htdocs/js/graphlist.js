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
 * An ExtJS widget to show a list of the graphs created by users.
 */
Ext.ns('rui.ux');

rui.ux.GraphList = Ext.extend(Ext.Panel, {

    graphs: []

    , addGraph: function(robject, originalCommand) {
        var id = Ext.id();
        var p = Ext.get(this.graphlistDiv);
        var el = p.insertHtml("beforeEnd", "<div id='" + id + "' class='carousel-item'></div>", true);

        rui.R.graph (robject, id, {
            width: Ext.get(id).getWidth()
            , height: Ext.get(id).getHeight()
            , small: true
        });
	
		
        this.graphs.push({
            robject: robject
            , originalCommand: originalCommand
            , id: id
        });

        el.on('click', function (event, el, o) {
            var del = true;
            var h = Ext.getBody().getHeight();
            var w = Ext.getBody().getWidth();
            var gw = new Ext.Window({
                  height: Math.floor(h > w ? w / 2 : h / 2)
                , width: Math.floor(h > w ? w / 2 : h / 2)
                , title: 'Plot'
                , layout: 'fit'
                , minimizable: true
                , items: [
                    new rui.ux.Graph ({
                        id: 'showngraph'
                        , robject: this.graphs[o.index].robject
                    })
                ]
                , listeners: {
                    minimize: function () {
                        del = false;
                        gw.close();
                    }
                    // Hide is used to mean 'close and delete graph'
                    // If we used close instead, we couldn't tell if we
                    // were closing to remove from the list of graphs or not
                    // (without a separate variable)
                    , close: function () {
                        if (del)
                            Ext.destroy(Ext.get(this.graphs[o.index].id));
                    }.createDelegate(this)
                }
            });
            gw.show();
            
        }, this, { index: this.graphs.length - 1 });
    }

    , initComponent: function () {
        this.graphlistDiv = Ext.id();

        Ext.apply (this, {
            layout: 'border'
            , items: [
                new Ext.BoxComponent({
                    region: 'center'
                    , autoEl: {
                        id: this.graphlistDiv
                        , tag: 'div'
                        , cls: 'carousel'
                    }
                })
            ]
        });

        rui.ux.GraphList.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('rui-graph-list', rui.ux.GraphList);

