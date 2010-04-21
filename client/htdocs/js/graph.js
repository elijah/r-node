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
 * An ExtJS widget to show a R graph, and provide tools to manipulate
 * that graph.
 */
Ext.ns('rui.ux');

rui.ux.Graph = Ext.extend(Ext.Panel, {

    renderGraph: function () {
        if (this.graphDivWrapper.rendered) {
            rui.R.graph (this.robject, this.graphDiv, {
                width: this.graphDivWrapper.getWidth()
                , height: this.graphDivWrapper.getHeight()
            });
        } 
    },

    initComponent: function () {

        this.graphDiv = Ext.id();
        this.graphDivWrapper = new Ext.BoxComponent({
            region: 'center'
            , autoEl: {
                id: this.graphDiv
                , tag: 'div'
                , cls: 'graph'
            }
            , listeners: {
                render: function () { this.renderGraph(); }.createDelegate(this)
            }
        });

        Ext.apply (this, {
            layout: 'border'
            , items: [
                this.graphDivWrapper
            ]
            , buttons: [
                {
                    text: 'Download'
                    , handler: function () {
                        rui.download( "/download/?sid=" + rui.R.sid, { svg: Ext.get(this.graphDiv).dom.innerHTML });
                    }.createDelegate (this)
                }
            ]
        });

        // Redraw when resized. Ensure we watch the right object
        // when resizing.
        var resizer = function () { 
            this.renderGraph.defer (1, this);
        };
        this.graphDivWrapper.on('resize', resizer, this);

        rui.ux.Graph.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('rui-graph', rui.ux.Graph);


